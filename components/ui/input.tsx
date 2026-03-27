import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-lg border ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-zinc-300 focus:ring-zinc-900 dark:border-zinc-700'
          } bg-white px-4 py-2 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
