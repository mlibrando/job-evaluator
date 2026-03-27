import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import type { User } from '@/types/user';
import type { Evaluation } from '@/types/evaluation';
import { withAWSErrorHandling } from './errors';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Create document client for easier operations
export const docClient = DynamoDBDocumentClient.from(client);

// Table names
const TABLES = {
  USERS: process.env.DYNAMODB_TABLE_USERS!,
  EVALUATIONS: process.env.DYNAMODB_TABLE_EVALUATIONS!,
  RATE_LIMITS: process.env.DYNAMODB_TABLE_RATE_LIMITS!,
};

// ============================================
// User Operations
// ============================================

export async function createUser(user: User): Promise<User> {
  return withAWSErrorHandling('DynamoDB.createUser', async () => {
    await docClient.send(
      new PutCommand({
        TableName: TABLES.USERS,
        Item: user,
      })
    );
    return user;
  });
}

export async function getUser(userId: string): Promise<User | null> {
  return withAWSErrorHandling('DynamoDB.getUser', async () => {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLES.USERS,
        Key: { userId: userId },
      })
    );
    return result.Item as User | null;
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return withAWSErrorHandling('DynamoDB.getUserByEmail', async () => {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'EmailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email,
        },
      })
    );
    return result.Items?.[0] as User | null;
  });
}

export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, 'userId' | 'createdAt'>>
): Promise<User> {
  return withAWSErrorHandling('DynamoDB.updateUser', async () => {
    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value]) => {
      updateExpression.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    });

    // Always update the updatedAt timestamp
    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLES.USERS,
        Key: { userId: userId },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return result.Attributes as User;
  });
}

export async function deleteUser(userId: string): Promise<void> {
  return withAWSErrorHandling('DynamoDB.deleteUser', async () => {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLES.USERS,
        Key: { userId: userId },
      })
    );
  });
}

// ============================================
// Evaluation Operations
// ============================================

export async function createEvaluation(evaluation: Evaluation): Promise<Evaluation> {
  return withAWSErrorHandling('DynamoDB.createEvaluation', async () => {
    await docClient.send(
      new PutCommand({
        TableName: TABLES.EVALUATIONS,
        Item: evaluation,
      })
    );
    return evaluation;
  });
}

export async function getEvaluation(evaluationId: string, userId: string): Promise<Evaluation | null> {
  return withAWSErrorHandling('DynamoDB.getEvaluation', async () => {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLES.EVALUATIONS,
        Key: {
          userId: userId,
          evaluationId: evaluationId
        },
      })
    );
    return result.Item as Evaluation | null;
  });
}

export async function getUserEvaluations(
  userId: string,
  limit: number = 20,
  lastEvaluatedKey?: Record<string, any>
): Promise<{ evaluations: Evaluation[]; lastKey?: Record<string, any> }> {
  return withAWSErrorHandling('DynamoDB.getUserEvaluations', async () => {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLES.EVALUATIONS,
        IndexName: 'UserIdIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
        ScanIndexForward: false, // Sort by createdAt descending
      })
    );

    return {
      evaluations: result.Items as Evaluation[],
      lastKey: result.LastEvaluatedKey,
    };
  });
}

export async function deleteEvaluation(evaluationId: string, userId: string): Promise<void> {
  return withAWSErrorHandling('DynamoDB.deleteEvaluation', async () => {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLES.EVALUATIONS,
        Key: {
          userId: userId,
          evaluationId: evaluationId
        },
      })
    );
  });
}

// ============================================
// Rate Limit Operations
// ============================================

export interface RateLimit {
  userId: string;
  windowStart: number;
  requestCount: number;
  expiresAt: number;
}

export async function getRateLimit(userId: string): Promise<RateLimit | null> {
  return withAWSErrorHandling('DynamoDB.getRateLimit', async () => {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLES.RATE_LIMITS,
        Key: { userId },
      })
    );
    return result.Item as RateLimit | null;
  });
}

export async function updateRateLimit(
  userId: string,
  windowStart: number,
  requestCount: number
): Promise<void> {
  return withAWSErrorHandling('DynamoDB.updateRateLimit', async () => {
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000');
    const expiresAt = Math.floor(Date.now() / 1000) + Math.floor(windowMs / 1000) + 86400; // TTL: window + 24h buffer

    await docClient.send(
      new PutCommand({
        TableName: TABLES.RATE_LIMITS,
        Item: {
          userId,
          windowStart,
          requestCount,
          expiresAt,
        },
      })
    );
  });
}

export async function resetRateLimit(userId: string): Promise<void> {
  return withAWSErrorHandling('DynamoDB.resetRateLimit', async () => {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLES.RATE_LIMITS,
        Key: { userId },
      })
    );
  });
}
