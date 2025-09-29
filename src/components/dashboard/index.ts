// Dashboard Components Export File
// C0RS0 License Portal - Biblical Themed Dashboard

export { DashboardLayout } from './DashboardLayout';
export { LicenseStatusCard } from './LicenseStatusCard';
export { UsageAnalytics } from './UsageAnalytics';
export { ApiKeyManagement } from './ApiKeyManagement';
export { BillingDashboard } from './BillingDashboard';
export { AlertBanner, AlertContainer, ToastAlert } from './AlertBanner';
export {
  LoadingSpinner,
  SkeletonCard,
  SkeletonChart,
  SkeletonTable,
  SkeletonStats,
  FullPageLoading,
  SectionLoading
} from './LoadingSpinner';

// Re-export types for convenience
export type {
  DashboardData,
  LicenseStatus,
  LicenseTier,
  UsageMetrics,
  ApiKey,
  BillingHistory,
  Subscription,
  ChartDataPoint,
  UsageChartData,
  ApiResponse
} from '@/types/dashboard';

// Dashboard configuration constants
export const DASHBOARD_CONFIG = {
  refreshInterval: 30000, // 30 seconds
  chartAnimationDuration: 500,
  maxAlertsVisible: 3,
  apiTimeout: 30000,
  retryAttempts: 3,
  defaultPageSize: 10
};

// Biblical theme constants
export const BIBLICAL_THEMES = {
  colors: {
    king: '#9d6aff',
    wisdom: '#f59e0b',
    security: '#6b7280',
    infrastructure: '#3b82f6',
    divine: '#eab308'
  },
  animations: {
    biblicalGlow: 'animate-biblical-glow',
    wisdomPulse: 'animate-wisdom-pulse'
  },
  fonts: {
    biblical: 'font-biblical',
    modern: 'font-modern'
  }
};

// Utility functions for dashboard
export const dashboardUtils = {
  formatCurrency: (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  },

  formatNumber: (num: number): string => {
    if (num === -1) return '∞';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  },

  formatBytes: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  getUsagePercentage: (current: number, limit: number): number => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  },

  getUsageColor: (percentage: number): string => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-green-400';
  },

  getBiblicalGreeting: (tier: string): string => {
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
  },

  getTierColor: (tier: string): string => {
    const colors = {
      explorer: 'security',
      prophet: 'divine',
      priest: 'wisdom',
      judge: 'security',
      king: 'king',
      high_priest: 'wisdom',
      sovereign: 'divine'
    };
    return colors[tier as keyof typeof colors] || 'security';
  }
};