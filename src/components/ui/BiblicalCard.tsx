/**
 * Biblical Card Component with Divine Styling
 */

'use client';

import React from 'react';
import { clsx } from 'clsx';

interface BiblicalCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'divine' | 'wisdom';
  glowEffect?: boolean;
}

export const BiblicalCard: React.FC<BiblicalCardProps> = ({
  children,
  className,
  variant = 'default',
  glowEffect = false
}) => {
  const variantClasses = {
    default: 'biblical-card',
    elevated: 'biblical-card shadow-lg',
    divine: 'biblical-card biblical-glow border-purple-200 dark:border-purple-700',
    wisdom: 'biblical-card wisdom-glow border-amber-200 dark:border-amber-700'
  };

  return (
    <div
      className={clsx(
        variantClasses[variant],
        glowEffect && 'biblical-glow',
        className
      )}
    >
      {children}
    </div>
  );
};