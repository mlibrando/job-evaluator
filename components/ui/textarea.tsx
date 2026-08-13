import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: React.ReactNode;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-ink">{label}</label>
        )}
        <textarea
          ref={ref}
          className={`w-full resize-y rounded-sm border bg-surface-sunken p-3.5 text-base leading-relaxed text-ink transition-colors placeholder:text-ink-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? 'border-danger' : 'border-transparent focus:border-hairline-strong'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-2 text-[13px] text-danger">{error}</p>}
        {helperText && !error && (
          <div className="mt-2 text-[13px] text-ink-muted">{helperText}</div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
