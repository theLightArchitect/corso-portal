import { useState, useEffect, useCallback } from 'react';
import { WebSocketMessage, SubscriptionType } from './useWebSocket';

// Usage interfaces matching Go backend
export interface UsageUpdateMessage {
  user_id: string;
  monthly_usage: number;
  daily_usage: number;
  monthly_limit: number;
  daily_limit: number;
  usage_percentage: number;
  last_call_time: string;
  agent_breakdown: Record<string, number>;
  layer_breakdown: Record<string, number>;
  recent_calls: UsageCallRecord[];
  tier: string;
  biblical_theme: BiblicalUsageTheme;
}

export interface UsageCallRecord {
  timestamp: string;
  agent: string;
  layer: number;
  duration_ms: number;
  success: boolean;
  error_message?: string;
}

export interface BiblicalUsageTheme {
  verse: string;
  message: string;
  blessing?: string;
  warning?: string;
  stewardship: string;
}

export interface QuotaWarningMessage {
  user_id: string;
  warning_type: string; // 'approaching', 'exceeded', 'critical'
  current_usage: number;
  limit: number;
  percentage_used: number;
  time_remaining: string;
  recommended_action: string;
  biblical_guidance: BiblicalQuotaGuidance;
  upgrade_options?: string[];
}

export interface BiblicalQuotaGuidance {
  verse: string;
  wisdom_message: string;
  stewardship: string;
  encouragement: string;
  prayer?: string;
}

export interface UsageAnalytics {
  trend: 'increasing' | 'decreasing' | 'stable';
  peakHours: number[];
  mostUsedAgent: string;
  mostUsedLayer: number;
  efficiency: number;
  costProjection: number;
  recommendations: string[];
}

export interface UseRealTimeUsageOptions {
  userId?: string;
  onUsageUpdate?: (usage: UsageUpdateMessage) => void;
  onQuotaWarning?: (warning: QuotaWarningMessage) => void;
  onError?: (error: string) => void;
  enableAnalytics?: boolean;
  refreshInterval?: number; // in seconds, for manual refresh
}

export interface RealTimeUsageState {
  usage: UsageUpdateMessage | null;
  quotaWarnings: QuotaWarningMessage[];
  analytics: UsageAnalytics | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  isRealTime: boolean;
}

export interface RealTimeUsageActions {
  refreshUsage: () => void;
  clearWarnings: () => void;
  dismissWarning: (warningId: string) => void;
  calculateProjection: (days: number) => number;
  getUsageByTimeRange: (hours: number) => UsageCallRecord[];
  exportUsageData: (format: 'json' | 'csv') => string;
}

export function useRealTimeUsage(
  websocketActions: any,
  connectionState: any,
  options: UseRealTimeUsageOptions = {}
): [RealTimeUsageState, RealTimeUsageActions] {
  const [state, setState] = useState<RealTimeUsageState>({
    usage: null,
    quotaWarnings: [],
    analytics: null,
    loading: false,
    error: null,
    lastUpdate: null,
    isRealTime: false,
  });

  // Calculate analytics from usage data
  const calculateAnalytics = useCallback((usage: UsageUpdateMessage): UsageAnalytics => {
    const recentCalls = usage.recent_calls || [];
    const now = new Date();
    const last24h = recentCalls.filter(call =>
      new Date(call.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000)
    );

    // Calculate trend
    const halfPoint = Math.floor(last24h.length / 2);
    const firstHalf = last24h.slice(0, halfPoint).length;
    const secondHalf = last24h.slice(halfPoint).length;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (secondHalf > firstHalf * 1.1) trend = 'increasing';
    else if (secondHalf < firstHalf * 0.9) trend = 'decreasing';

    // Calculate peak hours
    const hourCounts = new Array(24).fill(0);
    last24h.forEach(call => {
      const hour = new Date(call.timestamp).getHours();
      hourCounts[hour]++;
    });
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);

    // Find most used agent and layer
    const agentCounts = usage.agent_breakdown || {};
    const mostUsedAgent = Object.entries(agentCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

    const layerCounts = usage.layer_breakdown || {};
    const mostUsedLayer = Object.entries(layerCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '1';

    // Calculate efficiency (success rate)
    const successfulCalls = last24h.filter(call => call.success).length;
    const efficiency = last24h.length > 0 ? (successfulCalls / last24h.length) * 100 : 100;

    // Generate recommendations
    const recommendations = [];
    if (efficiency < 90) {
      recommendations.push('Consider reviewing error patterns to improve success rate');
    }
    if (usage.usage_percentage > 80) {
      recommendations.push('Usage approaching limit - consider upgrading tier');
    }
    if (trend === 'increasing') {
      recommendations.push('Usage trending upward - monitor for quota approach');
    }

    return {
      trend,
      peakHours,
      mostUsedAgent,
      mostUsedLayer: parseInt(mostUsedLayer),
      efficiency,
      costProjection: 0, // Would calculate based on tier pricing
      recommendations,
    };
  }, []);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'usage_update' && message.data) {
      const usage = message.data as UsageUpdateMessage;

      setState(prev => ({
        ...prev,
        usage,
        analytics: options.enableAnalytics ? calculateAnalytics(usage) : prev.analytics,
        lastUpdate: new Date(),
        isRealTime: true,
        error: null,
      }));

      options.onUsageUpdate?.(usage);
      console.log('📊 Real-time usage update received:', usage);
    }

    if (message.type === 'quota_warning' && message.data) {
      const warning = message.data as QuotaWarningMessage;

      setState(prev => ({
        ...prev,
        quotaWarnings: [...prev.quotaWarnings, warning],
      }));

      options.onQuotaWarning?.(warning);
      console.log('⚠️ Quota warning received:', warning);
    }

    if (message.type === 'error' && message.error) {
      setState(prev => ({
        ...prev,
        error: message.error!,
      }));

      options.onError?.(message.error);
    }
  }, [options, calculateAnalytics]);

  // Subscribe to usage updates when connected and authenticated
  useEffect(() => {
    if (connectionState.authenticated && websocketActions) {
      console.log('📡 Subscribing to usage updates...');
      websocketActions.subscribe(['usage_updates', 'quota_warnings']);

      // Request initial usage data
      websocketActions.getUsage();

      setState(prev => ({ ...prev, loading: false }));
    }
  }, [connectionState.authenticated, websocketActions]);

  // Actions
  const refreshUsage = useCallback(() => {
    if (websocketActions && connectionState.authenticated) {
      setState(prev => ({ ...prev, loading: true }));
      websocketActions.getUsage();
    }
  }, [websocketActions, connectionState.authenticated]);

  const clearWarnings = useCallback(() => {
    setState(prev => ({ ...prev, quotaWarnings: [] }));
  }, []);

  const dismissWarning = useCallback((warningId: string) => {
    setState(prev => ({
      ...prev,
      quotaWarnings: prev.quotaWarnings.filter(w => w.user_id !== warningId),
    }));
  }, []);

  const calculateProjection = useCallback((days: number): number => {
    if (!state.usage) return 0;

    const dailyAverage = state.usage.monthly_usage / 30; // Rough daily average
    return dailyAverage * days;
  }, [state.usage]);

  const getUsageByTimeRange = useCallback((hours: number): UsageCallRecord[] => {
    if (!state.usage?.recent_calls) return [];

    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return state.usage.recent_calls.filter(call =>
      new Date(call.timestamp) > cutoff
    );
  }, [state.usage]);

  const exportUsageData = useCallback((format: 'json' | 'csv'): string => {
    if (!state.usage) return '';

    if (format === 'json') {
      return JSON.stringify(state.usage, null, 2);
    }

    // CSV format
    const calls = state.usage.recent_calls || [];
    if (calls.length === 0) return 'No data available';

    const headers = ['Timestamp', 'Agent', 'Layer', 'Duration (ms)', 'Success', 'Error'];
    const rows = calls.map(call => [
      call.timestamp,
      call.agent,
      call.layer.toString(),
      call.duration_ms.toString(),
      call.success.toString(),
      call.error_message || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }, [state.usage]);

  const actions: RealTimeUsageActions = {
    refreshUsage,
    clearWarnings,
    dismissWarning,
    calculateProjection,
    getUsageByTimeRange,
    exportUsageData,
  };

  return [state, actions];
}

// Helper functions for usage analysis
export function getUsageStatusColor(percentage: number): string {
  if (percentage >= 90) return 'text-red-500';
  if (percentage >= 75) return 'text-yellow-500';
  if (percentage >= 50) return 'text-blue-500';
  return 'text-green-500';
}

export function getUsageStatusMessage(percentage: number, tier: string): string {
  const blessings = {
    90: 'Approaching the appointed limits - wisdom suggests preparation',
    75: 'Faithful usage continues - vigilance is prudent',
    50: 'Blessed abundance remains - stewardship is wise',
    0: 'Divine resources await your faithful use',
  };

  for (const [threshold, message] of Object.entries(blessings)) {
    if (percentage >= parseInt(threshold)) {
      return message;
    }
  }
  return blessings[0];
}

export function formatUsageWithBiblicalContext(usage: UsageUpdateMessage): string {
  const theme = usage.biblical_theme;
  return `${theme.verse}\n\n${theme.message}\n\nStewardship: ${theme.stewardship}`;
}

export default useRealTimeUsage;