# Deployment Guide

This guide covers deploying the AI Job Post Evaluator to Vercel (recommended) or other platforms.

## Vercel Deployment (Recommended)

Vercel is the easiest deployment option for Next.js applications and offers a generous free tier.

### Prerequisites

- GitHub/GitLab/Bitbucket account
- Vercel account (free)
- All AWS resources set up (S3, DynamoDB tables)
- Anthropic API key
- Google OAuth credentials configured

### Step 1: Push to Git

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
\`\`\`

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Build Command**: \`yarn build\`
   - **Output Directory**: \`.next\`

### Step 3: Configure Environment Variables

Add all environment variables in Vercel's dashboard:

\`\`\`
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generate-random-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
S3_BUCKET_NAME=job-evaluator-resumes
DYNAMODB_TABLE_USERS=job-evaluator-users
DYNAMODB_TABLE_EVALUATIONS=job-evaluator-evaluations
DYNAMODB_TABLE_RATE_LIMITS=job-evaluator-rate-limits
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=3600000
\`\`\`

### Step 4: Update Google OAuth Redirect URIs

Add your Vercel domain to authorized redirect URIs:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your OAuth 2.0 Client
3. Add to "Authorized redirect URIs":
   - \`https://your-domain.vercel.app/api/auth/callback/google\`

### Step 5: Deploy

Click "Deploy" in Vercel. Your app will be live in ~2 minutes!

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update \`NEXTAUTH_URL\` environment variable
6. Update Google OAuth redirect URIs

## AWS Configuration

### S3 Bucket Configuration

Ensure your S3 bucket has proper CORS settings:

\`\`\`json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://your-domain.vercel.app"],
    "ExposeHeaders": []
  }
]
\`\`\`

### DynamoDB Considerations

- Use **PAY_PER_REQUEST** billing mode for unpredictable traffic
- Set up CloudWatch alarms for throttling
- Consider setting up backups for production

### IAM Permissions

Create a dedicated IAM user with minimal permissions:

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::job-evaluator-resumes/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/job-evaluator-users",
        "arn:aws:dynamodb:*:*:table/job-evaluator-users/index/*",
        "arn:aws:dynamodb:*:*:table/job-evaluator-evaluations",
        "arn:aws:dynamodb:*:*:table/job-evaluator-evaluations/index/*",
        "arn:aws:dynamodb:*:*:table/job-evaluator-rate-limits"
      ]
    }
  ]
}
\`\`\`

## Alternative Deployment Options

### Self-Hosted (Docker)

Create a \`Dockerfile\`:

\`\`\`dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
\`\`\`

Build and run:

\`\`\`bash
docker build -t job-evaluator .
docker run -p 3000:3000 --env-file .env.local job-evaluator
\`\`\`

### Railway

1. Connect your GitHub repository to Railway
2. Add environment variables
3. Railway will auto-deploy on push

### Netlify

1. Connect repository to Netlify
2. Build settings:
   - **Build command**: \`yarn build\`
   - **Publish directory**: \`.next\`
3. Add environment variables
4. Deploy

## Post-Deployment Checklist

- [ ] Test authentication flow
- [ ] Verify resume upload works
- [ ] Create a test evaluation
- [ ] Check rate limiting is working
- [ ] Monitor CloudWatch/Vercel logs for errors
- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure domain and SSL
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit

## Monitoring

### Vercel Analytics

Enable Vercel Analytics for performance monitoring:
1. Go to your project dashboard
2. Navigate to "Analytics"
3. Enable Web Analytics

### Error Tracking

Consider adding Sentry:

\`\`\`bash
yarn add @sentry/nextjs
npx @sentry/wizard -i nextjs
\`\`\`

### AWS CloudWatch

Monitor DynamoDB and S3:
- Set up alarms for high read/write capacity
- Monitor S3 storage usage
- Track API Gateway metrics

## Scaling Considerations

### Rate Limiting

Adjust rate limits based on usage:
- Development: 100/hour
- Production: 10/hour
- Enterprise: Custom limits per user

### Caching

Consider adding caching:
- Cache evaluation results (optional)
- Use Vercel Edge Caching for static assets
- Implement Redis for session storage (if needed)

### Cost Optimization

- Monitor Anthropic API usage
- Set up billing alerts in AWS
- Consider caching AI responses for identical job descriptions
- Use S3 lifecycle policies to archive old resumes

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Rotate API keys regularly** - Especially Anthropic and AWS keys
3. **Enable MFA** on AWS account
4. **Use least-privilege IAM policies**
5. **Monitor for suspicious activity**
6. **Keep dependencies updated** - \`yarn upgrade-interactive\`
7. **Enable CORS properly** - Only allow your domain
8. **Use HTTPS only** - Enforced by default on Vercel

## Troubleshooting

### Build Failures

**Issue**: TypeScript errors during build
- **Fix**: Run \`yarn build\` locally first
- Check for type errors: \`yarn tsc --noEmit\`

**Issue**: Missing environment variables
- **Fix**: Verify all variables are set in Vercel

### Runtime Errors

**Issue**: 401 Unauthorized errors
- **Fix**: Check NextAuth configuration
- Verify \`NEXTAUTH_URL\` matches your domain
- Ensure Google OAuth redirect URIs are correct

**Issue**: AWS S3/DynamoDB errors
- **Fix**: Verify IAM permissions
- Check AWS region is correct
- Ensure tables/buckets exist

**Issue**: Rate limit not working
- **Fix**: Check DynamoDB rate limits table
- Verify TTL is enabled on expiresAt attribute

## Support

For deployment issues:
1. Check Vercel logs: \`vercel logs\`
2. Check browser console for errors
3. Review AWS CloudWatch logs
4. Create an issue on GitHub

## Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Documentation](https://vercel.com/docs)
- [AWS Best Practices](https://aws.amazon.com/architecture/well-architected/)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
