'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  variant?: 'primary' | 'secondary' | 'minimal';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  variant = 'primary',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-12 h-12';
      default:
        return 'w-8 h-8';
    }
  };

  const getContainerClasses = () => {
    switch (size) {
      case 'small':
        return 'p-2';
      case 'large':
        return 'p-8';
      default:
        return 'p-4';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className={`${getSizeClasses()} text-biblical-king-400 animate-spin`} />
      </div>
    );
  }

  if (variant === 'secondary') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <Loader2 className={`${getSizeClasses()} text-biblical-wisdom-400 animate-spin`} />
        {message && (
          <span className={`${getTextSize()} text-gray-300 font-medium`}>
            {message}
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center ${getContainerClasses()} ${className}`}
    >
      {/* Biblical Loading Animation */}
      <div className="relative">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className={`${getSizeClasses()} border-2 border-biblical-king-500/30 border-t-biblical-king-500 rounded-full`}
        />

        {/* Inner Crown */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Crown className={`${size === 'small' ? 'w-2 h-2' : size === 'large' ? 'w-6 h-6' : 'w-4 h-4'} text-biblical-king-400 animate-biblical-glow`} />
        </motion.div>
      </div>

      {/* Pulsing Dots */}
      {size !== 'small' && (
        <div className="flex space-x-1 mt-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
              }}
              className="w-2 h-2 bg-biblical-king-400 rounded-full"
            />
          ))}
        </div>
      )}

      {/* Loading Message */}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mt-4 ${getTextSize()} text-gray-300 font-medium text-center`}
        >
          {message}
        </motion.p>
      )}

      {/* Biblical Quote (for large size) */}
      {size === 'large' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-2 text-sm text-biblical-king-300 italic text-center max-w-xs"
        >
          "Wait upon the LORD, and He shall save thee" - Proverbs 20:22
        </motion.p>
      )}
    </motion.div>
  );
};

// Skeleton Loading Components
interface SkeletonProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30 p-6 animate-pulse ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-12 h-12 bg-gray-700 rounded-lg" />
      <div className="flex-1">
        <div className="h-6 bg-gray-700 rounded mb-2" />
        <div className="h-4 bg-gray-700 rounded w-3/4" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-700 rounded" />
      <div className="h-4 bg-gray-700 rounded w-5/6" />
      <div className="h-4 bg-gray-700 rounded w-2/3" />
    </div>
  </div>
);

export const SkeletonChart: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30 p-6 animate-pulse ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 bg-gray-700 rounded w-1/3" />
      <div className="w-8 h-8 bg-gray-700 rounded" />
    </div>
    <div className="h-64 bg-gray-700 rounded" />
  </div>
);

export const SkeletonTable: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30 animate-pulse ${className}`}>
    <div className="p-6 border-b border-gray-600/30">
      <div className="h-6 bg-gray-700 rounded w-1/4" />
    </div>
    <div className="divide-y divide-gray-600/30">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="p-4 flex space-x-4">
          <div className="flex-1 h-4 bg-gray-700 rounded" />
          <div className="w-20 h-4 bg-gray-700 rounded" />
          <div className="w-16 h-4 bg-gray-700 rounded" />
          <div className="w-12 h-4 bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonStats: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
    {[...Array(4)].map((_, index) => (
      <div key={index} className="bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30 p-4 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-8 bg-gray-700 rounded-lg" />
          <div className="w-12 h-4 bg-gray-700 rounded" />
        </div>
        <div className="h-4 bg-gray-700 rounded mb-2" />
        <div className="h-6 bg-gray-700 rounded w-2/3" />
      </div>
    ))}
  </div>
);

// Full Page Loading
export const FullPageLoading: React.FC<{ message?: string }> = ({ message = "Loading thy divine dashboard..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <LoadingSpinner size="large" message={message} />
  </div>
);

// Section Loading
export const SectionLoading: React.FC<{ message?: string; className?: string }> = ({
  message = "Loading...",
  className = ''
}) => (
  <div className={`flex items-center justify-center py-12 ${className}`}>
    <LoadingSpinner size="medium" message={message} variant="secondary" />
  </div>
);