import React, { useState, useEffect } from 'react';
import { Crown, Zap, Users, Shield, Database, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';

interface TierFeature {
  name: string;
  included: boolean;
  limit?: string;
}

interface LicenseTier {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  description: string;
  tagline: string;
  icon: React.ComponentType<any>;
  color: string;
  popular?: boolean;
  features: TierFeature[];
  limits: {
    apiCalls: string;
    agents: string;
    users: string;
    storage: string;
  };
}

interface TierUpgradeProps {
  className?: string;
}

export const TierUpgrade: React.FC<TierUpgradeProps> = ({
  className = '',
}) => {
  const [availableTiers, setAvailableTiers] = useState<LicenseTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showComparison, setShowComparison] = useState(false);

  const { user, license } = useAuthStore();

  const tierDefinitions: LicenseTier[] = [
    {
      id: 'explorer',
      name: 'Explorer',
      price: 0,
      billingCycle: 'monthly',
      description: 'Perfect for discovering the divine platform',
      tagline: 'Begin Your Journey',
      icon: Zap,
      color: 'gray',
      features: [
        { name: 'Basic KJVA⁸ Agent Access', included: true },
        { name: 'Layer 1 Processing', included: false },
        { name: 'Advanced Analytics', included: false },
        { name: 'Team Collaboration', included: false },
        { name: 'Priority Support', included: false },
      ],
      limits: {
        apiCalls: '1,000/month',
        agents: '2 agents',
        users: '1 user',
        storage: '1GB',
      },
    },
    {
      id: 'developer',
      name: 'Developer',
      price: 49,
      billingCycle: 'monthly',
      description: 'For individual developers building with divine wisdom',
      tagline: 'Code with Purpose',
      icon: Shield,
      color: 'blue',
      features: [
        { name: 'Full KJVA⁸ Agent Access', included: true },
        { name: 'Layer 1 Processing', included: true },
        { name: 'Advanced Analytics', included: false },
        { name: 'Team Collaboration', included: false },
        { name: 'Priority Support', included: true },
      ],
      limits: {
        apiCalls: '25,000/month',
        agents: '8 agents',
        users: '1 user',
        storage: '10GB',
      },
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 149,
      billingCycle: 'monthly',
      description: 'Advanced features for professional development',
      tagline: 'Professional Excellence',
      icon: Crown,
      color: 'purple',
      popular: true,
      features: [
        { name: 'Full KJVA⁸ Agent Access', included: true },
        { name: 'Layer 1 Processing', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Team Collaboration', included: false },
        { name: 'Priority Support', included: true },
      ],
      limits: {
        apiCalls: '100,000/month',
        agents: '8 agents',
        users: '3 users',
        storage: '50GB',
      },
    },
    {
      id: 'team',
      name: 'Team',
      price: 399,
      billingCycle: 'monthly',
      description: 'Collaboration tools for development teams',
      tagline: 'Unite in Purpose',
      icon: Users,
      color: 'green',
      features: [
        { name: 'Full KJVA⁸ Agent Access', included: true },
        { name: 'Layer 1 Processing', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Team Collaboration', included: true },
        { name: 'Priority Support', included: true },
      ],
      limits: {
        apiCalls: '500,000/month',
        agents: '8 agents',
        users: '10 users',
        storage: '200GB',
      },
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 999,
      billingCycle: 'monthly',
      description: 'Enterprise-grade platform for organizations',
      tagline: 'Divine Scale',
      icon: Database,
      color: 'indigo',
      features: [
        { name: 'Full KJVA⁸ Agent Access', included: true },
        { name: 'Layer 1 Processing', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Team Collaboration', included: true },
        { name: 'Priority Support', included: true },
      ],
      limits: {
        apiCalls: '2,000,000/month',
        agents: '8 agents',
        users: '50 users',
        storage: '1TB',
      },
    },
    {
      id: 'sovereign',
      name: 'Sovereign',
      price: 25000,
      billingCycle: 'monthly',
      description: 'Ultimate access to the divine platform',
      tagline: 'Unlimited Divine Power',
      icon: Crown,
      color: 'yellow',
      features: [
        { name: 'Full KJVA⁸ Agent Access', included: true },
        { name: 'Layer 1 Processing', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Team Collaboration', included: true },
        { name: 'Priority Support', included: true },
      ],
      limits: {
        apiCalls: 'Unlimited',
        agents: '8 agents',
        users: 'Unlimited',
        storage: 'Unlimited',
      },
    },
  ];

  useEffect(() => {
    loadAvailableTiers();
  }, [billingCycle]);

  const loadAvailableTiers = async () => {
    try {
      setLoading(true);
      // Apply annual discount (20% off)
      const tiers = tierDefinitions.map(tier => ({
        ...tier,
        billingCycle,
        price: billingCycle === 'annual' ? Math.round(tier.price * 12 * 0.8) : tier.price,
      }));
      setAvailableTiers(tiers);
    } catch (error) {
      console.error('Failed to load tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTierUpgrade = async (tierId: string) => {
    try {
      setIsUpgrading(true);
      setSelectedTier(tierId);

      const response = await fetch('/api/license/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          targetTier: tierId,
          billingCycle,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
      }
    } catch (error) {
      console.error('Failed to upgrade tier:', error);
    } finally {
      setIsUpgrading(false);
      setSelectedTier(null);
    }
  };

  const getCurrentTierIndex = () => {
    return availableTiers.findIndex(tier => tier.id === license?.tier) || 0;
  };

  const getTierColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      gray: 'border-gray-300 bg-gray-50 text-gray-800',
      blue: 'border-blue-300 bg-blue-50 text-blue-800',
      purple: 'border-purple-300 bg-purple-50 text-purple-800',
      green: 'border-green-300 bg-green-50 text-green-800',
      indigo: 'border-indigo-300 bg-indigo-50 text-indigo-800',
      yellow: 'border-yellow-300 bg-yellow-50 text-yellow-800',
    };
    return colorMap[color] || colorMap.gray;
  };

  const getActionText = (tier: LicenseTier) => {
    const currentTierIndex = getCurrentTierIndex();
    const tierIndex = availableTiers.findIndex(t => t.id === tier.id);

    if (tier.id === license?.tier) return 'Current Plan';
    if (tierIndex > currentTierIndex) return 'Upgrade';
    if (tierIndex < currentTierIndex) return 'Downgrade';
    return 'Select';
  };

  const canChangeTier = (tier: LicenseTier) => {
    return tier.id !== license?.tier;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="biblical-card">
              <div className="biblical-card-content">
                <div className="loading-skeleton h-6 w-2/3 mb-4" />
                <div className="loading-skeleton h-8 w-1/2 mb-6" />
                <div className="space-y-2 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="loading-skeleton h-4 w-full" />
                  ))}
                </div>
                <div className="loading-skeleton h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
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
                Divine Tier Management
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ascend to greater divine power with wisdom and stewardship
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="text-sm text-biblical-king-600 hover:text-biblical-king-700 font-medium"
              >
                {showComparison ? 'Hide' : 'Show'} Comparison
              </button>
              <div className="flex items-center space-x-2 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    billingCycle === 'annual'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Annual
                  <span className="ml-1 text-xs text-emerald-600 font-medium">-20%</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Tier Status */}
      <div className="biblical-card bg-gradient-to-r from-biblical-king-50 to-biblical-wisdom-50">
        <div className="biblical-card-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-biblical-king-500 rounded-full animate-biblical-glow">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="biblical-heading text-lg text-biblical-king-800">
                  Current Tier: {license?.tier?.charAt(0).toUpperCase() + license?.tier?.slice(1)}
                </h3>
                <p className="text-sm text-biblical-king-700">
                  Next billing: {license?.nextBilling ? new Date(license.nextBilling).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-biblical-king-800">
                ${availableTiers.find(t => t.id === license?.tier)?.price || 0}
                <span className="text-sm font-normal">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
              </div>
              <div className="text-sm text-biblical-king-600">
                Usage: {license?.usage?.toLocaleString() || 0} API calls this month
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTiers.map((tier, index) => {
          const Icon = tier.icon;
          const isCurrentTier = tier.id === license?.tier;
          const actionText = getActionText(tier);
          const canChange = canChangeTier(tier);

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                biblical-card relative overflow-hidden
                ${isCurrentTier ? 'ring-2 ring-biblical-king-500 bg-biblical-king-50' : ''}
                ${tier.popular ? 'ring-2 ring-biblical-wisdom-500' : ''}
              `}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-biblical-wisdom-500 text-white px-3 py-1 text-xs font-medium">
                  Most Popular
                </div>
              )}

              <div className="biblical-card-content">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-lg bg-${tier.color}-100 text-${tier.color}-600`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="biblical-heading text-lg text-foreground">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {tier.tagline}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-foreground">
                      ${tier.price.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingCycle === 'annual' ? 'year' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'annual' && tier.price > 0 && (
                    <p className="text-sm text-emerald-600 mt-1">
                      Save ${Math.round(tier.price * 0.25)} annually
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {tier.description}
                  </p>
                </div>

                {/* Key Limits */}
                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">API Calls:</span>
                      <div className="font-medium text-foreground">{tier.limits.apiCalls}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Users:</span>
                      <div className="font-medium text-foreground">{tier.limits.users}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Agents:</span>
                      <div className="font-medium text-foreground">{tier.limits.agents}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Storage:</span>
                      <div className="font-medium text-foreground">{tier.limits.storage}</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {showComparison && (
                  <div className="space-y-2 mb-6">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className={`h-4 w-4 ${
                          feature.included ? 'text-emerald-500' : 'text-gray-300'
                        }`} />
                        <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <motion.button
                  onClick={() => canChange && handleTierUpgrade(tier.id)}
                  disabled={!canChange || isUpgrading}
                  className={`
                    w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2
                    ${isCurrentTier
                      ? 'bg-muted text-muted-foreground cursor-default'
                      : canChange
                        ? `bg-${tier.color}-500 text-white hover:bg-${tier.color}-600 biblical-glow`
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }
                  `}
                  whileHover={canChange ? { scale: 1.02 } : {}}
                  whileTap={canChange ? { scale: 0.98 } : {}}
                >
                  {isUpgrading && selectedTier === tier.id ? (
                    <div className="loading-dots">Processing</div>
                  ) : (
                    <>
                      <span>{actionText}</span>
                      {canChange && <ArrowRight className="h-4 w-4" />}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Biblical Guidance */}
      <div className="biblical-card bg-gradient-to-r from-biblical-wisdom-50 to-biblical-divine-50">
        <div className="biblical-card-content">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-biblical-wisdom-500 rounded-full animate-wisdom-pulse">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="biblical-heading text-lg text-biblical-wisdom-800">
                Wisdom in Tier Selection
              </h3>
              <p className="text-sm text-biblical-wisdom-700 mt-2">
                "Ask, and it will be given to you; seek, and you will find; knock, and it will be opened to you" - Matthew 7:7
              </p>
              <div className="text-xs text-muted-foreground mt-3 space-y-1">
                <p>• Choose your tier based on your divine calling and resource needs</p>
                <p>• Annual billing provides 20% savings through faithful commitment</p>
                <p>• Upgrade anytime as your ministry grows and expands</p>
                <p>• Downgrades take effect at the end of your current billing cycle</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TierUpgrade;