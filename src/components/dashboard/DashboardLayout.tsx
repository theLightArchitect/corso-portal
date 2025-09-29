'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Zap, Activity, CreditCard, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { DashboardData, LicenseStatus, UsageMetrics } from '@/types/dashboard';
import { LicenseStatusCard } from './LicenseStatusCard';
import { UsageAnalytics } from './UsageAnalytics';
import { ApiKeyManagement } from './ApiKeyManagement';
import { BillingDashboard } from './BillingDashboard';
import { AlertBanner } from './AlertBanner';
import { LoadingSpinner } from './LoadingSpinner';

interface DashboardLayoutProps {
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ className = '' }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'api-keys' | 'billing'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('corso_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load dashboard data: ${response.statusText}`);
      }

      const result = await response.json();
      setDashboardData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'overview':
        return <Activity className="w-5 h-5" />;
      case 'usage':
        return <Zap className="w-5 h-5" />;
      case 'api-keys':
        return <Key className="w-5 h-5" />;
      case 'billing':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getBiblicalGreeting = (tier: string): string => {
    const greetings = {
      explorer: "Welcome, Wanderer of the Digital Wilderness",
      prophet: "Blessed be thy API calls, Prophet N4TH4N",
      priest: "Grace and peace be upon thy coding, Priest 4AR0N",
      judge: "Justice flows through thy requests, Judge G1D30N",
      king: "Thy reign in the digital realm is mighty, K1NGxDAV1D",
      high_priest: "Wisdom eternal guides thy path, M3LCH1Z3D3K",
      sovereign: "Divine light illuminates thy code, IESOUS"
    };
    return greetings[tier as keyof typeof greetings] || "Welcome to the C0RS0 Sanctuary";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading thy divine dashboard..." />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-red-900/20 backdrop-blur-sm rounded-lg border border-red-500/30"
        >
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-biblical text-red-100 mb-2">Dashboard Error</h2>
          <p className="text-red-300 mb-4">{error || 'Failed to load dashboard data'}</p>
          <button
            onClick={loadDashboardData}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry Loading
          </button>
        </motion.div>
      </div>
    );
  }

  const { license, usage, api_keys, billing_history, subscription, alerts } = dashboardData;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${className}`}>
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <Crown className="w-8 h-8 text-biblical-king-400 animate-biblical-glow" />
              <div>
                <h1 className="text-2xl font-biblical text-white">C0RS0 License Portal</h1>
                <p className="text-biblical-king-300 text-sm font-modern">
                  {getBiblicalGreeting(license.tier.id)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-300">Current Tier</p>
                <p className={`font-biblical text-lg text-biblical-${license.tier.color}-400`}>
                  {license.tier.displayName}
                </p>
              </div>
              <Shield className={`w-8 h-8 text-biblical-${license.tier.color}-400`} />
            </div>
          </motion.div>
        </div>
      </header>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="container mx-auto px-6 py-4">
          {alerts.filter(alert => !alert.dismissed).map(alert => (
            <AlertBanner key={alert.id} alert={alert} onDismiss={() => {
              // TODO: Implement alert dismissal
              console.log('Dismissing alert:', alert.id);
            }} />
          ))}
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex space-x-1 bg-black/30 backdrop-blur-sm rounded-lg p-1">
          {(['overview', 'usage', 'api-keys', 'billing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-biblical-king-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {getTabIcon(tab)}
              <span className="capitalize">{tab.replace('-', ' ')}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 pb-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <LicenseStatusCard license={license} usage={usage} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UsageAnalytics usage={usage} compact />
                <div className="space-y-4">
                  <ApiKeyManagement apiKeys={api_keys.slice(0, 3)} compact />
                  {subscription && (
                    <BillingDashboard
                      subscription={subscription}
                      billingHistory={billing_history.slice(0, 3)}
                      compact
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <UsageAnalytics usage={usage} />
          )}

          {activeTab === 'api-keys' && (
            <ApiKeyManagement apiKeys={api_keys} />
          )}

          {activeTab === 'billing' && subscription && (
            <BillingDashboard
              subscription={subscription}
              billingHistory={billing_history}
            />
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/30 bg-black/20 backdrop-blur-sm mt-8">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>System Status: All services operational</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>API v1.0</span>
              <span>•</span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};