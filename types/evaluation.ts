export interface Evaluation {
  evaluationId: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
  resumeUrl: string;
  resumeKey: string;
  analysis: EvaluationAnalysis;
  createdAt: string;
  /** Client-supplied key that made this evaluation's ID deterministic, if any. */
  idempotencyKey?: string;
}

export type RequirementCategory = 'skill' | 'experience' | 'domain';

export type RequirementImportance = 'required' | 'preferred';

export type MatchLevel = 'direct' | 'adjacent' | 'partial' | 'none';

/** A single requirement extracted from the job posting. */
export interface JobRequirement {
  /** Stable slug, referenced by RequirementAssessment.requirementId. */
  id: string;
  text: string;
  category: RequirementCategory;
  importance: RequirementImportance;
}

/** How the candidate's resume measures against one requirement. */
export interface RequirementAssessment {
  requirementId: string;
  match: MatchLevel;
  reasoning: string;
}

export interface SubscoreBreakdown {
  skillMatch: number;
  experienceMatch: number;
  domainFit: number;
}

export interface EvaluationAnalysis {
  /** Weighted quality blend of the subscores, 0-100. Computed in code. */
  overallScore: number;
  /** Coverage of required requirements, 0-100. Computed in code. */
  matchPercentage: number;
  subscores: SubscoreBreakdown;
  /** The frozen rubric this evaluation was scored against. */
  requirements: JobRequirement[];
  assessments: RequirementAssessment[];
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendations: string[];
  summary: string;
  keyInsights: string[];
}

export interface CreateEvaluationRequest {
  jobTitle: string;
  jobDescription: string;
  companyName?: string;
  resumeFile: File;
}

export interface CreateEvaluationResponse {
  evaluationId: string;
  analysis: EvaluationAnalysis;
  /** True when a prior result was returned for a repeated idempotency key. */
  idempotent?: boolean;
}
