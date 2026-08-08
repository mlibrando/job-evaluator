import { extractText } from 'unpdf';

export enum ResumeExtractionErrorCode {
  NOT_A_PDF = 'NOT_A_PDF',
  PARSE_FAILED = 'PARSE_FAILED',
  NO_TEXT_FOUND = 'NO_TEXT_FOUND',
}

export class ResumeExtractionError extends Error {
  constructor(
    public readonly code: ResumeExtractionErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ResumeExtractionError';
  }
}

/**
 * A PDF whose text layer yields less than this is treated as unreadable —
 * typically a scanned image, or a file whose text is drawn as vector outlines.
 */
const MIN_USABLE_CHARS = 200;

/** %PDF- */
const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d];

/**
 * Verify the magic bytes rather than trusting a declared MIME type or file
 * extension. The browser-supplied type is untrusted, and file names lie
 */
export function isPdf(bytes: Uint8Array): boolean {
  if (bytes.length < PDF_SIGNATURE.length) return false;
  return PDF_SIGNATURE.every((byte, index) => bytes[index] === byte);
}

export interface ResumeExtractionResult {
  text: string;
  totalPages: number;
  charCount: number;
  wordCount: number;
}

/**
 * Parse a resume PDF into plain text.
 *
 * Throws ResumeExtractionError rather than returning partial output — an empty
 * or near-empty extraction is a failure worth surfacing to the user
 */
export async function extractResumeText(
  bytes: Uint8Array
): Promise<ResumeExtractionResult> {
  if (!isPdf(bytes)) {
    throw new ResumeExtractionError(
      ResumeExtractionErrorCode.NOT_A_PDF,
      'Resume must be a PDF file.',
      { byteLength: bytes.length }
    );
  }

  let text: string;
  let totalPages: number;


  // unpdf expects a Uint8Array rather than a Node Buffer.
  // Create a Uint8Array view over the Buffer's existing memory so we
  // don't copy the PDF data or accidentally trigger a misleading
  // "corrupted or password-protected" error.
  const data = new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  try {
    const result = await extractText(data, { mergePages: true });
    text = result.text;
    totalPages = result.totalPages;
  } catch (error) {
    throw new ResumeExtractionError(
      ResumeExtractionErrorCode.PARSE_FAILED,
      'Could not read this PDF. It may be corrupted or password-protected.',
      { cause: error instanceof Error ? error.message : String(error) }
    );
  }

  const normalized = normalizeWhitespace(text);
  const charCount = normalized.length;
  const wordCount = normalized.split(' ').filter(Boolean).length;

  if (charCount < MIN_USABLE_CHARS) {
    throw new ResumeExtractionError(
      ResumeExtractionErrorCode.NO_TEXT_FOUND,
      'No readable text found in this PDF. If it is a scanned document or an ' +
        'image export, please upload a version with selectable text.',
      { charCount, totalPages }
    );
  }

  return { text: normalized, totalPages, charCount, wordCount };
}

/**
 * Collapse the runs of whitespace pdf.js emits between positioned text items,
 * while keeping line breaks so section structure survives into the prompt.
 */
function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
