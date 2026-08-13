import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-sm border border-transparent font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    secondary: 'border-hairline-strong text-ink hover:border-ink',
    outline: 'border-hairline-strong text-ink-secondary hover:border-ink hover:text-ink',
    ghost: 'text-ink-secondary hover:text-ink',
    danger: 'bg-danger text-white hover:opacity-90',
  };

  // Fixed heights (36 / 44 / 52) rather than vertical padding, so buttons line
  // up with the design's inputs and icon buttons.
  const sizeStyles = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-5 text-[15px]',
    lg: 'h-13 px-6 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
