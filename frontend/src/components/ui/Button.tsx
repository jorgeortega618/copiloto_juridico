import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none rounded-md';
  
  const variants = {
    primary: 'bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]',
    secondary: 'bg-[var(--color-background-tertiary)] text-[var(--color-text-primary)] hover:bg-[#E0E0DF]',
    outline: 'border border-[var(--color-border-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-secondary)]',
    ghost: 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-primary)]',
  };

  const sizes = {
    sm: 'text-[12px] px-3 py-1.5',
    md: 'text-[13px] px-4 py-2',
    lg: 'text-[14px] px-5 py-2.5',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
