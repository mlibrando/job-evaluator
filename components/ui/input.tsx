'use client';

import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Right-aligned beside the label: a counter or an "Optional" hint. */
  labelAside?: React.ReactNode;
  error?: string;
  helperText?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelAside, error, helperText, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex w-full flex-col gap-2">
        {(label || labelAside) && (
          <div className="flex items-baseline justify-between gap-3">
            {label && (
              <label htmlFor={inputId} className="text-sm font-medium text-ink">
                {label}
              </label>
            )}
            {labelAside}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-12 w-full rounded-[10px] border bg-surface px-3.5 text-base text-ink transition-colors placeholder:text-ink-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-11.5 sm:text-[15px] ${
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

Input.displayName = 'Input';
