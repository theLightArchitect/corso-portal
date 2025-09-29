/**
 * NextAuth.js Configuration for C0RS0 Portal
 * Integrates with Go backend and biblical cryptography
 */

import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWTPayload, Role, Permission, C0RS0Session, LoginCredentials } from '@/types/auth';
import { biblicalCrypto } from '@/lib/biblical-crypto';
import jwt from 'jsonwebtoken';

// Environment variables
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'c0rs0-divine-secret-7777';
const C0RS0_API_URL = process.env.C0RS0_API_URL || 'http://localhost:8080';
const JWT_SECRET = process.env.JWT_SECRET || NEXTAUTH_SECRET;

interface C0RS0User {
  id: string;
  email: string;
  name: string;
  role: Role;
  tier: string;
  permissions: Permission[];
  apiKey?: string;
  biblicalName: string;
  totpEnabled: boolean;
  isActive: boolean;
  lastLogin?: string;
}

/**
 * Authenticate user with C0RS0 backend
 */
async function authenticateUser(credentials: LoginCredentials): Promise<C0RS0User | null> {
  try {
    const response = await fetch(`${C0RS0_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'C0RS0-Portal/1.0',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        totpCode: credentials.totpCode,
        clientInfo: {
          userAgent: 'C0RS0-Portal',
          platform: 'web'
        }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Authentication failed');
    }

    const data = await response.json();

    if (!data.success || !data.user) {
      throw new Error('Invalid response from authentication service');
    }

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role as Role,
      tier: data.user.tier,
      permissions: data.user.permissions as Permission[],
      apiKey: data.user.apiKey,
      biblicalName: data.user.biblicalName || biblicalCrypto.assignBiblicalName(data.user.email, data.user.tier),
      totpEnabled: data.user.totpEnabled || false,
      isActive: data.user.isActive !== false,
      lastLogin: data.user.lastLogin
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Refresh user session with backend
 */
async function refreshUserSession(userId: string): Promise<C0RS0User | null> {
  try {
    const response = await fetch(`${C0RS0_API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`, // Simplified for refresh
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Session refresh error:', error);
    return null;
  }
}

/**
 * Create JWT payload with biblical elements
 */
function createJWTPayload(user: C0RS0User, sessionId: string): JWTPayload {
  const now = Math.floor(Date.now() / 1000);
  const biblicalElement = biblicalCrypto.getBiblicalElement(user.tier);

  if (!biblicalElement) {
    throw new Error(`Invalid tier: ${user.tier}`);
  }

  const payload: JWTPayload = {
    // Standard JWT claims
    sub: user.id,
    iss: 'c0rs0-portal',
    aud: 'c0rs0-platform',
    exp: now + (24 * 60 * 60), // 24 hours
    iat: now,
    nbf: now,
    jti: sessionId,

    // User information
    email: user.email,
    name: user.name,
    role: user.role,
    tier: user.tier,
    permissions: user.permissions,
    sessionId,
    apiKey: user.apiKey,

    // Biblical cryptography elements
    biblical: {
      name: user.biblicalName,
      element: biblicalElement,
      covenant: biblicalCrypto.generateCovenant(user.id, user.tier),
      seal: '', // Will be generated after payload creation
      tribe: user.tier,
      anointing: biblicalCrypto.generateAnointing(user.role, user.permissions)
    },

    // Security elements
    totpVerified: user.totpEnabled,
    mfaEnabled: user.totpEnabled,

    // Rate limiting (will be populated by backend)
    rateLimits: {
      callsPerMonth: 0,
      callsPerDay: 0,
      remainingCalls: 0,
      resetTime: 0
    }
  };

  // Generate divine seal
  payload.biblical.seal = biblicalCrypto.generateSeal(payload);

  return payload;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'c0rs0-credentials',
      name: 'C0RS0 Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'your@email.com'
        },
        password: {
          label: 'Password',
          type: 'password'
        },
        totpCode: {
          label: 'TOTP Code (if enabled)',
          type: 'text',
          placeholder: '000000'
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await authenticateUser({
          email: credentials.email,
          password: credentials.password,
          totpCode: credentials.totpCode
        });

        if (!user) {
          throw new Error('Invalid credentials or account not active');
        }

        if (!user.isActive) {
          throw new Error('Account has been deactivated. Please contact support.');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: null,
          role: user.role,
          tier: user.tier,
          permissions: user.permissions,
          apiKey: user.apiKey,
          biblicalName: user.biblicalName,
          totpEnabled: user.totpEnabled
        };
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update every hour
  },

  jwt: {
    secret: JWT_SECRET,
    maxAge: 24 * 60 * 60, // 24 hours
    encode: async ({ secret, token }) => {
      if (!token) {
        throw new Error('No token to encode');
      }

      // Create session ID
      const sessionId = biblicalCrypto.generateDivineRandom(16);

      // Create biblical JWT payload
      const payload = createJWTPayload(token as any, sessionId);

      // Sign with JWT library for compatibility
      return jwt.sign(payload, secret as string, {
        algorithm: 'HS256'
      });
    },
    decode: async ({ secret, token }) => {
      if (!token) {
        return null;
      }

      try {
        const decoded = jwt.verify(token, secret as string) as JWTPayload;

        // Validate biblical elements
        if (!biblicalCrypto.validateCovenant(decoded.biblical.covenant, decoded.sub, decoded.tier)) {
          console.error('Invalid covenant in JWT');
          return null;
        }

        if (!biblicalCrypto.validateSeal(decoded.biblical.seal, decoded)) {
          console.error('Invalid divine seal in JWT');
          return null;
        }

        return decoded as JWT;
      } catch (error) {
        console.error('JWT decode error:', error);
        return null;
      }
    }
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        token.role = user.role;
        token.tier = user.tier;
        token.permissions = user.permissions;
        token.apiKey = user.apiKey;
        token.biblicalName = user.biblicalName;
        token.totpEnabled = user.totpEnabled;
        token.sessionId = biblicalCrypto.generateDivineRandom(16);
      }

      // Refresh session if token is older than update age
      if (token.iat && Date.now() - token.iat * 1000 > 60 * 60 * 1000) {
        const refreshedUser = await refreshUserSession(token.sub as string);
        if (refreshedUser) {
          token.role = refreshedUser.role;
          token.tier = refreshedUser.tier;
          token.permissions = refreshedUser.permissions;
          token.apiKey = refreshedUser.apiKey;
          token.biblicalName = refreshedUser.biblicalName;
          token.totpEnabled = refreshedUser.totpEnabled;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        const jwtPayload = token as unknown as JWTPayload;

        const c0rs0Session: C0RS0Session = {
          user: {
            id: jwtPayload.sub,
            email: jwtPayload.email,
            name: jwtPayload.name,
            role: jwtPayload.role,
            tier: jwtPayload.tier,
            permissions: jwtPayload.permissions,
            biblicalName: jwtPayload.biblical?.name
          },
          accessToken: '', // Will be set by middleware
          refreshToken: '', // Will be set by middleware
          expires: new Date(jwtPayload.exp * 1000).toISOString(),
          apiKey: jwtPayload.apiKey,
          sessionId: jwtPayload.sessionId,
          totpEnabled: jwtPayload.totpVerified,
          lastActivity: new Date().toISOString()
        };

        return c0rs0Session;
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      // Additional sign-in validation
      if (user.role && user.tier) {
        // Log security event
        console.log(`User ${user.email} signed in with role ${user.role} and tier ${user.tier}`);
        return true;
      }

      return false;
    },

    async signOut({ token }) {
      // Log sign-out event
      if (token?.sub) {
        console.log(`User ${token.sub} signed out`);

        // Optionally call backend to invalidate session
        try {
          await fetch(`${C0RS0_API_URL}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token.sub}`,
            },
            body: JSON.stringify({ sessionId: token.sessionId }),
          });
        } catch (error) {
          console.error('Backend logout error:', error);
        }
      }
    }
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('Sign in event:', { user: user.email, isNewUser });
    },
    async signOut({ token }) {
      console.log('Sign out event:', { user: token?.email });
    },
    async createUser({ user }) {
      console.log('Create user event:', { user: user.email });
    },
    async session({ session, token }) {
      // Update last activity in backend
      if (token?.sub) {
        try {
          await fetch(`${C0RS0_API_URL}/api/auth/activity`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token.sub}`,
            },
            body: JSON.stringify({
              sessionId: token.sessionId,
              timestamp: new Date().toISOString()
            }),
          });
        } catch (error) {
          // Silently fail - not critical
        }
      }
    }
  },

  secret: NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};