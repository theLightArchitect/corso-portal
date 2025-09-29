/**
 * Loading Spinner Component with Biblical Theming
 */

'use client';

import React from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'biblical' | 'wisdom';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'biblical',
  className,
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    biblical: 'text-purple-600',
    wisdom: 'text-amber-600'
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-t-transparent',
          sizeClasses[size],
          colorClasses[color]
        )}
        role="status"
        aria-label={text || 'Loading'}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {text}
        </p>
      )}
    </div>
  );
};