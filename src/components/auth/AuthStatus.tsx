/**
 * Authentication Status Component
 * Shows current user status and biblical identity
 */

'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/stores/auth-store';
import { C0RS0Session, BIBLICAL_ELEMENTS } from '@/types/auth';
import { Crown, Shield, User, Star, Zap } from 'lucide-react';
import { BiblicalCard } from '@/components/ui/BiblicalCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import SignOutButton from './SignOutButton';
import { clsx } from 'clsx';

interface AuthStatusProps {
  variant?: 'full' | 'compact' | 'minimal';
  showBiblicalIdentity?: boolean;
  showPermissions?: boolean;
  className?: string;
}

export const AuthStatus: React.FC<AuthStatusProps> = ({
  variant = 'full',
  showBiblicalIdentity = true,
  showPermissions = false,
  className
}) => {
  const { data: session, status } = useSession();
  const { getBiblicalIdentity, anointingLevel } = useAuthStore();

  if (status === 'loading') {
    return (
      <div className={clsx('flex items-center space-x-2', className)}>
        <LoadingSpinner size="sm" />
        <span className="text-sm text-gray-500">Checking authorization...</span>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className={clsx('text-sm text-gray-500', className)}>
        Not authenticated
      </div>
    );
  }

  const c0rs0Session = session as C0RS0Session;
  const biblicalElement = getBiblicalIdentity();

  const getRoleIcon = () => {
    switch (c0rs0Session.user.role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'enterprise':
        return <Star className="w-4 h-4 text-purple-500" />;
      case 'team':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'pro':
        return <Zap className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    const colors = {
      explorer: 'text-gray-600 bg-gray-100',
      developer: 'text-blue-600 bg-blue-100',
      professional: 'text-purple-600 bg-purple-100',
      team: 'text-green-600 bg-green-100',
      enterprise: 'text-indigo-600 bg-indigo-100',
      sovereign: 'text-yellow-600 bg-yellow-100',
      academic: 'text-teal-600 bg-teal-100'
    };
    return colors[tier as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  if (variant === 'minimal') {
    return (
      <div className={clsx('flex items-center space-x-2', className)}>
        {getRoleIcon()}
        <span className="text-sm font-medium">
          {c0rs0Session.user.biblicalName || c0rs0Session.user.name}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={clsx('flex items-center justify-between space-x-3', className)}>
        <div className="flex items-center space-x-2">
          {getRoleIcon()}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {c0rs0Session.user.biblicalName || c0rs0Session.user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {c0rs0Session.user.email}
            </p>
          </div>
        </div>
        <SignOutButton variant="icon" showConfirmation={false} />
      </div>
    );
  }

  return (
    <BiblicalCard className={className}>
      <div className="biblical-card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              {getRoleIcon()}
            </div>
            <div>
              <h3 className="biblical-heading text-lg">
                Sacred Identity
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current covenant status
              </p>
            </div>
          </div>
          <SignOutButton variant="biblical" size="sm" />
        </div>
      </div>

      <div className="biblical-card-content space-y-4">
        {/* User Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Name:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {c0rs0Session.user.name}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email:
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {c0rs0Session.user.email}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Role:
            </span>
            <div className="flex items-center space-x-2">
              {getRoleIcon()}
              <span className="text-sm font-medium capitalize">
                {c0rs0Session.user.role}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tier:
            </span>
            <span className={clsx(
              'text-xs px-2 py-1 rounded-full font-medium capitalize',
              getTierColor(c0rs0Session.user.tier)
            )}>
              {c0rs0Session.user.tier}
            </span>
          </div>
        </div>

        {/* Biblical Identity */}
        {showBiblicalIdentity && biblicalElement && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="biblical-text font-medium text-gray-900 dark:text-white mb-3">
              Biblical Identity
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name:
                </span>
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  {c0rs0Session.user.biblicalName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Element:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {biblicalElement.name} ({biblicalElement.hebrew})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Meaning:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {biblicalElement.meaning}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Anointing:
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full"
                      style={{ width: `${Math.min((anointingLevel / 84) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {anointingLevel}/84
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                <p className="text-xs font-medium text-purple-800 dark:text-purple-200 mb-1">
                  {biblicalElement.verse}
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300 italic">
                  Divine power: {biblicalElement.power}/100
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Permissions */}
        {showPermissions && c0rs0Session.user.permissions.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="biblical-text font-medium text-gray-900 dark:text-white mb-3">
              Sacred Permissions
            </h4>
            <div className="flex flex-wrap gap-1">
              {c0rs0Session.user.permissions.slice(0, 6).map((permission) => (
                <span
                  key={permission}
                  className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full border border-blue-200 dark:border-blue-800"
                >
                  {permission.replace(/_/g, ' ').toLowerCase()}
                </span>
              ))}
              {c0rs0Session.user.permissions.length > 6 && (
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                  +{c0rs0Session.user.permissions.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Session Information */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div>
              <span className="font-medium">Session:</span>
              <br />
              {c0rs0Session.sessionId.substring(0, 8)}...
            </div>
            <div>
              <span className="font-medium">TOTP:</span>
              <br />
              {c0rs0Session.totpEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
      </div>
    </BiblicalCard>
  );
};

export default AuthStatus;