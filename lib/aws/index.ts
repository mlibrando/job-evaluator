// S3 exports
export {
  uploadFile,
  getSignedDownloadUrl,
  deleteFile,
  fileExists,
  generateResumeKey,
  type UploadFileParams,
  type UploadFileResult,
} from './s3';

// DynamoDB exports
export {
  docClient,
  createUser,
  getUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  createEvaluation,
  getEvaluation,
  getUserEvaluations,
  deleteEvaluation,
  getRateLimit,
  updateRateLimit,
  resetRateLimit,
  type RateLimit,
} from './dynamodb';

// Error handling exports
export {
  AWSError,
  AWSErrorCode,
  handleAWSError,
  withAWSErrorHandling,
} from './errors';

// Schema exports
export { TABLE_SCHEMAS, CREATE_TABLE_COMMANDS } from './schemas';
