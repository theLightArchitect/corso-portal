/**
 * Authentication Store using Zustand
 * Manages global authentication state with biblical elements
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { signIn, signOut, getSession } from 'next-auth/react';
import {
  AuthContextType,
  C0RS0Session,
  Permission,
  Role,
  BiblicalElement,
  LoginCredentials,
  TOTPSetupData,
  SessionActivity,
  SecurityEvent,
  BIBLICAL_ELEMENTS,
  AGENT_PERMISSIONS,
  LAYER_PERMISSIONS
} from '@/types/auth';
import { biblicalCrypto } from '@/lib/biblical-crypto';

interface AuthState {
  // Session state
  session: C0RS0Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  loading: boolean;

  // Security state
  securityEvents: SecurityEvent[];
  sessionActivity: SessionActivity[];
  totpSetup: TOTPSetupData | null;

  // Biblical state
  activeCovenants: string[];
  biblicalIdentity: BiblicalElement | null;
  anointingLevel: number;

  // Actions
  initialize: () => Promise<void>;
  signInWithCredentials: (credentials: LoginCredentials) => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;

  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  canAccessAgent: (agentName: string) => boolean;
  canAccessLayer: (layer: number) => boolean;
  hasRole: (role: Role) => boolean;

  // Biblical functions
  getBiblicalIdentity: () => BiblicalElement | null;
  getActiveCovenants: () => string[];
  renewCovenant: () => Promise<void>;

  // Security functions
  setupTOTP: () => Promise<TOTPSetupData>;
  verifyTOTP: (code: string) => Promise<boolean>;
  getSecurityEvents: () => SecurityEvent[];
  getSessionActivity: () => SessionActivity[];
  logSecurityEvent: (event: Omit<SecurityEvent, 'timestamp'>) => void;

  // Session management
  updateLastActivity: () => void;
  checkSessionTimeout: () => boolean;
  extendSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      status: 'loading',
      error: null,
      loading: false,
      securityEvents: [],
      sessionActivity: [],
      totpSetup: null,
      activeCovenants: [],
      biblicalIdentity: null,
      anointingLevel: 0,

      // Initialize authentication
      initialize: async () => {
        try {
          set({ status: 'loading' });
          const session = await getSession();

          if (session) {
            const c0rs0Session = session as C0RS0Session;
            const biblicalElement = BIBLICAL_ELEMENTS[c0rs0Session.user.tier];

            set({
              session: c0rs0Session,
              status: 'authenticated',
              biblicalIdentity: biblicalElement || null,
              anointingLevel: biblicalCrypto.generateAnointing(
                c0rs0Session.user.role,
                c0rs0Session.user.permissions
              ),
              activeCovenants: biblicalElement ? [
                biblicalCrypto.generateCovenant(c0rs0Session.user.id, c0rs0Session.user.tier)
              ] : []
            });

            // Log successful session initialization
            get().logSecurityEvent({
              type: 'session_initialized',
              ip: 'unknown',
              userAgent: navigator.userAgent,
              details: { tier: c0rs0Session.user.tier, role: c0rs0Session.user.role },
              severity: 'low'
            });
          } else {
            set({ status: 'unauthenticated', session: null });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({
            status: 'unauthenticated',
            error: 'Failed to initialize authentication',
            session: null
          });
        }
      },

      // Sign in with credentials
      signInWithCredentials: async (credentials: LoginCredentials) => {
        try {
          set({ loading: true, error: null });

          const result = await signIn('c0rs0-credentials', {
            email: credentials.email,
            password: credentials.password,
            totpCode: credentials.totpCode,
            redirect: false
          });

          if (result?.error) {
            throw new Error(result.error);
          }

          // Get updated session
          const session = await getSession();
          if (session) {
            const c0rs0Session = session as C0RS0Session;
            const biblicalElement = BIBLICAL_ELEMENTS[c0rs0Session.user.tier];

            set({
              session: c0rs0Session,
              status: 'authenticated',
              biblicalIdentity: biblicalElement || null,
              anointingLevel: biblicalCrypto.generateAnointing(
                c0rs0Session.user.role,
                c0rs0Session.user.permissions
              ),
              activeCovenants: biblicalElement ? [
                biblicalCrypto.generateCovenant(c0rs0Session.user.id, c0rs0Session.user.tier)
              ] : [],
              loading: false
            });

            // Log successful sign in
            get().logSecurityEvent({
              type: 'login',
              ip: 'unknown',
              userAgent: navigator.userAgent,
              details: { email: credentials.email, rememberMe: credentials.rememberMe },
              severity: 'low'
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
          set({
            error: errorMessage,
            loading: false,
            status: 'unauthenticated'
          });

          // Log failed sign in
          get().logSecurityEvent({
            type: 'failed_login',
            ip: 'unknown',
            userAgent: navigator.userAgent,
            details: { email: credentials.email, error: errorMessage },
            severity: 'medium'
          });

          throw error;
        }
      },

      // Sign out user
      signOutUser: async () => {
        try {
          const { session } = get();

          // Log sign out
          get().logSecurityEvent({
            type: 'logout',
            ip: 'unknown',
            userAgent: navigator.userAgent,
            details: { sessionId: session?.sessionId },
            severity: 'low'
          });

          await signOut({ redirect: false });

          set({
            session: null,
            status: 'unauthenticated',
            biblicalIdentity: null,
            anointingLevel: 0,
            activeCovenants: [],
            error: null
          });
        } catch (error) {
          console.error('Sign out error:', error);
          set({ error: 'Failed to sign out' });
        }
      },

      // Refresh session
      refreshSession: async () => {
        try {
          set({ loading: true });
          const session = await getSession();

          if (session) {
            const c0rs0Session = session as C0RS0Session;
            const biblicalElement = BIBLICAL_ELEMENTS[c0rs0Session.user.tier];

            set({
              session: c0rs0Session,
              status: 'authenticated',
              biblicalIdentity: biblicalElement || null,
              anointingLevel: biblicalCrypto.generateAnointing(
                c0rs0Session.user.role,
                c0rs0Session.user.permissions
              ),
              loading: false
            });
          } else {
            set({ status: 'unauthenticated', session: null, loading: false });
          }
        } catch (error) {
          console.error('Session refresh error:', error);
          set({ error: 'Failed to refresh session', loading: false });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Permission checks
      hasPermission: (permission: Permission) => {
        const { session } = get();
        if (!session) return false;
        return session.user.permissions.includes(permission);
      },

      canAccessAgent: (agentName: string) => {
        const { session } = get();
        if (!session) return false;

        const requiredPermission = AGENT_PERMISSIONS[agentName];
        if (!requiredPermission) return false;

        return session.user.permissions.includes(requiredPermission);
      },

      canAccessLayer: (layer: number) => {
        const { session } = get();
        if (!session) return false;

        const requiredPermission = LAYER_PERMISSIONS[layer];
        if (!requiredPermission) return false;

        return session.user.permissions.includes(requiredPermission);
      },

      hasRole: (role: Role) => {
        const { session } = get();
        if (!session) return false;

        // Check exact role or higher
        const roleHierarchy: Record<Role, number> = {
          [Role.GUEST]: 0,
          [Role.PRO]: 1,
          [Role.TEAM]: 2,
          [Role.ACADEMIC]: 2,
          [Role.ENTERPRISE]: 3,
          [Role.ADMIN]: 4
        };

        const userLevel = roleHierarchy[session.user.role] || 0;
        const requiredLevel = roleHierarchy[role] || 0;

        return userLevel >= requiredLevel;
      },

      // Biblical functions
      getBiblicalIdentity: () => {
        return get().biblicalIdentity;
      },

      getActiveCovenants: () => {
        return get().activeCovenants;
      },

      renewCovenant: async () => {
        const { session } = get();
        if (!session) return;

        try {
          const newCovenant = biblicalCrypto.generateCovenant(
            session.user.id,
            session.user.tier
          );

          set({
            activeCovenants: [newCovenant]
          });

          // Log covenant renewal
          get().logSecurityEvent({
            type: 'password_change', // Closest equivalent
            ip: 'unknown',
            userAgent: navigator.userAgent,
            details: { action: 'covenant_renewal', tier: session.user.tier },
            severity: 'low'
          });
        } catch (error) {
          console.error('Covenant renewal error:', error);
          set({ error: 'Failed to renew covenant' });
        }
      },

      // Security functions
      setupTOTP: async () => {
        const { session } = get();
        if (!session) {
          throw new Error('No active session');
        }

        try {
          // In a real implementation, this would call the backend API
          const totpData: TOTPSetupData = {
            secret: biblicalCrypto.generateDivineRandom(32),
            qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
            backupCodes: Array.from({ length: 10 }, () => biblicalCrypto.generateDivineRandom(8))
          };

          set({ totpSetup: totpData });

          // Log TOTP setup
          get().logSecurityEvent({
            type: 'totp_setup',
            ip: 'unknown',
            userAgent: navigator.userAgent,
            details: { userId: session.user.id },
            severity: 'medium'
          });

          return totpData;
        } catch (error) {
          console.error('TOTP setup error:', error);
          throw new Error('Failed to setup TOTP');
        }
      },

      verifyTOTP: async (code: string) => {
        const { session, totpSetup } = get();
        if (!session || !totpSetup) {
          return false;
        }

        try {
          // In a real implementation, this would verify with the backend
          // For now, we'll use biblical OTP verification
          const isValid = biblicalCrypto.validateBiblicalOTP(
            session.user.email,
            'Psalm 23:1', // Default verse for TOTP
            code
          );

          if (isValid) {
            // Update session to mark TOTP as verified
            set({
              session: {
                ...session,
                totpEnabled: true
              },
              totpSetup: null
            });

            // Log successful TOTP verification
            get().logSecurityEvent({
              type: 'totp_setup',
              ip: 'unknown',
              userAgent: navigator.userAgent,
              details: { action: 'verified', userId: session.user.id },
              severity: 'low'
            });
          }

          return isValid;
        } catch (error) {
          console.error('TOTP verification error:', error);
          return false;
        }
      },

      getSecurityEvents: () => {
        return get().securityEvents;
      },

      getSessionActivity: () => {
        return get().sessionActivity;
      },

      logSecurityEvent: (event: Omit<SecurityEvent, 'timestamp'>) => {
        const fullEvent: SecurityEvent = {
          ...event,
          timestamp: new Date().toISOString()
        };

        set(state => ({
          securityEvents: [fullEvent, ...state.securityEvents].slice(0, 100) // Keep last 100 events
        }));
      },

      // Session management
      updateLastActivity: () => {
        const { session } = get();
        if (session) {
          set({
            session: {
              ...session,
              lastActivity: new Date().toISOString()
            }
          });
        }
      },

      checkSessionTimeout: () => {
        const { session } = get();
        if (!session) return true;

        const sessionExpiry = new Date(session.expires);
        const now = new Date();

        return now > sessionExpiry;
      },

      extendSession: async () => {
        try {
          await get().refreshSession();
        } catch (error) {
          console.error('Session extension error:', error);
          set({ error: 'Failed to extend session' });
        }
      }
    }),
    {
      name: 'c0rs0-auth-store',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for security
      partialize: (state) => ({
        // Only persist non-sensitive data
        biblicalIdentity: state.biblicalIdentity,
        anointingLevel: state.anointingLevel,
        securityEvents: state.securityEvents.slice(0, 10), // Only last 10 events
      }),
    }
  )
);

// Auto-initialize on store creation
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
}

// Export store methods for use in components
export const authActions = {
  signIn: (credentials: LoginCredentials) => useAuthStore.getState().signInWithCredentials(credentials),
  signOut: () => useAuthStore.getState().signOutUser(),
  refresh: () => useAuthStore.getState().refreshSession(),
  hasPermission: (permission: Permission) => useAuthStore.getState().hasPermission(permission),
  canAccessAgent: (agentName: string) => useAuthStore.getState().canAccessAgent(agentName),
  canAccessLayer: (layer: number) => useAuthStore.getState().canAccessLayer(layer),
  hasRole: (role: Role) => useAuthStore.getState().hasRole(role),
  getBiblicalIdentity: () => useAuthStore.getState().getBiblicalIdentity(),
  setupTOTP: () => useAuthStore.getState().setupTOTP(),
  verifyTOTP: (code: string) => useAuthStore.getState().verifyTOTP(code),
};