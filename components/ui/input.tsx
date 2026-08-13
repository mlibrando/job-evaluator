import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-ink">{label}</label>
        )}
        <input
          ref={ref}
          className={`h-11 w-full rounded-sm border bg-surface-sunken px-3.5 text-base text-ink transition-colors placeholder:text-ink-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
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

Input.displayName = 'Input';
