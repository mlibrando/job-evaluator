declare namespace NodeJS {
  interface ProcessEnv {
    // Application
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_APP_URL: string;

    // Authentication
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;

    // Anthropic Claude API
    ANTHROPIC_API_KEY: string;

    // AWS Configuration
    AWS_REGION: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;

    // AWS S3
    S3_BUCKET_NAME: string;

    // AWS DynamoDB
    DYNAMODB_TABLE_USERS: string;
    DYNAMODB_TABLE_EVALUATIONS: string;
    DYNAMODB_TABLE_RATE_LIMITS: string;

    // Rate Limiting
    RATE_LIMIT_MAX_REQUESTS: string;
    RATE_LIMIT_WINDOW_MS: string;
  }
}
