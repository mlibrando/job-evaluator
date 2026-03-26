/**
 * DynamoDB Table Schema Definitions
 *
 * This file documents the table schemas for AWS DynamoDB.
 * Use these schemas to create tables via AWS Console, CLI, or IaC tools.
 */

export const TABLE_SCHEMAS = {
  /**
   * Users Table
   * Stores user account information
   */
  USERS: {
    TableName: 'job-evaluator-users',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST', // or use ProvisionedThroughput
    Tags: [
      { Key: 'Environment', Value: 'production' },
      { Key: 'Application', Value: 'job-evaluator' },
    ],
  },

  /**
   * Evaluations Table
   * Stores job post evaluations
   */
  EVALUATIONS: {
    TableName: 'job-evaluator-evaluations',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
    Tags: [
      { Key: 'Environment', Value: 'production' },
      { Key: 'Application', Value: 'job-evaluator' },
    ],
  },

  /**
   * Rate Limits Table
   * Stores rate limiting information per user
   */
  RATE_LIMITS: {
    TableName: 'job-evaluator-rate-limits',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [{ AttributeName: 'userId', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
    TimeToLiveSpecification: {
      Enabled: true,
      AttributeName: 'expiresAt',
    },
    Tags: [
      { Key: 'Environment', Value: 'production' },
      { Key: 'Application', Value: 'job-evaluator' },
    ],
  },
};

/**
 * AWS CLI commands to create tables
 */
export const CREATE_TABLE_COMMANDS = {
  USERS: `
aws dynamodb create-table \\
  --table-name job-evaluator-users \\
  --attribute-definitions \\
    AttributeName=id,AttributeType=S \\
    AttributeName=email,AttributeType=S \\
  --key-schema \\
    AttributeName=id,KeyType=HASH \\
  --billing-mode PAY_PER_REQUEST \\
  --global-secondary-indexes \\
    '[{
      "IndexName": "EmailIndex",
      "KeySchema": [{"AttributeName":"email","KeyType":"HASH"}],
      "Projection": {"ProjectionType":"ALL"}
    }]' \\
  --tags \\
    Key=Environment,Value=production \\
    Key=Application,Value=job-evaluator
`,

  EVALUATIONS: `
aws dynamodb create-table \\
  --table-name job-evaluator-evaluations \\
  --attribute-definitions \\
    AttributeName=id,AttributeType=S \\
    AttributeName=userId,AttributeType=S \\
    AttributeName=createdAt,AttributeType=S \\
  --key-schema \\
    AttributeName=id,KeyType=HASH \\
  --billing-mode PAY_PER_REQUEST \\
  --global-secondary-indexes \\
    '[{
      "IndexName": "UserIdIndex",
      "KeySchema": [
        {"AttributeName":"userId","KeyType":"HASH"},
        {"AttributeName":"createdAt","KeyType":"RANGE"}
      ],
      "Projection": {"ProjectionType":"ALL"}
    }]' \\
  --tags \\
    Key=Environment,Value=production \\
    Key=Application,Value=job-evaluator
`,

  RATE_LIMITS: `
aws dynamodb create-table \\
  --table-name job-evaluator-rate-limits \\
  --attribute-definitions \\
    AttributeName=userId,AttributeType=S \\
  --key-schema \\
    AttributeName=userId,KeyType=HASH \\
  --billing-mode PAY_PER_REQUEST \\
  --tags \\
    Key=Environment,Value=production \\
    Key=Application,Value=job-evaluator

aws dynamodb update-time-to-live \\
  --table-name job-evaluator-rate-limits \\
  --time-to-live-specification \\
    Enabled=true,AttributeName=expiresAt
`,
};
