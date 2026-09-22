import React from 'react';

export default function PageContainer({
  children,
  className = '',
  maxWidth = 'default'
}) {
  const widthClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    default: 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${
        widthClasses[maxWidth] || widthClasses.default
      } ${className}`}
    >
      {children}
    </div>
  );
}
