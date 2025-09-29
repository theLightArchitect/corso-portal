import React, { useState, useEffect } from 'react';
import { Bell, Mail, Slack, AlertTriangle, TrendingUp, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';

interface AlertConfig {
  id: string;
  type: 'usage' | 'security' | 'billing' | 'performance';
  name: string;
  description: string;
  enabled: boolean;
  threshold?: number;
  frequency: 'immediate' | 'daily' | 'weekly';
  channels: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
  };
  lastTriggered?: string;
  triggerCount: number;
}

interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook';
  configured: boolean;
  endpoint?: string;
  verified: boolean;
}

interface AlertsConfigurationProps {
  className?: string;
}

export const AlertsConfiguration: React.FC<AlertsConfigurationProps> = ({
  className = '',
}) => {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testingAlert, setTestingAlert] = useState<string | null>(null);

  const { user, license } = useAuthStore();

  const alertPresets: AlertConfig[] = [
    {
      id: 'usage-80',
      type: 'usage',
      name: '80% API Usage Warning',
      description: 'Alert when API usage reaches 80% of monthly limit',
      enabled: false,
      threshold: 80,
      frequency: 'immediate',
      channels: { email: true, slack: false, webhook: false },
      triggerCount: 0,
    },
    {
      id: 'usage-100',
      type: 'usage',
      name: 'API Limit Reached',
      description: 'Alert when monthly API limit is reached',
      enabled: true,
      threshold: 100,
      frequency: 'immediate',
      channels: { email: true, slack: true, webhook: false },
      triggerCount: 0,
    },
    {
      id: 'security-failed-auth',
      type: 'security',
      name: 'Failed Authentication Attempts',
      description: 'Alert on multiple failed authentication attempts',
      enabled: true,
      threshold: 5,
      frequency: 'immediate',
      channels: { email: true, slack: false, webhook: true },
      triggerCount: 0,
    },
    {
      id: 'security-new-key',
      type: 'security',
      name: 'New API Key Generated',
      description: 'Alert when a new API key is generated',
      enabled: true,
      frequency: 'immediate',
      channels: { email: true, slack: false, webhook: false },
      triggerCount: 0,
    },
    {
      id: 'billing-payment-due',
      type: 'billing',
      name: 'Payment Due Reminder',
      description: 'Alert 3 days before payment is due',
      enabled: true,
      threshold: 3,
      frequency: 'daily',
      channels: { email: true, slack: false, webhook: false },
      triggerCount: 0,
    },
    {
      id: 'billing-payment-failed',
      type: 'billing',
      name: 'Payment Failed',
      description: 'Alert when payment processing fails',
      enabled: true,
      frequency: 'immediate',
      channels: { email: true, slack: true, webhook: false },
      triggerCount: 0,
    },
    {
      id: 'performance-latency',
      type: 'performance',
      name: 'High Latency Alert',
      description: 'Alert when API response time exceeds threshold',
      enabled: false,
      threshold: 1000, // ms
      frequency: 'immediate',
      channels: { email: false, slack: true, webhook: true },
      triggerCount: 0,
    },
    {
      id: 'performance-errors',
      type: 'performance',
      name: 'Error Rate Alert',
      description: 'Alert when error rate exceeds 5%',
      enabled: false,
      threshold: 5,
      frequency: 'immediate',
      channels: { email: true, slack: true, webhook: false },
      triggerCount: 0,
    },
  ];

  useEffect(() => {
    loadAlertConfigurations();
  }, []);

  const loadAlertConfigurations = async () => {
    try {
      setLoading(true);
      const [alertsResponse, channelsResponse] = await Promise.all([
        fetch('/api/license/alerts', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }),
        fetch('/api/license/notification-channels', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }),
      ]);

      if (alertsResponse.ok) {
        const userAlerts = await alertsResponse.json();
        // Merge user settings with presets
        const mergedAlerts = alertPresets.map(preset => {
          const userConfig = userAlerts.find((a: AlertConfig) => a.id === preset.id);
          return userConfig || preset;
        });
        setAlerts(mergedAlerts);
      } else {
        setAlerts(alertPresets);
      }

      if (channelsResponse.ok) {
        const userChannels = await channelsResponse.json();
        setChannels(userChannels);
      }
    } catch (error) {
      console.error('Failed to load alert configurations:', error);
      setAlerts(alertPresets);
    } finally {
      setLoading(false);
    }
  };

  const updateAlert = async (alertId: string, updates: Partial<AlertConfig>) => {
    try {
      setSaving(alertId);
      const response = await fetch(`/api/license/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert =>
          alert.id === alertId ? { ...alert, ...updates } : alert
        ));
      }
    } catch (error) {
      console.error('Failed to update alert:', error);
    } finally {
      setSaving(null);
    }
  };

  const testAlert = async (alertId: string) => {
    try {
      setTestingAlert(alertId);
      const response = await fetch(`/api/license/alerts/${alertId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        // Show success feedback
        setTimeout(() => setTestingAlert(null), 2000);
      }
    } catch (error) {
      console.error('Failed to test alert:', error);
      setTestingAlert(null);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'usage': return TrendingUp;
      case 'security': return Shield;
      case 'billing': return Bell;
      case 'performance': return Zap;
      default: return Bell;
    }
  };

  const getAlertColorClass = (type: string) => {
    switch (type) {
      case 'usage': return 'biblical-king';
      case 'security': return 'biblical-security';
      case 'billing': return 'biblical-wisdom';
      case 'performance': return 'biblical-infrastructure';
      default: return 'biblical-divine';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="biblical-card">
            <div className="biblical-card-content">
              <div className="loading-skeleton h-5 w-1/3 mb-3" />
              <div className="loading-skeleton h-4 w-2/3 mb-4" />
              <div className="loading-skeleton h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Group alerts by type
  const groupedAlerts = alerts.reduce((acc, alert) => {
    if (!acc[alert.type]) acc[alert.type] = [];
    acc[alert.type].push(alert);
    return acc;
  }, {} as Record<string, AlertConfig[]>);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="biblical-card">
        <div className="biblical-card-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="biblical-heading text-xl text-foreground">
                Watchful Vigilance Configuration
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Configure divine notifications to maintain righteous stewardship
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {alerts.filter(a => a.enabled).length} of {alerts.length} alerts active
            </div>
          </div>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="biblical-card">
        <div className="biblical-card-header">
          <h3 className="biblical-heading text-lg text-foreground">
            Notification Channels
          </h3>
        </div>
        <div className="biblical-card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-biblical-king-500" />
                  <span className="font-medium">Email</span>
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {user?.email || 'Not configured'}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Slack className="h-5 w-5 text-biblical-infrastructure-500" />
                  <span className="font-medium">Slack</span>
                </div>
                <button className="text-xs text-biblical-king-600 hover:text-biblical-king-700">
                  Configure
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Not connected
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-biblical-divine-500" />
                  <span className="font-medium">Webhook</span>
                </div>
                <button className="text-xs text-biblical-king-600 hover:text-biblical-king-700">
                  Configure
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Not configured
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Categories */}
      {Object.entries(groupedAlerts).map(([type, typeAlerts]) => {
        const Icon = getAlertIcon(type);
        const colorClass = getAlertColorClass(type);

        return (
          <div key={type} className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 bg-${colorClass}-100 rounded-lg`}>
                <Icon className={`h-5 w-5 text-${colorClass}-600`} />
              </div>
              <h3 className="biblical-heading text-lg text-foreground capitalize">
                {type} Alerts
              </h3>
            </div>

            <div className="space-y-3">
              {typeAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="biblical-card"
                >
                  <div className="biblical-card-content">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={alert.enabled}
                              onChange={(e) => updateAlert(alert.id, { enabled: e.target.checked })}
                              className="focus-ring"
                            />
                            <span className="font-medium text-foreground">
                              {alert.name}
                            </span>
                          </label>
                          {alert.lastTriggered && (
                            <span className="text-xs text-muted-foreground">
                              Last triggered: {new Date(alert.lastTriggered).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {alert.description}
                        </p>

                        {alert.enabled && (
                          <div className="space-y-3">
                            {/* Threshold Setting */}
                            {alert.threshold !== undefined && (
                              <div className="flex items-center space-x-4">
                                <span className="text-sm text-muted-foreground">Threshold:</span>
                                <input
                                  type="number"
                                  value={alert.threshold}
                                  onChange={(e) => updateAlert(alert.id, { threshold: parseInt(e.target.value) })}
                                  className="w-20 px-2 py-1 text-sm border rounded"
                                  disabled={saving === alert.id}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {alert.type === 'usage' ? '%' : alert.type === 'performance' ? 'ms' : ''}
                                </span>
                              </div>
                            )}

                            {/* Frequency Setting */}
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-muted-foreground">Frequency:</span>
                              <select
                                value={alert.frequency}
                                onChange={(e) => updateAlert(alert.id, { frequency: e.target.value as any })}
                                className="px-3 py-1 text-sm border rounded"
                                disabled={saving === alert.id}
                              >
                                <option value="immediate">Immediate</option>
                                <option value="daily">Daily Summary</option>
                                <option value="weekly">Weekly Summary</option>
                              </select>
                            </div>

                            {/* Channels */}
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-muted-foreground">Send to:</span>
                              <div className="flex items-center space-x-3">
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={alert.channels.email}
                                    onChange={(e) => updateAlert(alert.id, {
                                      channels: { ...alert.channels, email: e.target.checked }
                                    })}
                                    disabled={saving === alert.id}
                                  />
                                  <span className="text-sm">Email</span>
                                </label>
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={alert.channels.slack}
                                    onChange={(e) => updateAlert(alert.id, {
                                      channels: { ...alert.channels, slack: e.target.checked }
                                    })}
                                    disabled={saving === alert.id}
                                  />
                                  <span className="text-sm">Slack</span>
                                </label>
                                <label className="flex items-center space-x-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={alert.channels.webhook}
                                    onChange={(e) => updateAlert(alert.id, {
                                      channels: { ...alert.channels, webhook: e.target.checked }
                                    })}
                                    disabled={saving === alert.id}
                                  />
                                  <span className="text-sm">Webhook</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        <button
                          onClick={() => testAlert(alert.id)}
                          disabled={!alert.enabled || testingAlert === alert.id}
                          className="px-3 py-1 text-sm text-biblical-king-600 hover:text-biblical-king-700 hover:bg-biblical-king-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {testingAlert === alert.id ? 'Testing...' : 'Test Alert'}
                        </button>
                      </div>
                    </div>

                    {saving === alert.id && (
                      <div className="mt-3 text-sm text-biblical-king-600">
                        Saving changes...
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Biblical Guidance */}
      <div className="biblical-card bg-gradient-to-r from-biblical-security-50 to-biblical-divine-50">
        <div className="biblical-card-content">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-biblical-security-500 rounded-full animate-security-scan">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="biblical-heading text-lg text-biblical-security-800">
                Watchful Stewardship Guidance
              </h3>
              <p className="text-sm text-biblical-security-700 mt-2">
                "Watch and pray, that ye enter not into temptation" - Matthew 26:41
              </p>
              <div className="text-xs text-muted-foreground mt-3 space-y-1">
                <p>• Configure alerts to maintain vigilant oversight of your divine resources</p>
                <p>• Immediate notifications help prevent overages and security incidents</p>
                <p>• Test alerts regularly to ensure your notification channels are working</p>
                <p>• Balance alerting to stay informed without being overwhelmed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsConfiguration;