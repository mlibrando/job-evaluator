import Anthropic from '@anthropic-ai/sdk';
import type {
  JobRequirement,
  MatchLevel,
  RequirementAssessment,
  RequirementCategory,
  RequirementImportance,
  SubscoreBreakdown,
} from '@/types/evaluation';
import {
  computeMatchPercentage,
  computeOverallScore,
  computeSubscores,
  getPresentCategories,
} from './scoring';
import { withAIErrorHandling } from './errors';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Extraction is mechanical parsing of the job posting, so it runs on Haiku with
 * temperature 0 — this pass sets the requirement list every score is measured
 * against, so it gets the most consistency the API allows.
 */
const EXTRACTION_MODEL = 'claude-haiku-4-5';

/**
 * Assessment is the actual judgment call (is React->Vue adjacent or partial?),
 * so it runs on Sonnet with adaptive thinking. Note: sampling parameters like
 * `temperature` are rejected with a 400 on this model.
 */
const ASSESSMENT_MODEL = 'claude-sonnet-5';

const REQUIREMENT_CATEGORIES: readonly RequirementCategory[] = [
  'skill',
  'experience',
  'domain',
];
const REQUIREMENT_IMPORTANCES: readonly RequirementImportance[] = [
  'required',
  'preferred',
];
const MATCH_LEVELS: readonly MatchLevel[] = [
  'direct',
  'adjacent',
  'partial',
  'none',
];

export interface AnalyzeJobPostParams {
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
  resumeText: string;
}

export interface ExtractJobRequirementsParams {
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
}

export interface AssessResumeParams {
  jobTitle: string;
  requirements: JobRequirement[];
  resumeText: string;
}

/** The narrative half of the assessment, alongside the per-requirement calls. */
export interface ResumeAssessment {
  assessments: RequirementAssessment[];
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendations: string[];
  summary: string;
  keyInsights: string[];
}

export interface JobAnalysisResult extends ResumeAssessment {
  overallScore: number;
  matchPercentage: number;
  subscores: SubscoreBreakdown;
  requirements: JobRequirement[];
}

/**
 * Analyze a job posting against a resume.
 *
 * Makes exactly two model calls — extraction, then assessment — and computes
 * every number itself. Claude classifies; it never scores.
 */
export async function analyzeJobPost({
  jobTitle,
  jobDescription,
  companyName,
  resumeText,
}: AnalyzeJobPostParams): Promise<JobAnalysisResult> {
  const requirements = await extractJobRequirements({
    jobTitle,
    jobDescription,
    companyName,
  });

  const assessment = await assessResume({
    jobTitle,
    requirements,
    resumeText,
  });

  const subscores = computeSubscores(requirements, assessment.assessments);
  const overallScore = computeOverallScore(
    subscores,
    getPresentCategories(requirements)
  );
  const matchPercentage = computeMatchPercentage(
    requirements,
    assessment.assessments
  );

  return {
    ...assessment,
    overallScore,
    matchPercentage,
    subscores,
    requirements,
  };
}

/**
 * Pass 1: turn the job posting into a structured requirement list.
 *
 * Deliberately never receives the resume — if it did, the requirement list
 * could drift toward whatever the candidate happens to have, which would make
 * scores incomparable between candidates for the same role.
 */
export async function extractJobRequirements({
  jobTitle,
  jobDescription,
  companyName,
}: ExtractJobRequirementsParams): Promise<JobRequirement[]> {
  return withAIErrorHandling('extractJobRequirements', async () => {
    const message = await anthropic.messages.create({
      model: EXTRACTION_MODEL,
      max_tokens: 4096,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: buildExtractionPrompt({
            jobTitle,
            jobDescription,
            companyName,
          }),
        },
      ],
    });

    return parseRequirements(extractTextFromResponse(message));
  });
}

/**
 * Pass 2: classify the resume against each requirement, and produce the
 * narrative feedback.
 */
export async function assessResume({
  jobTitle,
  requirements,
  resumeText,
}: AssessResumeParams): Promise<ResumeAssessment> {
  return withAIErrorHandling('assessResume', async () => {
    const message = await anthropic.messages.create({
      model: ASSESSMENT_MODEL,
      // Thinking is on by default on this model and shares the max_tokens
      // budget with the response, so this is sized well above the JSON alone.
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium' },
      messages: [
        {
          role: 'user',
          content: buildAssessmentPrompt({ jobTitle, requirements, resumeText }),
        },
      ],
    });

    return parseAssessment(extractTextFromResponse(message), requirements);
  });
}

/**
 * Build the requirement-extraction prompt
 */
function buildExtractionPrompt({
  jobTitle,
  jobDescription,
  companyName,
}: ExtractJobRequirementsParams): string {
  return `You are an expert recruiter. Break the following job posting down into a structured list of discrete requirements.

# Job Posting

**Position**: ${jobTitle}
${companyName ? `**Company**: ${companyName}` : ''}

**Description**:
${jobDescription}

# Task

Extract 8-15 distinct requirements. Return them in the following JSON format:

\`\`\`json
{
  "requirements": [
    {
      "id": "<short-kebab-case-slug, unique within this list>",
      "text": "<the requirement in one specific sentence>",
      "category": "skill" | "experience" | "domain",
      "importance": "required" | "preferred"
    }
  ]
}
\`\`\`

Category definitions:
- **skill**: a concrete technical skill, tool, language, framework, or technique
- **experience**: years of experience, seniority level, scope of past roles, or team/leadership expectations
- **domain**: industry, business domain, regulatory context, or company-stage familiarity

Importance:
- **required**: the posting presents it as a must-have, minimum, or baseline qualification
- **preferred**: the posting presents it as nice-to-have, a plus, or a bonus

Rules:
- One requirement per item. Split compound bullets ("React and TypeScript") into separate requirements.
- Extract only what the posting actually states. Do not infer requirements that are not there, and do not add generic filler like "good communication skills" unless the posting names it.
- Keep each \`text\` specific enough to judge a resume against.`;
}

/**
 * Build the resume-assessment prompt
 */
function buildAssessmentPrompt({
  jobTitle,
  requirements,
  resumeText,
}: AssessResumeParams): string {
  return `You are an expert career counselor and recruiter. Judge how well a candidate's resume matches each requirement of a role, then give constructive feedback.

# Position

${jobTitle}

# Requirements

${JSON.stringify(requirements, null, 2)}

# Candidate Resume

${resumeText}

# Task

For every requirement above, classify how well the resume matches it. Use exactly these four levels:

- **direct**: the resume names it explicitly and shows concrete evidence (a project, a role, a measurable result).
- **adjacent**: the resume shows something demonstrably transferable, but not the thing itself (e.g. React when the posting asks for Vue; Postgres when it asks for MySQL).
- **partial**: the resume touches it, but the evidence is shallow, dated, or peripheral to their main work.
- **none**: no evidence in the resume.

Judge only against what the resume actually says. Do not give credit for what a candidate with that job title would typically know.

Provide your analysis in the following JSON format:

\`\`\`json
{
  "assessments": [
    {
      "requirementId": "<the id from the requirements list>",
      "match": "direct" | "adjacent" | "partial" | "none",
      "reasoning": "<one sentence citing the specific resume evidence, or naming what is absent>"
    }
  ],
  "strengths": [<array of 3-5 specific strengths that make the candidate a good fit>],
  "weaknesses": [<array of 3-5 specific weaknesses or gaps in the candidate's profile>],
  "missingSkills": [<array of key skills/requirements from the job that the candidate lacks>],
  "recommendations": [<array of 3-5 specific, actionable recommendations for the candidate>],
  "summary": "<2-3 paragraph summary of the overall fit>",
  "keyInsights": [<array of 3-5 key insights or standout observations>]
}
\`\`\`

Include exactly one assessment per requirement, using the requirement's \`id\` verbatim. Do not invent requirement ids.

Reference concrete details from both the posting and the resume. Provide honest, constructive feedback that helps the candidate understand their fit for this role.`;
}

/**
 * Extract text content from Claude response
 */
function extractTextFromResponse(message: Anthropic.Message): string {
  const textContent = message.content.find(
    (block) => block.type === 'text'
  ) as Anthropic.TextBlock | undefined;

  if (!textContent) {
    throw new Error('No text content in Claude response');
  }

  return textContent.text;
}

/**
 * Extract JSON from markdown code blocks if present
 */
function parseJsonResponse(responseText: string): Record<string, unknown> {
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  const jsonText = jsonMatch ? jsonMatch[1] : responseText;

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`Failed to parse Claude response: ${error}`);
  }
}

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[]
): value is T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

/**
 * Parse and validate the extracted requirements.
 *
 * Anything malformed is dropped rather than coerced — a requirement with a
 * guessed category would silently distort every subscore that follows.
 */
function parseRequirements(responseText: string): JobRequirement[] {
  const parsed = parseJsonResponse(responseText);
  const raw = Array.isArray(parsed.requirements) ? parsed.requirements : [];

  const seen = new Set<string>();
  const requirements: JobRequirement[] = [];

  for (const item of raw) {
    const id = String(item?.id ?? '').trim();
    const text = String(item?.text ?? '').trim();

    if (!id || !text || seen.has(id)) continue;
    if (!isOneOf(item?.category, REQUIREMENT_CATEGORIES)) continue;
    if (!isOneOf(item?.importance, REQUIREMENT_IMPORTANCES)) continue;

    seen.add(id);
    requirements.push({
      id,
      text,
      category: item.category,
      importance: item.importance,
    });
  }

  if (requirements.length === 0) {
    throw new Error('No valid requirements extracted from job posting');
  }

  return requirements;
}

/**
 * Parse and validate the assessment.
 *
 * Assessments are reconciled against the requirement list: unknown ids are
 * discarded and any requirement the model skipped is filled in as `none`, so
 * the scoring functions always see one assessment per requirement.
 */
function parseAssessment(
  responseText: string,
  requirements: JobRequirement[]
): ResumeAssessment {
  const parsed = parseJsonResponse(responseText);
  const raw = Array.isArray(parsed.assessments) ? parsed.assessments : [];

  const byId = new Map<string, RequirementAssessment>();
  const validIds = new Set(requirements.map((r) => r.id));

  for (const item of raw) {
    const requirementId = String(item?.requirementId ?? '').trim();

    if (!validIds.has(requirementId) || byId.has(requirementId)) continue;
    if (!isOneOf(item?.match, MATCH_LEVELS)) continue;

    byId.set(requirementId, {
      requirementId,
      match: item.match,
      reasoning: String(item?.reasoning ?? ''),
    });
  }

  const assessments = requirements.map(
    (requirement) =>
      byId.get(requirement.id) ?? {
        requirementId: requirement.id,
        match: 'none' as const,
        reasoning: 'Not assessed.',
      }
  );

  return {
    assessments,
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : [],
    summary: String(parsed.summary || ''),
    keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
  };
}

export { anthropic };
