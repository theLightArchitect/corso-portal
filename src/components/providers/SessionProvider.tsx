/**
 * Session Provider Wrapper
 * Provides authentication context to the entire application
 */

'use client';

import React from 'react';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useAuthStore } from '@/stores/auth-store';

interface SessionProviderProps {
  children: React.ReactNode;
  session?: any;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  session
}) => {
  return (
    <NextAuthSessionProvider session={session} refetchInterval={300}>
      <AuthStoreProvider>
        {children}
      </AuthStoreProvider>
    </NextAuthSessionProvider>
  );
};

/**
 * Auth Store Provider
 * Initializes the auth store and keeps it in sync with NextAuth
 */
const AuthStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initialize } = useAuthStore();

  React.useEffect(() => {
    // Initialize auth store when component mounts
    initialize();
  }, [initialize]);

  return <>{children}</>;
};

export default SessionProvider;