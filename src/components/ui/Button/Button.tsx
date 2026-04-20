import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    
    const classNames = [
      styles.btn,
      styles[variant],
      styles[size],
      isLoading ? styles.loading : '',
      className || ''
    ].filter(Boolean).join(' ');

    return (
      <button 
        ref={ref}
        className={classNames} 
        disabled={isLoading || props.disabled}
        {...props}
      >
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
