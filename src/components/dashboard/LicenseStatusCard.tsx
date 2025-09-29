'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { LicenseStatus, UsageMetrics, BIBLICAL_TIERS } from '@/types/dashboard';
import { format, formatDistanceToNow, isPast, addDays } from 'date-fns';

interface LicenseStatusCardProps {
  license: LicenseStatus;
  usage: UsageMetrics;
  className?: string;
}

export const LicenseStatusCard: React.FC<LicenseStatusCardProps> = ({
  license,
  usage,
  className = ''
}) => {
  const tier = license.tier;
  const isExpiringSoon = !isPast(new Date(license.expires_at)) &&
    new Date(license.expires_at) <= addDays(new Date(), 7);
  const isExpired = isPast(new Date(license.expires_at));

  const getStatusIcon = () => {
    if (isExpired) return <AlertCircle className="w-5 h-5 text-red-400" />;
    if (isExpiringSoon) return <Clock className="w-5 h-5 text-yellow-400" />;
    return <CheckCircle className="w-5 h-5 text-green-400" />;
  };

  const getStatusColor = () => {
    if (isExpired) return 'border-red-500/50 bg-red-900/20';
    if (isExpiringSoon) return 'border-yellow-500/50 bg-yellow-900/20';
    return `border-biblical-${tier.color}-500/50 bg-biblical-${tier.color}-900/20`;
  };

  const getUsagePercentage = (current: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatNumber = (num: number): string => {
    if (num === -1) return '∞';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const apiUsagePercentage = getUsagePercentage(usage.api_calls.total, tier.limits.api_calls_per_month);
  const connectionPercentage = getUsagePercentage(usage.concurrent_connections.current, tier.limits.concurrent_connections);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${getStatusColor()} backdrop-blur-sm rounded-xl border p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg bg-biblical-${tier.color}-600/20 backdrop-blur-sm`}>
            <Crown className={`w-8 h-8 text-biblical-${tier.color}-400 animate-biblical-glow`} />
          </div>
          <div>
            <h2 className="text-2xl font-biblical text-white mb-1">
              {tier.displayName}
            </h2>
            <p className={`text-biblical-${tier.color}-300 font-modern`}>
              {tier.biblical_name}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              {getStatusIcon()}
              <span className={`text-sm font-medium ${
                isExpired ? 'text-red-300' :
                isExpiringSoon ? 'text-yellow-300' :
                'text-green-300'
              }`}>
                {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-3xl font-bold text-biblical-${tier.color}-400 mb-1`}>
            ${tier.price.toLocaleString()}
          </div>
          <div className="text-sm text-gray-300">
            per {tier.billing === 'monthly' ? 'month' : 'year'}
          </div>
        </div>
      </div>

      {/* Expiry Information */}
      <div className="bg-black/30 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">License Expires</span>
          </div>
          <div className="text-right">
            <div className={`font-medium ${
              isExpired ? 'text-red-300' :
              isExpiringSoon ? 'text-yellow-300' :
              'text-green-300'
            }`}>
              {format(new Date(license.expires_at), 'MMM dd, yyyy')}
            </div>
            <div className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(license.expires_at), { addSuffix: true })}
            </div>
          </div>
        </div>

        {license.auto_renew && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300">Auto-renewal enabled</span>
            </div>
          </div>
        )}
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* API Calls */}
        <div className="bg-black/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">API Calls</span>
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${getUsageColor(apiUsagePercentage)}`}>
                {formatNumber(usage.api_calls.total)}
              </span>
              <span className="text-sm text-gray-400">
                / {formatNumber(tier.limits.api_calls_per_month)}
              </span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  apiUsagePercentage >= 90 ? 'bg-red-500' :
                  apiUsagePercentage >= 75 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(apiUsagePercentage, 100)}%` }}
              />
            </div>

            <div className="text-xs text-gray-400">
              {apiUsagePercentage.toFixed(1)}% used this month
            </div>
          </div>
        </div>

        {/* Concurrent Connections */}
        <div className="bg-black/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span className="text-sm text-gray-300">Connections</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${getUsageColor(connectionPercentage)}`}>
                {usage.concurrent_connections.current}
              </span>
              <span className="text-sm text-gray-400">
                / {formatNumber(tier.limits.concurrent_connections)}
              </span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  connectionPercentage >= 90 ? 'bg-red-500' :
                  connectionPercentage >= 75 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(connectionPercentage, 100)}%` }}
              />
            </div>

            <div className="text-xs text-gray-400">
              Peak: {usage.concurrent_connections.peak}
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="mt-6 pt-6 border-t border-gray-600">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Tier Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {tier.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
              <span className="text-xs text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <button className={`flex-1 py-2 px-4 bg-biblical-${tier.color}-600 hover:bg-biblical-${tier.color}-700 text-white rounded-lg font-medium transition-colors`}>
          Upgrade Tier
        </button>
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
          View Details
        </button>
      </div>
    </motion.div>
  );
};