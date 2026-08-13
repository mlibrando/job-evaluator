'use client';

import { useRef, useState } from 'react';
import { FileText, UploadCloud, X } from 'lucide-react';
import { Alert } from '@/components/ui';

interface ResumeUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

const ACCEPTED_FILE_TYPE = 'application/pdf';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ResumeUpload({ file, onFileSelect, disabled }: ResumeUploadProps) {
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative flex min-h-[148px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded border border-dashed bg-surface-sunken p-6 text-center transition-colors ${
            isDragging ? 'border-ink-muted' : 'border-hairline-strong hover:border-ink-muted'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
          />

          <UploadCloud size={22} strokeWidth={1.5} className="text-ink-muted" />
          <p className="mt-1 text-[15px] font-medium text-ink">
            {isDragging ? 'Drop your résumé here' : 'Drop a résumé here, or click to browse'}
          </p>
          <p className="text-sm text-ink-muted">PDF only, up to 5 MB</p>
        </div>
      ) : (
        <div className="rounded border border-hairline bg-surface p-5">
          <div className="flex items-center justify-between gap-5">
            <div className="flex min-w-0 items-center gap-3.5">
              <FileText size={20} strokeWidth={1.5} className="shrink-0 text-ink-secondary" />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-ink">{file.name}</p>
                <p className="mt-0.5 text-sm text-ink-muted">{formatFileSize(file.size)}</p>
              </div>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={handleRemoveFile}
                aria-label="Remove file"
                className="shrink-0 text-ink-muted transition-colors hover:text-danger"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}
    </div>
  );
}
