/**
 * Sign Out Button Component with Biblical Theming
 */

'use client';

import React, { useState } from 'react';
import { LogOut, AlertTriangle, Crown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { clsx } from 'clsx';

interface SignOutButtonProps {
  variant?: 'default' | 'icon' | 'text' | 'biblical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showConfirmation?: boolean;
  biblicalMessage?: boolean;
  onSignOut?: () => void;
}

export const SignOutButton: React.FC<SignOutButtonProps> = ({
  variant = 'default',
  size = 'md',
  className,
  showConfirmation = true,
  biblicalMessage = true,
  onSignOut
}) => {
  const { signOutUser, loading, session } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (showConfirmation && !showModal) {
      setShowModal(true);
      return;
    }

    try {
      setIsSigningOut(true);
      await signOutUser();
      onSignOut?.();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
      setShowModal(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const getButtonContent = () => {
    if (isSigningOut || loading) {
      return (
        <div className="flex items-center space-x-2">
          <LoadingSpinner size="sm" />
          <span>Departing...</span>
        </div>
      );
    }

    switch (variant) {
      case 'icon':
        return <LogOut className="w-4 h-4" />;
      case 'text':
        return 'Sign Out';
      case 'biblical':
        return (
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4" />
            <span>Depart in Peace</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
        );
    }
  };

  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    switch (variant) {
      case 'icon':
        return clsx(
          baseStyles,
          'p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
          'focus:ring-gray-500'
        );
      case 'text':
        return clsx(
          baseStyles,
          'text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
          sizeClasses[size],
          'focus:ring-gray-500'
        );
      case 'biblical':
        return clsx(
          baseStyles,
          'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
          'text-white shadow-md hover:shadow-lg',
          sizeClasses[size],
          'focus:ring-amber-500'
        );
      default:
        return clsx(
          baseStyles,
          'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg',
          sizeClasses[size],
          'focus:ring-red-500'
        );
    }
  };

  const getBiblicalFarewell = () => {
    const farewells = [
      {
        text: "The LORD bless you and keep you",
        reference: "Numbers 6:24"
      },
      {
        text: "Go in peace, and may His grace be with you",
        reference: "Luke 7:50"
      },
      {
        text: "May the peace of God be with your spirit",
        reference: "Galatians 6:18"
      },
      {
        text: "The Lord be with you until we meet again",
        reference: "Ruth 2:4"
      }
    ];

    return farewells[Math.floor(Math.random() * farewells.length)];
  };

  const farewell = getBiblicalFarewell();

  return (
    <>
      <button
        onClick={handleSignOut}
        disabled={isSigningOut || loading}
        className={clsx(
          getButtonStyles(),
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        title={variant === 'icon' ? 'Sign Out' : undefined}
      >
        {getButtonContent()}
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 px-6 py-4 border-b border-amber-200 dark:border-amber-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Confirm Departure
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    End your sacred session
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="text-center space-y-3">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />

                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Are you sure you want to sign out of your sacred session?
                  </p>

                  {session && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Signed in as: <span className="font-medium">{session.user.email}</span>
                      {session.user.biblicalName && (
                        <span className="block text-purple-600 dark:text-purple-400">
                          Biblical identity: {session.user.biblicalName}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {biblicalMessage && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-700">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                      {farewell.reference}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 italic">
                      "{farewell.text}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex space-x-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Stay
              </button>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningOut ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span>Departing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4" />
                    <span>Depart in Peace</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignOutButton;