import React, { useState, useEffect } from 'react';
import { Shield, Lock, Smartphone, Key, AlertCircle, CheckCircle, Globe, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';

interface SecuritySession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
}

interface SecurityLog {
  id: string;
  event: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  status: 'success' | 'warning' | 'danger';
}

interface SecuritySettingsProps {
  className?: string;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  className = '',
}) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState<string[]>([]);
  const [newIpAddress, setNewIpAddress] = useState('');

  const { user } = useAuthStore();

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      const [settingsResponse, sessionsResponse, logsResponse] = await Promise.all([
        fetch('/api/license/security/settings', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }),
        fetch('/api/license/security/sessions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }),
        fetch('/api/license/security/logs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }),
      ]);

      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        setTwoFactorEnabled(settings.twoFactorEnabled || false);
        setIpWhitelist(settings.ipWhitelist || []);
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData);
      }

      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setSecurityLogs(logsData);
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    try {
      const response = await fetch('/api/license/security/2fa/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const { qrCode } = await response.json();
        setShowQRCode(true);
        // In real app, display the QR code
      }
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
    }
  };

  const verifyTwoFactor = async () => {
    try {
      setIsVerifying(true);
      const response = await fetch('/api/license/security/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (response.ok) {
        setTwoFactorEnabled(true);
        setShowQRCode(false);
        setVerificationCode('');
      }
    } catch (error) {
      console.error('Failed to verify 2FA:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const disableTwoFactor = async () => {
    try {
      const response = await fetch('/api/license/security/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setTwoFactorEnabled(false);
      }
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/license/security/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };

  const addIpToWhitelist = async () => {
    if (!newIpAddress.trim()) return;

    try {
      const response = await fetch('/api/license/security/ip-whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ ipAddress: newIpAddress }),
      });

      if (response.ok) {
        setIpWhitelist(prev => [...prev, newIpAddress]);
        setNewIpAddress('');
      }
    } catch (error) {
      console.error('Failed to add IP to whitelist:', error);
    }
  };

  const removeIpFromWhitelist = async (ip: string) => {
    try {
      const response = await fetch(`/api/license/security/ip-whitelist/${encodeURIComponent(ip)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setIpWhitelist(prev => prev.filter(i => i !== ip));
      }
    } catch (error) {
      console.error('Failed to remove IP from whitelist:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'danger': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="biblical-card">
            <div className="biblical-card-content">
              <div className="loading-skeleton h-6 w-1/3 mb-4" />
              <div className="loading-skeleton h-4 w-2/3 mb-6" />
              <div className="loading-skeleton h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="biblical-card">
        <div className="biblical-card-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="biblical-heading text-xl text-foreground">
                Divine Security Shield
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Protect your sacred account with righteous security measures
              </p>
            </div>
            <div className={`p-3 rounded-full ${twoFactorEnabled ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              <Shield className={`h-6 w-6 ${twoFactorEnabled ? 'text-emerald-600' : 'text-amber-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="biblical-card">
        <div className="biblical-card-header">
          <h3 className="biblical-heading text-lg text-foreground">
            Two-Factor Authentication
          </h3>
        </div>
        <div className="biblical-card-content">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">
                Add an extra layer of divine protection to your account with two-factor authentication.
                You'll need to enter a code from your authenticator app in addition to your password.
              </p>

              {twoFactorEnabled ? (
                <div className="flex items-center space-x-2 text-emerald-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Two-factor authentication is enabled</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-amber-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Two-factor authentication is not enabled</span>
                </div>
              )}
            </div>
            <div>
              {twoFactorEnabled ? (
                <motion.button
                  onClick={disableTwoFactor}
                  className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Disable 2FA
                </motion.button>
              ) : (
                <motion.button
                  onClick={enableTwoFactor}
                  className="px-4 py-2 bg-biblical-security-600 text-white rounded-lg hover:bg-biblical-security-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Enable 2FA
                </motion.button>
              )}
            </div>
          </div>

          {/* QR Code Modal */}
          {showQRCode && (
            <div className="mt-6 p-6 bg-biblical-security-50 rounded-lg">
              <h4 className="font-medium text-foreground mb-4">Scan QR Code</h4>
              <div className="bg-white p-4 rounded-lg mb-4">
                {/* QR Code would be displayed here */}
                <div className="h-48 w-48 bg-muted mx-auto flex items-center justify-center">
                  <Smartphone className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Enter verification code</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    className="form-input"
                    maxLength={6}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowQRCode(false)}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyTwoFactor}
                    disabled={verificationCode.length !== 6 || isVerifying}
                    className="px-4 py-2 bg-biblical-security-600 text-white rounded-lg hover:bg-biblical-security-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="biblical-card">
        <div className="biblical-card-header">
          <h3 className="biblical-heading text-lg text-foreground">
            Active Sessions
          </h3>
        </div>
        <div className="biblical-card-content">
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <UserCheck className="h-5 w-5 text-biblical-security-500" />
                  <div>
                    <div className="font-medium text-foreground">
                      {session.device}
                      {session.current && (
                        <span className="ml-2 text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {session.location} • {session.ipAddress}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last active: {new Date(session.lastActive).toLocaleString()}
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IP Whitelist */}
      <div className="biblical-card">
        <div className="biblical-card-header">
          <h3 className="biblical-heading text-lg text-foreground">
            IP Address Whitelist
          </h3>
        </div>
        <div className="biblical-card-content">
          <p className="text-sm text-muted-foreground mb-4">
            Restrict API access to specific IP addresses for enhanced security.
          </p>

          <div className="flex items-center space-x-3 mb-4">
            <input
              type="text"
              value={newIpAddress}
              onChange={(e) => setNewIpAddress(e.target.value)}
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              className="flex-1 form-input"
            />
            <button
              onClick={addIpToWhitelist}
              disabled={!newIpAddress.trim()}
              className="px-4 py-2 bg-biblical-security-600 text-white rounded-lg hover:bg-biblical-security-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add IP
            </button>
          </div>

          {ipWhitelist.length > 0 ? (
            <div className="space-y-2">
              {ipWhitelist.map((ip) => (
                <div key={ip} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-biblical-security-500" />
                    <span className="font-mono text-sm">{ip}</span>
                  </div>
                  <button
                    onClick={() => removeIpFromWhitelist(ip)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No IP restrictions configured. API access allowed from any IP address.
            </p>
          )}
        </div>
      </div>

      {/* Security Activity Log */}
      <div className="biblical-card">
        <div className="biblical-card-header">
          <h3 className="biblical-heading text-lg text-foreground">
            Security Activity Log
          </h3>
        </div>
        <div className="biblical-card-content">
          <div className="space-y-2">
            {securityLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded transition-colors">
                {getStatusIcon(log.status)}
                <div className="flex-1">
                  <div className="text-sm text-foreground">{log.event}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()} • {log.location} • {log.ipAddress}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Biblical Guidance */}
      <div className="biblical-card bg-gradient-to-r from-biblical-security-50 to-biblical-divine-50">
        <div className="biblical-card-content">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-biblical-security-500 rounded-full animate-security-scan">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="biblical-heading text-lg text-biblical-security-800">
                Divine Security Wisdom
              </h3>
              <p className="text-sm text-biblical-security-700 mt-2">
                "The name of the Lord is a strong tower; the righteous run to it and are safe" - Proverbs 18:10
              </p>
              <div className="text-xs text-muted-foreground mt-3 space-y-1">
                <p>• Enable two-factor authentication for maximum account protection</p>
                <p>• Review active sessions regularly and revoke any suspicious access</p>
                <p>• Use IP whitelisting for production API keys to prevent unauthorized use</p>
                <p>• Monitor security logs for unusual activity patterns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;