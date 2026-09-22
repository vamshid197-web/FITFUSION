import React from 'react';
import { Link } from 'react-router-dom';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantStyles = {
    primary:
      'bg-brand-dark text-white hover:bg-neutral-800 focus:ring-brand-dark shadow-sm hover:shadow active:scale-[0.99]',
    secondary:
      'bg-brand-accent text-white hover:bg-brand-accentHover focus:ring-brand-accent shadow-sm active:scale-[0.99]',
    outline:
      'border border-neutral-300 text-brand-dark bg-white hover:bg-neutral-50 hover:border-neutral-400 focus:ring-neutral-400',
    text:
      'text-brand-dark hover:text-brand-accent bg-transparent hover:bg-neutral-100/60 focus:ring-neutral-400'
  };

  const combinedStyles = `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
    variantStyles[variant] || variantStyles.primary
  } ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedStyles} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedStyles}
      {...props}
    >
      {children}
    </button>
  );
}
