'use client';

import React from 'react';
import { DashboardLayout } from '@/components/dashboard';
import { DashboardData, BIBLICAL_TIERS } from '@/types/dashboard';

// Mock data for demonstration
const mockDashboardData: DashboardData = {
  license: {
    id: 'lic_k1ng_dav1d_001',
    user_id: 'usr_001',
    tier: BIBLICAL_TIERS.king,
    status: 'active',
    expires_at: '2024-12-31T23:59:59Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-29T12:00:00Z',
    auto_renew: true
  },
  usage: {
    period: 'monthly',
    api_calls: {
      total: 750000,
      limit: 1000000,
      percentage: 75,
      by_endpoint: {
        '/api/v1/agents/k1ng-dav1d': 250000,
        '/api/v1/agents/3l1j4h': 150000,
        '/api/v1/agents/m3lch1z3d3k': 120000,
        '/api/v1/agents/iesous': 100000,
        '/api/v1/usage': 50000,
        '/api/v1/billing': 30000,
        '/api/v1/analytics': 50000
      },
      by_date: [
        { date: '2024-09-23', calls: 45000 },
        { date: '2024-09-24', calls: 52000 },
        { date: '2024-09-25', calls: 48000 },
        { date: '2024-09-26', calls: 61000 },
        { date: '2024-09-27', calls: 58000 },
        { date: '2024-09-28', calls: 49000 },
        { date: '2024-09-29', calls: 55000 }
      ]
    },
    bandwidth: {
      total_gb: 2250.5,
      limit_gb: 5000,
      percentage: 45,
      by_date: [
        { date: '2024-09-23', gb_used: 125.2 },
        { date: '2024-09-24', gb_used: 142.8 },
        { date: '2024-09-25', gb_used: 138.6 },
        { date: '2024-09-26', gb_used: 165.3 },
        { date: '2024-09-27', gb_used: 159.8 },
        { date: '2024-09-28', gb_used: 147.2 },
        { date: '2024-09-29', gb_used: 152.4 }
      ]
    },
    concurrent_connections: {
      current: 342,
      peak: 1250,
      limit: 2000,
      by_hour: [
        { hour: '2024-09-29T08:00:00Z', connections: 180 },
        { hour: '2024-09-29T09:00:00Z', connections: 245 },
        { hour: '2024-09-29T10:00:00Z', connections: 320 },
        { hour: '2024-09-29T11:00:00Z', connections: 380 },
        { hour: '2024-09-29T12:00:00Z', connections: 342 },
        { hour: '2024-09-29T13:00:00Z', connections: 295 },
        { hour: '2024-09-29T14:00:00Z', connections: 410 }
      ]
    },
    response_times: {
      average_ms: 14,
      p95_ms: 45,
      p99_ms: 89,
      by_endpoint: {
        '/api/v1/agents/k1ng-dav1d': { avg: 12, p95: 38, p99: 72 },
        '/api/v1/agents/3l1j4h': { avg: 8, p95: 28, p99: 55 },
        '/api/v1/agents/m3lch1z3d3k': { avg: 18, p95: 52, p99: 95 },
        '/api/v1/agents/iesous': { avg: 22, p95: 68, p99: 125 },
        '/api/v1/usage': { avg: 6, p95: 18, p99: 35 },
        '/api/v1/billing': { avg: 4, p95: 12, p99: 24 }
      }
    }
  },
  api_keys: [
    {
      id: 'key_prod_001',
      name: 'Production API Key',
      key_preview: 'corso_k1ng...x7z9',
      permissions: ['read:usage', 'write:api', 'read:billing'],
      created_at: '2024-01-15T10:30:00Z',
      last_used_at: '2024-09-29T11:45:00Z',
      expires_at: '2025-01-15T10:30:00Z',
      is_active: true,
      usage_count: 892456
    },
    {
      id: 'key_dev_001',
      name: 'Development API Key',
      key_preview: 'corso_dev...m4k8',
      permissions: ['read:usage', 'write:api'],
      created_at: '2024-03-10T14:20:00Z',
      last_used_at: '2024-09-28T16:30:00Z',
      is_active: true,
      usage_count: 145892
    },
    {
      id: 'key_test_001',
      name: 'Testing API Key',
      key_preview: 'corso_tst...p2w6',
      permissions: ['read:usage'],
      created_at: '2024-06-05T09:15:00Z',
      last_used_at: '2024-09-27T08:20:00Z',
      expires_at: '2024-12-05T09:15:00Z',
      is_active: true,
      usage_count: 28947
    }
  ],
  billing_history: [
    {
      id: 'inv_202409_001',
      invoice_number: 'CORSO-2024-09-001',
      amount: 999.00,
      currency: 'usd',
      status: 'paid',
      issued_at: '2024-09-01T00:00:00Z',
      paid_at: '2024-09-01T12:34:56Z',
      due_at: '2024-09-15T23:59:59Z',
      items: [
        {
          description: 'C0RS0 King Tier License - September 2024',
          quantity: 1,
          unit_price: 999.00,
          total: 999.00
        }
      ],
      payment_method: {
        type: 'card',
        last_four: '4242'
      }
    },
    {
      id: 'inv_202408_001',
      invoice_number: 'CORSO-2024-08-001',
      amount: 999.00,
      currency: 'usd',
      status: 'paid',
      issued_at: '2024-08-01T00:00:00Z',
      paid_at: '2024-08-01T10:22:33Z',
      due_at: '2024-08-15T23:59:59Z',
      items: [
        {
          description: 'C0RS0 King Tier License - August 2024',
          quantity: 1,
          unit_price: 999.00,
          total: 999.00
        }
      ],
      payment_method: {
        type: 'card',
        last_four: '4242'
      }
    },
    {
      id: 'inv_202407_001',
      invoice_number: 'CORSO-2024-07-001',
      amount: 999.00,
      currency: 'usd',
      status: 'paid',
      issued_at: '2024-07-01T00:00:00Z',
      paid_at: '2024-07-01T15:18:45Z',
      due_at: '2024-07-15T23:59:59Z',
      items: [
        {
          description: 'C0RS0 King Tier License - July 2024',
          quantity: 1,
          unit_price: 999.00,
          total: 999.00
        }
      ],
      payment_method: {
        type: 'card',
        last_four: '4242'
      }
    }
  ],
  subscription: {
    id: 'sub_k1ng_001',
    status: 'active',
    current_period_start: '2024-09-01T00:00:00Z',
    current_period_end: '2024-10-01T00:00:00Z',
    cancel_at_period_end: false,
    payment_method: {
      type: 'card',
      last_four: '4242',
      exp_month: 12,
      exp_year: 2027
    },
    next_billing_date: '2024-10-01T00:00:00Z'
  },
  alerts: [
    {
      id: 'alert_001',
      type: 'warning',
      title: 'Usage Approaching Limit',
      message: 'Your API calls have reached 75% of your monthly limit. Consider upgrading or optimizing usage.',
      created_at: '2024-09-29T10:00:00Z'
    },
    {
      id: 'alert_002',
      type: 'info',
      title: 'New Feature Available',
      message: 'The IESOUS divine code generation agent now supports enhanced 0V3RTH1NK protocol.',
      created_at: '2024-09-28T14:30:00Z'
    }
  ]
};

// Mock API function to simulate data fetching
const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockDashboardData;
};

// Override global fetch for the demo
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (url: string | Request, options?: RequestInit) => {
    const urlString = typeof url === 'string' ? url : url.url;

    if (urlString.includes('/api/v1/dashboard')) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new Response(JSON.stringify({
            success: true,
            data: mockDashboardData,
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
        }, 800);
      });
    }

    // For other API calls, return mock responses
    if (urlString.includes('/api/v1/api-keys') && options?.method === 'POST') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new Response(JSON.stringify({
            success: true,
            data: {
              id: 'key_new_001',
              key: 'corso_demo_new_key_abcd1234efgh5678',
              name: 'Demo Created Key'
            }
          }), { status: 201 }));
        }, 500);
      });
    }

    if (urlString.includes('/api/v1/api-keys') && options?.method === 'DELETE') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new Response(JSON.stringify({
            success: true,
            message: 'API key deleted successfully'
          }), { status: 200 }));
        }, 300);
      });
    }

    if (urlString.includes('/api/v1/billing/invoices') && urlString.includes('/download')) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(new Response(new Blob(['Demo PDF content'], { type: 'application/pdf' }), {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="corso-invoice-demo.pdf"'
            }
          }));
        }, 1000);
      });
    }

    // Fallback to original fetch for other requests
    return originalFetch(url, options);
  };
}

const DashboardDemo: React.FC = () => {
  return (
    <div className="min-h-screen">
      <DashboardLayout />
    </div>
  );
};

export default DashboardDemo;