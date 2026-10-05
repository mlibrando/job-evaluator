import { cache } from 'react';
import { getUserEvaluations } from '@/lib/aws/dynamodb';

const EVALUATION_FETCH_LIMIT = 500;

export const getHistory = cache(async (userId: string) => {
  const { evaluations } = await getUserEvaluations(userId, EVALUATION_FETCH_LIMIT);
  return evaluations ?? [];
});
