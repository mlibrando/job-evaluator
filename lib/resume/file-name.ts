// Keys are `resumes/<userId>/<timestamp>-<original name>`.
export function resumeFileName(resumeKey: string): string {
  const segment = resumeKey.split('/').pop() ?? resumeKey;
  return segment.replace(/^\d+-/, '');
}
