'use client';

import React, { useId } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  /** Right-aligned beside the label: a counter or an action button. */
  labelAside?: React.ReactNode;
  error?: string;
  helperText?: React.ReactNode;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, labelAside, error, helperText, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex w-full flex-col gap-2">
        {(label || labelAside) && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {label && (
              <label htmlFor={textareaId} className="text-sm font-medium text-ink">
                {label}
              </label>
            )}
            {labelAside}
          </div>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full resize-y rounded-[10px] border bg-surface p-3.5 text-base leading-normal text-ink transition-colors placeholder:text-ink-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-[15px] sm:leading-[1.55] ${
            error ? 'border-danger' : 'border-hairline-strong focus:border-accent'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-[13px] text-danger">{error}</p>}
        {helperText && !error && <div className="text-[13px] text-ink-muted">{helperText}</div>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
