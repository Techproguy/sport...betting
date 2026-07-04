'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-primary text-primary-foreground hover:brightness-110 shadow-[0_8px_24px_-8px_rgba(0,214,111,0.6)]',
  secondary: 'bg-elevated text-foreground border border-border hover:bg-[#242424]',
  outline: 'border border-border text-foreground hover:border-primary hover:text-primary bg-transparent',
  ghost: 'text-secondary hover:text-foreground hover:bg-elevated',
  danger: 'bg-danger text-white hover:brightness-110',
  glass: 'glass border border-border text-foreground hover:border-primary/60',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
