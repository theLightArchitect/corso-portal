/**
 * Authentication Middleware for C0RS0 Portal
 * Protects routes and validates biblical cryptography
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { JWTPayload, Permission, Role } from '@/types/auth';
import { biblicalCrypto } from '@/lib/biblical-crypto';

// Protected route patterns
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/billing',
  '/agents',
  '/analytics',
  '/team',
  '/admin',
  '/api/protected'
];

// Admin-only routes
const ADMIN_ROUTES = [
  '/admin',
  '/api/admin'
];

// Team management routes
const TEAM_ROUTES = [
  '/team',
  '/api/team'
];

// Enterprise-only routes
const ENTERPRISE_ROUTES = [
  '/analytics/advanced',
  '/custom-agents',
  '/api/enterprise'
];

// API routes that require specific permissions
const PERMISSION_ROUTES: Record<string, Permission[]> = {
  '/api/agents/k1ng-dav1d': [Permission.KING_DAVID_ACCESS],
  '/api/agents/3l1j4h': [Permission.ELIJAH_ACCESS],
  '/api/agents/m3lch1z3d3k': [Permission.MELCHIZEDEK_ACCESS],
  '/api/agents/m0s3s': [Permission.MOSES_ACCESS],
  '/api/agents/d4n13l': [Permission.DANIEL_ACCESS],
  '/api/agents/j05hu4': [Permission.JOSHUA_ACCESS],
  '/api/agents/3z3k13l': [Permission.EZEKIEL_ACCESS],
  '/api/agents/iesous': [Permission.IESOUS_ACCESS],
  '/api/billing': [Permission.BILLING_ACCESS],
  '/api/analytics': [Permission.ANALYTICS_ACCESS],
  '/api/custom-agents': [Permission.CUSTOM_AGENTS],
};

/**
 * Check if route requires authentication
 */
function requiresAuth(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if route requires admin access
 */
function requiresAdmin(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if route requires team management access
 */
function requiresTeamAccess(pathname: string): boolean {
  return TEAM_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if route requires enterprise access
 */
function requiresEnterprise(pathname: string): boolean {
  return ENTERPRISE_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Get required permissions for a route
 */
function getRequiredPermissions(pathname: string): Permission[] {
  for (const [route, permissions] of Object.entries(PERMISSION_ROUTES)) {
    if (pathname.startsWith(route)) {
      return permissions;
    }
  }
  return [];
}

/**
 * Check if user has required permissions
 */
function hasPermissions(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(perm => userPermissions.includes(perm));
}

/**
 * Check if user has required role
 */
function hasRequiredRole(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    [Role.GUEST]: 0,
    [Role.PRO]: 1,
    [Role.TEAM]: 2,
    [Role.ACADEMIC]: 2,
    [Role.ENTERPRISE]: 3,
    [Role.ADMIN]: 4
  };

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
}

/**
 * Validate biblical elements in JWT
 */
function validateBiblicalElements(token: JWTPayload): boolean {
  try {
    // Validate covenant
    if (!biblicalCrypto.validateCovenant(token.biblical.covenant, token.sub, token.tier)) {
      console.error('Invalid covenant detected');
      return false;
    }

    // Validate divine seal
    if (!biblicalCrypto.validateSeal(token.biblical.seal, token)) {
      console.error('Invalid divine seal detected');
      return false;
    }

    // Validate biblical element matches tier
    const expectedElement = biblicalCrypto.getBiblicalElement(token.tier);
    if (!expectedElement || expectedElement.name !== token.biblical.element.name) {
      console.error('Biblical element mismatch');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Biblical validation error:', error);
    return false;
  }
}

/**
 * Create security headers
 */
function createSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' localhost:*;",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-Biblical-Covenant': 'active',
    'X-Divine-Protection': 'enabled'
  };
}

/**
 * Log security event
 */
function logSecurityEvent(
  type: string,
  userId: string | null,
  ip: string,
  userAgent: string,
  details: Record<string, any> = {}
) {
  const event = {
    type,
    userId: userId || 'anonymous',
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
    details
  };

  // In production, this would send to audit logging service
  console.log('[SECURITY EVENT]', JSON.stringify(event));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Skip middleware for public routes and auth endpoints
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/' ||
    pathname.startsWith('/public')
  ) {
    const response = NextResponse.next();

    // Add security headers to all responses
    const securityHeaders = createSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // Check if route requires authentication
  if (!requiresAuth(pathname)) {
    return NextResponse.next();
  }

  try {
    // Get JWT token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || 'c0rs0-divine-secret-7777'
    }) as JWTPayload | null;

    if (!token) {
      logSecurityEvent('unauthorized_access', null, ip, userAgent, { path: pathname });

      // Redirect to sign-in page
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Validate token expiration
    if (token.exp && Date.now() / 1000 > token.exp) {
      logSecurityEvent('expired_token', token.sub, ip, userAgent, { path: pathname });

      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      signInUrl.searchParams.set('error', 'SessionExpired');
      return NextResponse.redirect(signInUrl);
    }

    // Validate biblical elements
    if (token.biblical && !validateBiblicalElements(token)) {
      logSecurityEvent('biblical_validation_failed', token.sub, ip, userAgent, {
        path: pathname,
        covenant: token.biblical.covenant,
        tier: token.tier
      });

      const errorUrl = new URL('/auth/error', request.url);
      errorUrl.searchParams.set('error', 'BiblicalValidationFailed');
      return NextResponse.redirect(errorUrl);
    }

    // Check admin routes
    if (requiresAdmin(pathname) && token.role !== Role.ADMIN) {
      logSecurityEvent('admin_access_denied', token.sub, ip, userAgent, {
        path: pathname,
        role: token.role
      });

      return NextResponse.json(
        { error: 'Admin access required', code: 'INSUFFICIENT_PERMISSIONS' },
        { status: 403 }
      );
    }

    // Check team management routes
    if (requiresTeamAccess(pathname) && !hasRequiredRole(token.role, Role.TEAM)) {
      logSecurityEvent('team_access_denied', token.sub, ip, userAgent, {
        path: pathname,
        role: token.role
      });

      return NextResponse.json(
        { error: 'Team management access required', code: 'INSUFFICIENT_ROLE' },
        { status: 403 }
      );
    }

    // Check enterprise routes
    if (requiresEnterprise(pathname) && !hasRequiredRole(token.role, Role.ENTERPRISE)) {
      logSecurityEvent('enterprise_access_denied', token.sub, ip, userAgent, {
        path: pathname,
        role: token.role
      });

      return NextResponse.json(
        { error: 'Enterprise access required', code: 'INSUFFICIENT_ROLE' },
        { status: 403 }
      );
    }

    // Check specific permission requirements
    const requiredPermissions = getRequiredPermissions(pathname);
    if (requiredPermissions.length > 0 && !hasPermissions(token.permissions || [], requiredPermissions)) {
      logSecurityEvent('permission_denied', token.sub, ip, userAgent, {
        path: pathname,
        requiredPermissions,
        userPermissions: token.permissions
      });

      return NextResponse.json(
        {
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: requiredPermissions,
          biblical: {
            reference: token.biblical?.element?.verse || 'Proverbs 3:5-6',
            message: 'Trust in the LORD with all your heart and lean not on your own understanding.'
          }
        },
        { status: 403 }
      );
    }

    // Rate limiting check for API routes
    if (pathname.startsWith('/api/')) {
      const rateLimits = token.rateLimits;
      if (rateLimits && rateLimits.remainingCalls <= 0) {
        logSecurityEvent('rate_limit_exceeded', token.sub, ip, userAgent, {
          path: pathname,
          rateLimits
        });

        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            resetTime: rateLimits.resetTime,
            biblical: {
              reference: 'Ecclesiastes 3:1',
              message: 'To every thing there is a season, and a time to every purpose under the heaven.'
            }
          },
          { status: 429 }
        );
      }
    }

    // Log successful access
    logSecurityEvent('authorized_access', token.sub, ip, userAgent, {
      path: pathname,
      role: token.role,
      tier: token.tier
    });

    // Create response with security headers
    const response = NextResponse.next();
    const securityHeaders = createSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add biblical authentication headers
    response.headers.set('X-Biblical-User', token.biblical?.name || 'unknown');
    response.headers.set('X-Divine-Tier', token.tier);
    response.headers.set('X-Anointing-Level', token.biblical?.anointing?.toString() || '0');
    response.headers.set('X-Session-Id', token.sessionId);

    return response;

  } catch (error) {
    console.error('Middleware error:', error);

    logSecurityEvent('middleware_error', null, ip, userAgent, {
      path: pathname,
      error: error instanceof Error ? error.message : 'unknown'
    });

    // Redirect to error page
    const errorUrl = new URL('/auth/error', request.url);
    errorUrl.searchParams.set('error', 'MiddlewareError');
    return NextResponse.redirect(errorUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};