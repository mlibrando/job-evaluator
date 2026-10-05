'use client';

import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Alert, Button } from '@/components/ui';
import { resumeFileName } from '@/lib/resume/file-name';
import { cn } from '@/lib/utils/cn';

export interface ResumeOnFile {
  key: string;
  updatedAt: string;
}

interface ResumeUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  /** The résumé from the user's last evaluation, used unless replaced. */
  resumeOnFile?: ResumeOnFile | null;
  disabled?: boolean;
}

const ACCEPTED_FILE_TYPE = 'application/pdf';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ResumeUpload({ file, onFileSelect, resumeOnFile, disabled }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const isPdf =
      file.type === ACCEPTED_FILE_TYPE ||
      (file.type === '' && file.name.toLowerCase().endsWith('.pdf'));

    if (!isPdf) {
      return 'Invalid file type. Please upload a PDF file.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 5MB. Please upload a smaller file.';
    }
    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    const validationError = validateFile(selectedFile);

    if (validationError) {
      setError(validationError);
      onFileSelect(null);
      return;
    }

    onFileSelect(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const browse = () => fileInputRef.current?.click();

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const selected = file
    ? { name: file.name, detail: `${formatFileSize(file.size)} · replaces the one on file` }
    : resumeOnFile
      ? {
          name: resumeFileName(resumeOnFile.key),
          detail: `Updated ${formatDate(resumeOnFile.updatedAt)}`,
          detailPrefix: 'On file · ',
        }
      : null;

  // A newly picked file can be dropped to fall back to the one on file.
  const secondaryAction = file ? (
    <Button type="button" variant="secondary" onClick={handleRemoveFile} disabled={disabled}>
      {resumeOnFile ? 'Keep the one on file' : 'Remove'}
    </Button>
  ) : (
    <Button type="button" variant="secondary" onClick={browse} disabled={disabled}>
      Use a different PDF
    </Button>
  );

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4.5">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
      />

      {selected ? (
        <>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex flex-wrap items-center gap-3 rounded border-[1.5px] p-3 transition-colors sm:gap-4 sm:p-4',
              isDragging ? 'border-accent-hover bg-accent-wash' : 'border-accent bg-accent-tint',
            )}
          >
            <span
              aria-hidden="true"
              className="inline-flex h-11 w-9 shrink-0 items-end justify-center rounded-[6px] border border-hairline bg-surface pb-[5px] font-mono text-[8px] font-medium text-danger sm:h-12 sm:w-10 sm:rounded-[7px] sm:pb-1.5 sm:text-[9px]"
            >
              PDF
            </span>
            <div className="flex min-w-0 flex-[1_1_180px] flex-col gap-0.5 sm:gap-[3px]">
              <span className="text-sm font-medium [overflow-wrap:anywhere] text-ink sm:truncate sm:text-[15px]">
                {selected.name}
              </span>
              <span className="text-xs text-ink-secondary sm:text-[13px]">
                {selected.detailPrefix && (
                  <span className="hidden sm:inline">{selected.detailPrefix}</span>
                )}
                {selected.detail}
              </span>
            </div>
            <div className="hidden sm:block">{secondaryAction}</div>
          </div>
          <div className="flex flex-col sm:hidden [&>button]:w-full">{secondaryAction}</div>
          <span className="hidden text-xs text-ink-secondary sm:block">
            {resumeOnFile
              ? 'Replacing it here updates the résumé on file for future evaluations too. '
              : ''}
            PDF only, up to 5 MB.
          </span>
        </>
      ) : (
        <button
          type="button"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={browse}
          disabled={disabled}
          className={cn(
            'flex min-h-[148px] flex-col items-center justify-center gap-1.5 rounded border-[1.5px] border-dashed p-6 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50',
            isDragging
              ? 'border-accent bg-accent-wash'
              : 'border-hairline-strong bg-surface-subtle hover:border-accent',
          )}
        >
          <UploadCloud size={22} strokeWidth={1.5} className="text-accent" aria-hidden="true" />
          <span className="mt-1 text-[15px] font-medium text-ink">
            {isDragging ? 'Drop your résumé here' : 'Drop a résumé here, or click to browse'}
          </span>
          <span className="text-sm text-ink-secondary">PDF only, up to 5 MB</span>
        </button>
      )}

      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
