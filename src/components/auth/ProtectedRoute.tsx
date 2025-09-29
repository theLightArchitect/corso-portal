/**
 * Protected Route Component
 * Wraps content that requires authentication and specific permissions
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Permission, Role, C0RS0Session } from '@/types/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BiblicalCard } from '@/components/ui/BiblicalCard';
import { Crown, Shield, AlertTriangle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRole?: Role;
  requiredAgent?: string;
  requiredLayer?: number;
  fallback?: React.ReactNode;
  showLoading?: boolean;
  redirectTo?: string;
}

interface AccessDeniedProps {
  type: 'permission' | 'role' | 'agent' | 'layer';
  required: string[] | string;
  current?: string[] | string;
  biblicalMessage?: {
    reference: string;
    text: string;
  };
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  type,
  required,
  current,
  biblicalMessage
}) => {
  const getIcon = () => {
    switch (type) {
      case 'role':
        return <Crown className="w-12 h-12 text-amber-500" />;
      case 'permission':
        return <Shield className="w-12 h-12 text-red-500" />;
      case 'agent':
        return <Lock className="w-12 h-12 text-purple-500" />;
      case 'layer':
        return <AlertTriangle className="w-12 h-12 text-orange-500" />;
      default:
        return <Shield className="w-12 h-12 text-gray-500" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'role':
        return 'Insufficient Role Authority';
      case 'permission':
        return 'Missing Sacred Permissions';
      case 'agent':
        return 'KJVA⁸ Agent Access Denied';
      case 'layer':
        return 'Layer Access Restricted';
      default:
        return 'Access Denied';
    }
  };

  const getDescription = () => {
    const requiredStr = Array.isArray(required) ? required.join(', ') : required;
    const currentStr = Array.isArray(current) ? current.join(', ') : current;

    switch (type) {
      case 'role':
        return `This sacred ground requires ${requiredStr} authority. Your current role: ${currentStr}`;
      case 'permission':
        return `The following divine permissions are required: ${requiredStr}`;
      case 'agent':
        return `Access to the ${requiredStr} agent requires divine authorization`;
      case 'layer':
        return `Layer ${requiredStr} access requires enhanced covenant standing`;
      default:
        return 'You do not have sufficient authority to access this area';
    }
  };

  const defaultBiblicalMessage = {
    reference: 'Proverbs 3:5-6',
    text: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.'
  };

  const message = biblicalMessage || defaultBiblicalMessage;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-purple-900 p-4">
      <BiblicalCard className="max-w-lg w-full text-center">
        <div className="biblical-card-content space-y-6">
          <div className="flex justify-center">
            {getIcon()}
          </div>

          <div className="space-y-3">
            <h1 className="biblical-heading text-2xl text-gray-900 dark:text-white">
              {getTitle()}
            </h1>

            <p className="text-gray-600 dark:text-gray-300">
              {getDescription()}
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="biblical-text text-sm space-y-2">
              <p className="font-semibold text-amber-800 dark:text-amber-200">
                {message.reference}
              </p>
              <p className="text-amber-700 dark:text-amber-300 italic">
                "{message.text}"
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>If you believe this is an error, please contact your administrator.</p>
            <p>Your spiritual journey continues with the permissions you have been granted.</p>
          </div>
        </div>
      </BiblicalCard>
    </div>
  );
};

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-purple-900">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <div className="space-y-2">
        <p className="biblical-text text-lg text-gray-700 dark:text-gray-300">
          Seeking divine authorization...
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Validating your covenant standing
        </p>
      </div>
    </div>
  </div>
);

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  requiredAgent,
  requiredLayer,
  fallback,
  showLoading = true,
  redirectTo
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    hasPermission,
    canAccessAgent,
    canAccessLayer,
    hasRole,
    getBiblicalIdentity
  } = useAuthStore();

  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (status === 'unauthenticated') {
      const signInUrl = redirectTo || `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      router.push(signInUrl);
      return;
    }

    // Mark access as checked once we have session status
    if (status !== 'loading') {
      setAccessChecked(true);
    }
  }, [status, router, redirectTo]);

  // Show loading screen while checking authentication
  if (status === 'loading' || !accessChecked) {
    return showLoading ? <LoadingScreen /> : null;
  }

  // Not authenticated - this shouldn't happen due to middleware, but just in case
  if (!session) {
    return fallback || <AccessDenied type="permission" required="Valid session" />;
  }

  const c0rs0Session = session as C0RS0Session;
  const biblicalIdentity = getBiblicalIdentity();

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <AccessDenied
        type="role"
        required={requiredRole}
        current={c0rs0Session.user.role}
        biblicalMessage={{
          reference: 'Romans 13:1',
          text: 'Let everyone be subject to the governing authorities, for there is no authority except that which God has established.'
        }}
      />
    );
  }

  // Check permission requirements
  const missingPermissions = requiredPermissions.filter(perm => !hasPermission(perm));
  if (missingPermissions.length > 0) {
    return (
      <AccessDenied
        type="permission"
        required={missingPermissions}
        current={c0rs0Session.user.permissions}
        biblicalMessage={{
          reference: '1 Corinthians 4:2',
          text: 'Now it is required that those who have been given a trust must prove faithful.'
        }}
      />
    );
  }

  // Check agent access requirement
  if (requiredAgent && !canAccessAgent(requiredAgent)) {
    return (
      <AccessDenied
        type="agent"
        required={requiredAgent}
        biblicalMessage={{
          reference: 'Matthew 7:7',
          text: 'Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.'
        }}
      />
    );
  }

  // Check layer access requirement
  if (requiredLayer && !canAccessLayer(requiredLayer)) {
    return (
      <AccessDenied
        type="layer"
        required={requiredLayer.toString()}
        biblicalMessage={{
          reference: 'Ephesians 4:13',
          text: 'Until we all reach unity in the faith and in the knowledge of the Son of God and become mature, attaining to the whole measure of the fullness of Christ.'
        }}
      />
    );
  }

  // All access checks passed
  return <>{children}</>;
};

// Higher-order component for easier usage
export function withProtection(
  Component: React.ComponentType<any>,
  protectionOptions: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: any) {
    return (
      <ProtectedRoute {...protectionOptions}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Specific protection components for common use cases
export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={Role.ADMIN}>
    {children}
  </ProtectedRoute>
);

export const TeamOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={Role.TEAM}>
    {children}
  </ProtectedRoute>
);

export const EnterpriseOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={Role.ENTERPRISE}>
    {children}
  </ProtectedRoute>
);

export const AgentAccess: React.FC<{ agent: string; children: React.ReactNode }> = ({ agent, children }) => (
  <ProtectedRoute requiredAgent={agent}>
    {children}
  </ProtectedRoute>
);

export const LayerAccess: React.FC<{ layer: number; children: React.ReactNode }> = ({ layer, children }) => (
  <ProtectedRoute requiredLayer={layer}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;