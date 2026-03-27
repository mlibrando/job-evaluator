'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, Input } from '@/components/ui';
import type { Evaluation } from '@/types/evaluation';

interface EvaluationListProps {
  evaluations: Evaluation[];
}

export function EvaluationList({ evaluations }: EvaluationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  // Filter and sort evaluations
  const filteredEvaluations = useMemo(() => {
    let filtered = evaluations.filter((evaluation) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        evaluation.jobTitle.toLowerCase().includes(searchLower) ||
        evaluation.companyName?.toLowerCase().includes(searchLower)
      );
    });

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      filtered.sort((a, b) => b.analysis.overallScore - a.analysis.overallScore);
    }

    return filtered;
  }, [evaluations, searchQuery, sortBy]);

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
      month: 'short',
      day: 'numeric',
    });
  };

  if (evaluations.length === 0) {
    return (
      <Card>
        <CardContent className="py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              No Evaluations Yet
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Start evaluating job postings to see your history here.
            </p>
            <Link
              href="/evaluate"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Create Your First Evaluation
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Sort */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by job title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        {filteredEvaluations.length === evaluations.length ? (
          <span>Showing all {evaluations.length} evaluations</span>
        ) : (
          <span>
            Showing {filteredEvaluations.length} of {evaluations.length} evaluations
          </span>
        )}
      </div>

      {/* Evaluations Grid */}
      {filteredEvaluations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              No evaluations match your search.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvaluations.map((evaluation) => (
            <Link
              key={evaluation.evaluationId}
              href={`/evaluations/${evaluation.evaluationId}`}
              className="block"
            >
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-zinc-900 dark:text-white mb-1 truncate">
                        {evaluation.jobTitle}
                      </h3>
                      {evaluation.companyName && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                          {evaluation.companyName}
                        </p>
                      )}
                    </div>
                    <div
                      className={`flex-shrink-0 ml-3 w-12 h-12 rounded-full ${getScoreBgColor(
                        evaluation.analysis.overallScore
                      )} flex items-center justify-center`}
                    >
                      <span
                        className={`text-lg font-bold ${getScoreColor(
                          evaluation.analysis.overallScore
                        )}`}
                      >
                        {evaluation.analysis.overallScore}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4">
                    {evaluation.analysis.summary}
                  </p>

                  <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                    <span>{formatDate(evaluation.createdAt)}</span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
