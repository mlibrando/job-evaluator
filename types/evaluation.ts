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
}

export interface EvaluationAnalysis {
  overallScore: number;
  matchPercentage: number;
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
}
