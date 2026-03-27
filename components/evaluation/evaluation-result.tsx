'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui';
import type { Evaluation } from '@/types/evaluation';

interface EvaluationResultProps {
  evaluation: Evaluation;
}

export function EvaluationResult({ evaluation }: EvaluationResultProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this evaluation? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/evaluations/${evaluation.evaluationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete evaluation');
      }

      router.push('/history');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsDeleting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            {evaluation.jobTitle}
          </h1>
          {evaluation.companyName && (
            <p className="mt-1 text-lg text-zinc-600 dark:text-zinc-400">
              {evaluation.companyName}
            </p>
          )}
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            Evaluated on {formatDate(evaluation.createdAt)}
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/evaluate">
            <Button variant="outline">
              New Evaluation
            </Button>
          </Link>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {/* Overall Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
              Overall Match Score
            </p>
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(evaluation.analysis.overallScore)}`}>
              <span className={`text-5xl font-bold ${getScoreColor(evaluation.analysis.overallScore)}`}>
                {evaluation.analysis.overallScore}
              </span>
            </div>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              {evaluation.analysis.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      {evaluation.analysis.keyInsights && evaluation.analysis.keyInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {evaluation.analysis.keyInsights.map((insight, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="text-zinc-900 dark:text-white">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle>Your Strengths</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {evaluation.analysis.strengths.map((strength, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 text-green-600 dark:text-green-400 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="text-zinc-900 dark:text-white">{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Weaknesses */}
      {evaluation.analysis.weaknesses && evaluation.analysis.weaknesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {evaluation.analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="text-zinc-900 dark:text-white">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Missing Skills */}
      {evaluation.analysis.missingSkills && evaluation.analysis.missingSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missing Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {evaluation.analysis.missingSkills.map((skill, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 text-orange-600 dark:text-orange-400 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="text-zinc-900 dark:text-white">{skill}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {evaluation.analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </span>
                <span className="text-zinc-900 dark:text-white">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Link href="/history">
          <Button variant="outline">
            View All Evaluations
          </Button>
        </Link>
        <Link href="/evaluate">
          <Button variant="primary">
            Evaluate Another Job
          </Button>
        </Link>
      </div>
    </div>
  );
}
