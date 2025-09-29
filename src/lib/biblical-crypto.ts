/**
 * Biblical Cryptography System for C0RS0 Platform
 * Implements divine security measures with biblical principles
 */

import CryptoJS from 'crypto-js';
import { Role, Permission, BiblicalElement, BIBLICAL_ELEMENTS } from '@/types/auth';

// Sacred constants for cryptographic operations
const DIVINE_SALT = 'YHWH_ELOHIM_ADONAI_7777';
const COVENANT_PREFIX = 'C0V_';
const SEAL_PREFIX = 'SEAL_';
const ANOINTING_MULTIPLIER = 7; // Divine number

// Biblical names pool for user assignment
const BIBLICAL_NAMES = {
  male: [
    'Abraham', 'Isaac', 'Jacob', 'Moses', 'David', 'Solomon', 'Daniel',
    'Joshua', 'Elijah', 'Elisha', 'Isaiah', 'Jeremiah', 'Ezekiel',
    'Michael', 'Gabriel', 'Raphael', 'Uriel', 'Nathanael', 'Matthias',
    'Barnabas', 'Timothy', 'Silas', 'Apollos', 'Epaphras', 'Philemon'
  ],
  female: [
    'Sarah', 'Rebecca', 'Rachel', 'Leah', 'Miriam', 'Deborah', 'Ruth',
    'Esther', 'Hannah', 'Abigail', 'Bathsheba', 'Tamar', 'Mary',
    'Martha', 'Elizabeth', 'Anna', 'Dorcas', 'Lydia', 'Phoebe',
    'Priscilla', 'Junia', 'Eunice', 'Lois', 'Claudia', 'Rhoda'
  ],
  neutral: [
    'Wisdom', 'Truth', 'Light', 'Peace', 'Joy', 'Faith', 'Hope',
    'Grace', 'Mercy', 'Justice', 'Righteousness', 'Holiness'
  ]
};

export class BiblicalCryptography {
  private static instance: BiblicalCryptography;
  private readonly secretKey: string;

  constructor() {
    // Initialize with environment-specific divine key
    this.secretKey = process.env.BIBLICAL_CRYPTO_KEY || this.generateDivineKey();
  }

  static getInstance(): BiblicalCryptography {
    if (!BiblicalCryptography.instance) {
      BiblicalCryptography.instance = new BiblicalCryptography();
    }
    return BiblicalCryptography.instance;
  }

  /**
   * Generate a divine cryptographic key based on biblical principles
   */
  private generateDivineKey(): string {
    const elements = [
      'ALPHA_OMEGA',
      'BEGINNING_END',
      'FIRST_LAST',
      'LIGHT_DARKNESS',
      'HEAVEN_EARTH',
      'SPIRIT_TRUTH',
      'WORD_LIFE'
    ];

    return CryptoJS.SHA512(elements.join('_') + DIVINE_SALT).toString();
  }

  /**
   * Generate a covenant hash for user authentication
   * Combines user identity with divine elements
   */
  generateCovenant(userId: string, tier: string): string {
    const element = BIBLICAL_ELEMENTS[tier];
    if (!element) {
      throw new Error(`Unknown tier: ${tier}`);
    }

    const covenantData = {
      userId,
      tier,
      element: element.hebrew,
      timestamp: Date.now(),
      salt: DIVINE_SALT
    };

    const hash = CryptoJS.SHA256(JSON.stringify(covenantData) + this.secretKey).toString();
    return `${COVENANT_PREFIX}${hash}`;
  }

  /**
   * Generate a divine seal for payload integrity
   */
  generateSeal(payload: any): string {
    const serialized = JSON.stringify(payload, Object.keys(payload).sort());
    const hmac = CryptoJS.HmacSHA256(serialized, this.secretKey).toString();
    return `${SEAL_PREFIX}${hmac}`;
  }

  /**
   * Validate a covenant against user and tier
   */
  validateCovenant(covenant: string, userId: string, tier: string): boolean {
    try {
      if (!covenant.startsWith(COVENANT_PREFIX)) {
        return false;
      }

      const expectedCovenant = this.generateCovenant(userId, tier);
      return this.constantTimeCompare(covenant, expectedCovenant);
    } catch (error) {
      console.error('Covenant validation failed:', error);
      return false;
    }
  }

  /**
   * Validate a divine seal against payload
   */
  validateSeal(seal: string, payload: any): boolean {
    try {
      if (!seal.startsWith(SEAL_PREFIX)) {
        return false;
      }

      const expectedSeal = this.generateSeal(payload);
      return this.constantTimeCompare(seal, expectedSeal);
    } catch (error) {
      console.error('Seal validation failed:', error);
      return false;
    }
  }

  /**
   * Assign a biblical name based on email and tier
   */
  assignBiblicalName(email: string, tier: string): string {
    const hash = CryptoJS.SHA256(email + tier + DIVINE_SALT).toString();
    const num = parseInt(hash.substring(0, 8), 16);

    // Determine gender preference (simplified approach)
    const genderHint = email.toLowerCase();
    let namePool = BIBLICAL_NAMES.neutral;

    if (genderHint.includes('mr') || genderHint.includes('male')) {
      namePool = BIBLICAL_NAMES.male;
    } else if (genderHint.includes('ms') || genderHint.includes('mrs') || genderHint.includes('female')) {
      namePool = BIBLICAL_NAMES.female;
    } else {
      // Mix all pools for neutral assignment
      namePool = [...BIBLICAL_NAMES.male, ...BIBLICAL_NAMES.female, ...BIBLICAL_NAMES.neutral];
    }

    const index = num % namePool.length;
    return namePool[index];
  }

  /**
   * Generate spiritual anointing level based on role and permissions
   */
  generateAnointing(role: Role, permissions: Permission[]): number {
    let baseLevel = 1;

    switch (role) {
      case Role.GUEST:
        baseLevel = 1;
        break;
      case Role.PRO:
        baseLevel = 3;
        break;
      case Role.TEAM:
        baseLevel = 5;
        break;
      case Role.ENTERPRISE:
        baseLevel = 8;
        break;
      case Role.ACADEMIC:
        baseLevel = 6;
        break;
      case Role.ADMIN:
        baseLevel = 12;
        break;
    }

    // Add permission-based anointing
    const permissionBonus = Math.min(permissions.length / 2, 3);
    return Math.min(baseLevel + permissionBonus, 12) * ANOINTING_MULTIPLIER;
  }

  /**
   * Encrypt data with divine key
   */
  encryptWithDivineKey(data: string): string {
    const encrypted = CryptoJS.AES.encrypt(data, this.secretKey).toString();
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encrypted));
  }

  /**
   * Decrypt data with divine key
   */
  decryptWithDivineKey(encryptedData: string): string {
    try {
      const decoded = CryptoJS.enc.Base64.parse(encryptedData).toString(CryptoJS.enc.Utf8);
      const decrypted = CryptoJS.AES.decrypt(decoded, this.secretKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error('Failed to decrypt with divine key');
    }
  }

  /**
   * Generate a biblical verse-based OTP for additional security
   */
  generateBiblicalOTP(userEmail: string, verse: string): string {
    const timestamp = Math.floor(Date.now() / 30000); // 30-second window
    const data = `${userEmail}:${verse}:${timestamp}`;
    const hash = CryptoJS.SHA256(data + this.secretKey).toString();
    return hash.substring(0, 6).toUpperCase();
  }

  /**
   * Validate biblical OTP
   */
  validateBiblicalOTP(userEmail: string, verse: string, otp: string): boolean {
    // Check current and previous time window
    for (let i = 0; i <= 1; i++) {
      const timestamp = Math.floor(Date.now() / 30000) - i;
      const data = `${userEmail}:${verse}:${timestamp}`;
      const hash = CryptoJS.SHA256(data + this.secretKey).toString();
      const expectedOTP = hash.substring(0, 6).toUpperCase();

      if (this.constantTimeCompare(otp, expectedOTP)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Generate session token with biblical elements
   */
  generateSessionToken(userId: string, sessionId: string): string {
    const timestamp = Date.now();
    const tokenData = {
      userId,
      sessionId,
      timestamp,
      random: CryptoJS.lib.WordArray.random(128/8).toString()
    };

    const token = CryptoJS.AES.encrypt(
      JSON.stringify(tokenData),
      this.secretKey
    ).toString();

    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(token));
  }

  /**
   * Validate and decode session token
   */
  validateSessionToken(token: string): { userId: string; sessionId: string; timestamp: number } | null {
    try {
      const decoded = CryptoJS.enc.Base64.parse(token).toString(CryptoJS.enc.Utf8);
      const decrypted = CryptoJS.AES.decrypt(decoded, this.secretKey);
      const tokenData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

      // Check if token is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - tokenData.timestamp > maxAge) {
        return null;
      }

      return {
        userId: tokenData.userId,
        sessionId: tokenData.sessionId,
        timestamp: tokenData.timestamp
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Constant time string comparison to prevent timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Generate a divine signature for API requests
   */
  signRequest(method: string, url: string, body: string, timestamp: number): string {
    const message = `${method.toUpperCase()}:${url}:${body}:${timestamp}`;
    return CryptoJS.HmacSHA256(message, this.secretKey).toString();
  }

  /**
   * Validate divine signature
   */
  validateRequestSignature(
    method: string,
    url: string,
    body: string,
    timestamp: number,
    signature: string
  ): boolean {
    // Check timestamp is not too old (5 minutes)
    if (Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) {
      return false;
    }

    const expectedSignature = this.signRequest(method, url, body, timestamp);
    return this.constantTimeCompare(signature, expectedSignature);
  }

  /**
   * Get biblical element for tier
   */
  getBiblicalElement(tier: string): BiblicalElement | null {
    return BIBLICAL_ELEMENTS[tier] || null;
  }

  /**
   * Generate divine randomness for security purposes
   */
  generateDivineRandom(length: number = 32): string {
    const words = CryptoJS.lib.WordArray.random(length);
    return CryptoJS.SHA256(words.toString() + Date.now() + DIVINE_SALT).toString();
  }
}

// Export singleton instance
export const biblicalCrypto = BiblicalCryptography.getInstance();