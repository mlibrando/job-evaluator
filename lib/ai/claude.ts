import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AnalyzeJobPostParams {
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
  resumeText: string;
}

export interface JobAnalysisResult {
  overallScore: number;
  matchPercentage: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendations: string[];
  summary: string;
  keyInsights: string[];
}

/**
 * Analyze a job posting against a resume using Claude
 */
export async function analyzeJobPost({
  jobTitle,
  jobDescription,
  companyName,
  resumeText,
}: AnalyzeJobPostParams): Promise<JobAnalysisResult> {
  const prompt = buildAnalysisPrompt({
    jobTitle,
    jobDescription,
    companyName,
    resumeText,
  });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    temperature: 0.3,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = extractTextFromResponse(message);
  const analysis = parseAnalysisResponse(responseText);

  return analysis;
}

/**
 * Build the analysis prompt
 */
function buildAnalysisPrompt({
  jobTitle,
  jobDescription,
  companyName,
  resumeText,
}: AnalyzeJobPostParams): string {
  return `You are an expert career counselor and recruiter. Analyze the following job posting against the candidate's resume and provide a detailed evaluation.

# Job Posting

**Position**: ${jobTitle}
${companyName ? `**Company**: ${companyName}` : ''}

**Description**:
${jobDescription}

# Candidate Resume

${resumeText}

# Task

Analyze how well the candidate matches this job posting. Provide your analysis in the following JSON format:

\`\`\`json
{
  "overallScore": <number 0-100>,
  "matchPercentage": <number 0-100>,
  "strengths": [<array of 3-5 specific strengths that make the candidate a good fit>],
  "weaknesses": [<array of 3-5 specific weaknesses or gaps in the candidate's profile>],
  "missingSkills": [<array of key skills/requirements from the job that the candidate lacks>],
  "recommendations": [<array of 3-5 specific, actionable recommendations for the candidate>],
  "summary": "<2-3 paragraph summary of the overall fit>",
  "keyInsights": [<array of 3-5 key insights or standout observations>]
}
\`\`\`

Be specific and reference concrete details from both the job posting and resume. Focus on:
- Technical skills and qualifications
- Experience level and relevance
- Cultural fit indicators
- Growth potential
- Deal-breakers or red flags

Provide honest, constructive feedback that helps the candidate understand their fit for this role.`;
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
 * Parse the analysis response from Claude
 */
function parseAnalysisResponse(responseText: string): JobAnalysisResult {
  // Extract JSON from markdown code blocks if present
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
  const jsonText = jsonMatch ? jsonMatch[1] : responseText;

  try {
    const parsed = JSON.parse(jsonText);

    // Validate and return
    return {
      overallScore: Number(parsed.overallScore) || 0,
      matchPercentage: Number(parsed.matchPercentage) || 0,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      summary: String(parsed.summary || ''),
      keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
    };
  } catch (error) {
    throw new Error(`Failed to parse Claude response: ${error}`);
  }
}

export { anthropic };
