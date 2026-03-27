# AI Job Post Evaluator

An AI-powered web application that analyzes how well a candidate's resume matches job postings using Claude AI. Built with Next.js, TypeScript, and AWS services.

## Features

- 🤖 **AI-Powered Analysis** - Uses Claude Haiku 3.5 to evaluate resume-job fit
- 📊 **Detailed Scoring** - Get overall match scores and detailed insights
- 💾 **Resume Management** - Upload and reuse resumes across evaluations
- 📈 **Evaluation History** - Track all past evaluations with search and filtering
- 🔐 **Secure Authentication** - Google OAuth integration via NextAuth
- ⚡ **Rate Limiting** - Built-in rate limiting (10 requests/hour)
- 🌙 **Dark Mode** - Full dark mode support
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

### Frontend
- **Next.js 16** - App Router with Turbopack
- **React 19** - Server and Client Components
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Zod** - Validation

### Backend
- **NextAuth v5** - Authentication
- **Anthropic Claude API** - AI analysis
- **AWS S3** - Resume file storage
- **AWS DynamoDB** - Database for users, evaluations, and rate limits

## Prerequisites

- Node.js 18+ and Yarn
- AWS Account with S3 and DynamoDB access
- Anthropic API key
- Google OAuth credentials

## Getting Started

### 1. Clone the repository

\`\`\`bash
git clone <repository-url>
cd job-evaluator
\`\`\`

### 2. Install dependencies

\`\`\`bash
yarn install
\`\`\`

### 3. Set up environment variables

Copy \`.env.example\` to \`.env.local\` and fill in your credentials:

\`\`\`bash
cp .env.example .env.local
\`\`\`

See [Environment Variables](#environment-variables) section below.

### 4. Set up AWS Resources

#### Create S3 Bucket

\`\`\`bash
aws s3 mb s3://job-evaluator-resumes --region ap-southeast-1
\`\`\`

#### Create DynamoDB Tables

See \`lib/aws/schemas.ts\` for full schemas. Quick setup:

**Users Table:**
\`\`\`bash
aws dynamodb create-table \\
  --table-name job-evaluator-users \\
  --attribute-definitions \\
    AttributeName=userId,AttributeType=S \\
    AttributeName=email,AttributeType=S \\
  --key-schema AttributeName=userId,KeyType=HASH \\
  --billing-mode PAY_PER_REQUEST \\
  --global-secondary-indexes \\
    '[{"IndexName":"EmailIndex","KeySchema":[{"AttributeName":"email","KeyType":"HASH"}],"Projection":{"ProjectionType":"ALL"}}]'
\`\`\`

**Evaluations Table:**
\`\`\`bash
aws dynamodb create-table \\
  --table-name job-evaluator-evaluations \\
  --attribute-definitions \\
    AttributeName=userId,AttributeType=S \\
    AttributeName=evaluationId,AttributeType=S \\
    AttributeName=createdAt,AttributeType=S \\
  --key-schema \\
    AttributeName=userId,KeyType=HASH \\
    AttributeName=evaluationId,KeyType=RANGE \\
  --billing-mode PAY_PER_REQUEST \\
  --global-secondary-indexes \\
    '[{"IndexName":"UserIdIndex","KeySchema":[{"AttributeName":"userId","KeyType":"HASH"},{"AttributeName":"createdAt","KeyType":"RANGE"}],"Projection":{"ProjectionType":"ALL"}}]'
\`\`\`

**Rate Limits Table:**
\`\`\`bash
aws dynamodb create-table \\
  --table-name job-evaluator-rate-limits \\
  --attribute-definitions AttributeName=userId,AttributeType=S \\
  --key-schema AttributeName=userId,KeyType=HASH \\
  --billing-mode PAY_PER_REQUEST

aws dynamodb update-time-to-live \\
  --table-name job-evaluator-rate-limits \\
  --time-to-live-specification Enabled=true,AttributeName=expiresAt
\`\`\`

### 5. Run the development server

\`\`\`bash
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| \`NEXTAUTH_URL\` | Your app URL (e.g., http://localhost:3000) | Yes |
| \`NEXTAUTH_SECRET\` | Random secret for NextAuth | Yes |
| \`GOOGLE_CLIENT_ID\` | Google OAuth Client ID | Yes |
| \`GOOGLE_CLIENT_SECRET\` | Google OAuth Client Secret | Yes |
| \`ANTHROPIC_API_KEY\` | Anthropic Claude API key | Yes |
| \`AWS_REGION\` | AWS region (e.g., ap-southeast-1) | Yes |
| \`AWS_ACCESS_KEY_ID\` | AWS access key | Yes |
| \`AWS_SECRET_ACCESS_KEY\` | AWS secret key | Yes |
| \`S3_BUCKET_NAME\` | S3 bucket name for resumes | Yes |
| \`DYNAMODB_TABLE_USERS\` | DynamoDB users table name | Yes |
| \`DYNAMODB_TABLE_EVALUATIONS\` | DynamoDB evaluations table name | Yes |
| \`DYNAMODB_TABLE_RATE_LIMITS\` | DynamoDB rate limits table name | Yes |
| \`RATE_LIMIT_MAX_REQUESTS\` | Max requests per window (default: 100) | No |
| \`RATE_LIMIT_WINDOW_MS\` | Rate limit window in ms (default: 3600000) | No |

## Project Structure

\`\`\`
job-evaluator/
├── app/
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # Protected dashboard pages
│   ├── api/              # API routes
│   └── globals.css       # Global styles
├── components/
│   ├── auth/             # Authentication components
│   ├── evaluation/       # Evaluation-related components
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── lib/
│   ├── ai/               # Claude AI integration
│   ├── auth/             # NextAuth configuration
│   ├── aws/              # AWS S3 and DynamoDB clients
│   ├── rate-limit/       # Rate limiting logic
│   └── validation/       # Zod validation schemas
└── types/                # TypeScript type definitions
\`\`\`

## API Endpoints

### Authentication
- \`GET /api/auth/[...nextauth]\` - NextAuth handlers

### Evaluations
- \`POST /api/evaluate\` - Create new evaluation
- \`GET /api/evaluations\` - List user's evaluations (supports pagination)
- \`GET /api/evaluations/[id]\` - Get single evaluation
- \`DELETE /api/evaluations/[id]\` - Delete evaluation

### Resume Management
- \`POST /api/resume/upload\` - Upload resume file
- \`GET /api/resume/[key]\` - Get signed download URL
- \`DELETE /api/resume/[key]\` - Delete resume file

### Rate Limiting
- \`GET /api/rate-limit\` - Check current rate limit status

## Development

### Build for production
\`\`\`bash
yarn build
\`\`\`

### Run production build
\`\`\`bash
yarn start
\`\`\`

### Linting
\`\`\`bash
yarn lint
\`\`\`

## Cost Considerations

### Anthropic API
- Claude Haiku 3.5: ~$0.001-$0.002 per evaluation (very affordable!)
- Input: $0.80 per million tokens
- Output: $4.00 per million tokens
- Approximately **20x cheaper** than Sonnet

### AWS
- S3: ~$0.023 per GB/month
- DynamoDB: Pay-per-request pricing
- Minimal costs for low-volume usage

## Security

- All API routes require authentication
- Resume ownership validation before operations
- Rate limiting to prevent abuse
- Secure file uploads with type and size validation
- Environment variables for sensitive data
- Zod validation on all inputs

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.
