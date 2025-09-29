// Dashboard types for C0RS0 License Portal
export interface LicenseTier {
  id: string;
  name: string;
  displayName: string;
  price: number;
  billing: 'monthly' | 'annual';
  color: 'king' | 'wisdom' | 'security' | 'infrastructure' | 'divine';
  biblical_name: string;
  features: string[];
  limits: {
    api_calls_per_month: number;
    concurrent_connections: number;
    data_retention_days: number;
    support_level: string;
  };
}

export interface LicenseStatus {
  id: string;
  user_id: string;
  tier: LicenseTier;
  status: 'active' | 'expired' | 'suspended' | 'trial';
  expires_at: string;
  created_at: string;
  updated_at: string;
  auto_renew: boolean;
  grace_period_ends?: string;
}

export interface UsageMetrics {
  period: string; // 'daily' | 'weekly' | 'monthly'
  api_calls: {
    total: number;
    limit: number;
    percentage: number;
    by_endpoint: Record<string, number>;
    by_date: Array<{
      date: string;
      calls: number;
    }>;
  };
  bandwidth: {
    total_gb: number;
    limit_gb: number;
    percentage: number;
    by_date: Array<{
      date: string;
      gb_used: number;
    }>;
  };
  concurrent_connections: {
    current: number;
    peak: number;
    limit: number;
    by_hour: Array<{
      hour: string;
      connections: number;
    }>;
  };
  response_times: {
    average_ms: number;
    p95_ms: number;
    p99_ms: number;
    by_endpoint: Record<string, {
      avg: number;
      p95: number;
      p99: number;
    }>;
  };
}

export interface ApiKey {
  id: string;
  name: string;
  key_preview: string; // First 8 chars + ***
  permissions: string[];
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
  usage_count: number;
}

export interface BillingHistory {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  issued_at: string;
  paid_at?: string;
  due_at: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  payment_method?: {
    type: 'card' | 'bank' | 'crypto';
    last_four?: string;
  };
}

export interface Subscription {
  id: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  payment_method?: {
    type: string;
    last_four: string;
    exp_month: number;
    exp_year: number;
  };
  next_billing_date: string;
  proration_date?: string;
}

export interface DashboardData {
  license: LicenseStatus;
  usage: UsageMetrics;
  api_keys: ApiKey[];
  billing_history: BillingHistory[];
  subscription?: Subscription;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    created_at: string;
    dismissed?: boolean;
  }>;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface UsageChartData {
  api_calls: ChartDataPoint[];
  bandwidth: ChartDataPoint[];
  response_times: ChartDataPoint[];
  connections: ChartDataPoint[];
}

// Biblical tier configuration
export const BIBLICAL_TIERS: Record<string, LicenseTier> = {
  explorer: {
    id: 'explorer',
    name: 'Explorer',
    displayName: 'Explorer (Free)',
    price: 0,
    billing: 'monthly',
    color: 'security',
    biblical_name: 'WANDERER',
    features: ['Basic API Access', 'Community Support', '7-day Data Retention'],
    limits: {
      api_calls_per_month: 1000,
      concurrent_connections: 5,
      data_retention_days: 7,
      support_level: 'community'
    }
  },
  prophet: {
    id: 'prophet',
    name: 'Prophet',
    displayName: 'Prophet',
    price: 29,
    billing: 'monthly',
    color: 'divine',
    biblical_name: 'N4TH4N',
    features: ['Enhanced API Access', 'Email Support', '30-day Data Retention', 'Basic Analytics'],
    limits: {
      api_calls_per_month: 10000,
      concurrent_connections: 25,
      data_retention_days: 30,
      support_level: 'email'
    }
  },
  priest: {
    id: 'priest',
    name: 'Priest',
    displayName: 'Priest',
    price: 99,
    billing: 'monthly',
    color: 'wisdom',
    biblical_name: '4AR0N',
    features: ['Priority API Access', 'Chat Support', '90-day Data Retention', 'Advanced Analytics', 'Custom Webhooks'],
    limits: {
      api_calls_per_month: 50000,
      concurrent_connections: 100,
      data_retention_days: 90,
      support_level: 'chat'
    }
  },
  judge: {
    id: 'judge',
    name: 'Judge',
    displayName: 'Judge',
    price: 299,
    billing: 'monthly',
    color: 'security',
    biblical_name: 'G1D30N',
    features: ['Premium API Access', 'Phone Support', '180-day Data Retention', 'Real-time Analytics', 'SLA Guarantees'],
    limits: {
      api_calls_per_month: 200000,
      concurrent_connections: 500,
      data_retention_days: 180,
      support_level: 'phone'
    }
  },
  king: {
    id: 'king',
    name: 'King',
    displayName: 'King',
    price: 999,
    billing: 'monthly',
    color: 'king',
    biblical_name: 'K1NGxDAV1D',
    features: ['Enterprise API Access', 'Dedicated Support', '1-year Data Retention', 'Custom Integrations', '99.9% SLA'],
    limits: {
      api_calls_per_month: 1000000,
      concurrent_connections: 2000,
      data_retention_days: 365,
      support_level: 'dedicated'
    }
  },
  high_priest: {
    id: 'high_priest',
    name: 'High Priest',
    displayName: 'High Priest',
    price: 2999,
    billing: 'monthly',
    color: 'wisdom',
    biblical_name: 'M3LCH1Z3D3K',
    features: ['Unlimited API Access', 'White-glove Support', 'Unlimited Data Retention', 'Custom Infrastructure', '99.99% SLA'],
    limits: {
      api_calls_per_month: -1, // Unlimited
      concurrent_connections: 10000,
      data_retention_days: -1, // Unlimited
      support_level: 'white_glove'
    }
  },
  sovereign: {
    id: 'sovereign',
    name: 'Sovereign',
    displayName: 'Sovereign',
    price: 25000,
    billing: 'monthly',
    color: 'divine',
    biblical_name: 'IESOUS',
    features: ['Divine API Access', 'Divine Support', 'Eternal Data Retention', 'Divine Infrastructure', 'Divine SLA'],
    limits: {
      api_calls_per_month: -1, // Unlimited
      concurrent_connections: -1, // Unlimited
      data_retention_days: -1, // Unlimited
      support_level: 'divine'
    }
  }
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: string;
};