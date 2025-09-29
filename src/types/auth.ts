/**
 * Authentication Types for C0RS0 Portal
 * Integrates with Go backend auth system and biblical elements
 */

export interface BiblicalElement {
  name: string;
  hebrew: string;
  meaning: string;
  verse: string;
  power: number; // 1-100
}

export interface LicenseTier {
  name: string;
  displayName: string;
  monthlyPriceUSD: number;
  callsPerMonth: number;
  callsPerDay: number;
  maxUsers: number;
  minUsers: number;
  availableAgents: string[];
  layerAccess: number[];
  features: string[];
  role: Role;
  permissions: Permission[];
  slaGuarantee: number;
  supportLevel: string;
  complianceCerts: string[];
  trialDays: number;
  description: string;
  targetAudience: string;
  billingCycle: string;
  allowTeamManagement: boolean;
  allowCustomAgents: boolean;
  dedicatedInfra: boolean;
  biblicalElement: BiblicalElement;
}

export enum Role {
  GUEST = 'guest',
  PRO = 'pro',
  TEAM = 'team',
  ENTERPRISE = 'enterprise',
  ACADEMIC = 'academic',
  ADMIN = 'admin'
}

export enum Permission {
  // Basic permissions
  BASIC_ACCESS = 'basic_access',
  LAYER_1_ACCESS = 'layer_1_access',
  LAYER_2_ACCESS = 'layer_2_access',
  LAYER_3_ACCESS = 'layer_3_access',

  // Agent permissions
  KJVA8_ACCESS = 'kjva8_access',
  KING_DAVID_ACCESS = 'king_david_access',
  ELIJAH_ACCESS = 'elijah_access',
  MELCHIZEDEK_ACCESS = 'melchizedek_access',
  MOSES_ACCESS = 'moses_access',
  DANIEL_ACCESS = 'daniel_access',
  JOSHUA_ACCESS = 'joshua_access',
  EZEKIEL_ACCESS = 'ezekiel_access',
  IESOUS_ACCESS = 'iesous_access',

  // Admin permissions
  USER_MANAGEMENT = 'user_management',
  TEAM_MANAGEMENT = 'team_management',
  BILLING_ACCESS = 'billing_access',
  ANALYTICS_ACCESS = 'analytics_access',
  CUSTOM_AGENTS = 'custom_agents',
  WHITE_LABEL = 'white_label',
  SOURCE_ACCESS = 'source_access'
}

export interface C0RS0Session {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: Role;
    tier: string;
    permissions: Permission[];
    biblicalName?: string;
  };
  accessToken: string;
  refreshToken: string;
  expires: string;
  apiKey?: string;
  sessionId: string;
  totpEnabled: boolean;
  lastActivity: string;
}

export interface JWTPayload {
  // Standard JWT claims
  sub: string; // user ID
  iss: string; // issuer
  aud: string; // audience
  exp: number; // expiration
  iat: number; // issued at
  nbf: number; // not before
  jti: string; // JWT ID

  // C0RS0 specific claims
  email: string;
  name: string;
  role: Role;
  tier: string;
  permissions: Permission[];
  sessionId: string;
  apiKey?: string;

  // Biblical cryptography elements
  biblical: {
    name: string; // Biblical name assigned to user
    element: BiblicalElement;
    covenant: string; // Cryptographic covenant hash
    seal: string; // Divine seal for integrity
    tribe: string; // User's spiritual tribe (maps to license tier)
    anointing: number; // Spiritual authority level (1-12)
  };

  // Security elements
  clientIP?: string;
  userAgent?: string;
  deviceId?: string;
  totpVerified: boolean;
  lastPasswordChange?: number;
  mfaEnabled: boolean;

  // Rate limiting
  rateLimits: {
    callsPerMonth: number;
    callsPerDay: number;
    remainingCalls: number;
    resetTime: number;
  };
}

export interface AuthContextType {
  session: C0RS0Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: (email: string, password: string, totpCode?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  canAccessAgent: (agentName: string) => boolean;
  canAccessLayer: (layer: number) => boolean;
  getBiblicalIdentity: () => BiblicalElement | null;
  getActiveCovenants: () => string[];
  error: string | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  totpCode?: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  agreedToTerms: boolean;
  preferredTier?: string;
}

export interface TOTPSetupData {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface PasswordResetRequest {
  email: string;
  biblicalVerse?: string; // Optional biblical verification
}

export interface PasswordReset {
  token: string;
  newPassword: string;
  confirmPassword: string;
  totpCode?: string;
}

export interface SessionActivity {
  id: string;
  timestamp: string;
  action: string;
  ip: string;
  userAgent: string;
  location?: string;
  successful: boolean;
}

// Biblical Elements mapped to license tiers
export const BIBLICAL_ELEMENTS: Record<string, BiblicalElement> = {
  explorer: {
    name: 'Genesis',
    hebrew: 'בְּרֵאשִׁית',
    meaning: 'In the beginning',
    verse: 'Genesis 1:1',
    power: 10
  },
  developer: {
    name: 'Wisdom',
    hebrew: 'חָכְמָה',
    meaning: 'Divine Wisdom',
    verse: 'Proverbs 8:22',
    power: 25
  },
  professional: {
    name: 'Strength',
    hebrew: 'עֹז',
    meaning: 'Mighty Strength',
    verse: 'Psalm 28:7',
    power: 50
  },
  team: {
    name: 'Unity',
    hebrew: 'יַחַד',
    meaning: 'Together in Purpose',
    verse: 'Psalm 133:1',
    power: 70
  },
  enterprise: {
    name: 'Dominion',
    hebrew: 'מֶמְשָׁלָה',
    meaning: 'Divine Authority',
    verse: 'Daniel 7:14',
    power: 85
  },
  sovereign: {
    name: 'Kingdom',
    hebrew: 'מַלְכוּת',
    meaning: 'Eternal Kingdom',
    verse: 'Revelation 11:15',
    power: 100
  },
  academic: {
    name: 'Knowledge',
    hebrew: 'דַּעַת',
    meaning: 'Sacred Knowledge',
    verse: 'Proverbs 2:6',
    power: 60
  }
};

// Agent access requirements
export const AGENT_PERMISSIONS: Record<string, Permission> = {
  'k1ng-dav1d': Permission.KING_DAVID_ACCESS,
  '3l1j4h': Permission.ELIJAH_ACCESS,
  'm3lch1z3d3k': Permission.MELCHIZEDEK_ACCESS,
  'm0s3s': Permission.MOSES_ACCESS,
  'd4n13l': Permission.DANIEL_ACCESS,
  'j05hu4': Permission.JOSHUA_ACCESS,
  '3z3k13l': Permission.EZEKIEL_ACCESS,
  'iesous': Permission.IESOUS_ACCESS
};

// Layer access requirements
export const LAYER_PERMISSIONS: Record<number, Permission> = {
  1: Permission.LAYER_1_ACCESS,
  2: Permission.LAYER_2_ACCESS,
  3: Permission.LAYER_3_ACCESS
};

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
  biblical?: {
    reference: string;
    warning: string;
  };
}

export interface SecurityEvent {
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'totp_setup' | 'suspicious_activity';
  timestamp: string;
  ip: string;
  userAgent: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface BiblicalCryptography {
  generateCovenant: (userId: string, tier: string) => string;
  generateSeal: (payload: any) => string;
  validateCovenant: (covenant: string, userId: string, tier: string) => boolean;
  validateSeal: (seal: string, payload: any) => boolean;
  assignBiblicalName: (email: string, tier: string) => string;
  generateAnointing: (role: Role, permissions: Permission[]) => number;
  encryptWithDivineKey: (data: string) => string;
  decryptWithDivineKey: (encryptedData: string) => string;
}