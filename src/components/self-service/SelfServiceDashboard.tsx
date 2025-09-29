import React, { useState } from 'react';
import { Crown, Key, CreditCard, Bell, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { ApiKeyManagement } from './ApiKeyManagement';
import { TierUpgrade } from './TierUpgrade';
import { PaymentManagement } from './PaymentManagement';
import { AlertsConfiguration } from './AlertsConfiguration';
import { SecuritySettings } from './SecuritySettings';

interface SelfServiceDashboardProps {
  className?: string;
}

type ServiceTab = 'api-keys' | 'tier-upgrade' | 'payments' | 'alerts' | 'security';

const serviceFeatures = [
  {
    id: 'api-keys' as ServiceTab,
    title: 'API Keys',
    subtitle: 'Divine Keys to the Kingdom',
    description: 'Manage your sacred API keys with biblical security',
    icon: Key,
    color: 'biblical-king',
    verse: 'I will give you the keys of the kingdom of heaven - Matthew 16:19',
    component: ApiKeyManagement,
  },
  {
    id: 'tier-upgrade' as ServiceTab,
    title: 'Tier Management',
    subtitle: 'Ascend to Greater Glory',
    description: 'Upgrade your license tier for enhanced divine power',
    icon: Crown,
    color: 'biblical-wisdom',
    verse: 'Ask, and it will be given to you - Matthew 7:7',
    component: TierUpgrade,
  },
  {
    id: 'payments' as ServiceTab,
    title: 'Payment Methods',
    subtitle: 'Faithful Stewardship',
    description: 'Manage billing and payment methods with integrity',
    icon: CreditCard,
    color: 'biblical-infrastructure',
    verse: 'Give, and it will be given to you - Luke 6:38',
    component: PaymentManagement,
  },
  {
    id: 'alerts' as ServiceTab,
    title: 'Usage Alerts',
    subtitle: 'Watchful Vigilance',
    description: 'Configure divine notifications for resource stewardship',
    icon: Bell,
    color: 'biblical-security',
    verse: 'Watch and pray - Matthew 26:41',
    component: AlertsConfiguration,
  },
  {
    id: 'security' as ServiceTab,
    title: 'Security Settings',
    subtitle: 'Divine Protection',
    description: 'Enhance your account security with heavenly shields',
    icon: Shield,
    color: 'biblical-divine',
    verse: 'The Lord is my shield - Psalm 3:3',
    component: SecuritySettings,
  },
];

export const SelfServiceDashboard: React.FC<SelfServiceDashboardProps> = ({
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<ServiceTab>('api-keys');
  const { user, license, biblicalIdentity } = useAuthStore();

  const ActiveComponent = serviceFeatures.find(f => f.id === activeTab)?.component;
  const activeFeature = serviceFeatures.find(f => f.id === activeTab);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Biblical Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="biblical-card p-6"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-biblical-gradient rounded-full biblical-glow">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="biblical-heading text-2xl text-foreground">
              Self-Service Portal
            </h1>
            <p className="text-muted-foreground">
              Greetings, {biblicalIdentity?.spiritualName || user?.name}.
              Manage your divine license with wisdom and stewardship.
            </p>
          </div>
        </div>

        {license && (
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-biblical-king-500" />
              <span className="font-medium">Tier: {license.tier}</span>
            </div>
            <div className="text-muted-foreground">
              anointing level: {biblicalIdentity?.anointingLevel || 'Faithful Servant'}
            </div>
          </div>
        )}
      </motion.div>

      {/* Service Navigation */}
      <div className="biblical-card">
        <div className="biblical-card-header">
          <h2 className="biblical-heading text-lg">Divine Services</h2>
          <p className="text-sm text-muted-foreground">
            Choose your path of stewardship and empowerment
          </p>
        </div>

        <div className="biblical-card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {serviceFeatures.map((feature) => {
              const Icon = feature.icon;
              const isActive = activeTab === feature.id;

              return (
                <motion.button
                  key={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-300 text-left
                    ${isActive
                      ? `border-${feature.color}-500 bg-${feature.color}-50 shadow-lg`
                      : 'border-border hover:border-muted-foreground hover:shadow-md'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      p-2 rounded-lg
                      ${isActive
                        ? `bg-${feature.color}-500 text-white`
                        : `bg-${feature.color}-100 text-${feature.color}-600`
                      }
                    `}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {feature.subtitle}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className={`absolute inset-0 border-2 border-${feature.color}-500 rounded-lg animate-${feature.color.replace('biblical-', '')}-glow`}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Service Component */}
      {ActiveComponent && activeFeature && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Biblical Verse for Context */}
          <div className={`
            biblical-card border-l-4 border-l-${activeFeature.color}-500
            bg-gradient-to-r from-${activeFeature.color}-50 to-transparent
          `}>
            <div className="biblical-card-content py-3">
              <p className="biblical-text text-sm text-${activeFeature.color}-700 italic">
                "{activeFeature.verse}"
              </p>
            </div>
          </div>

          {/* Service Component */}
          <ActiveComponent />
        </motion.div>
      )}

      {/* Divine Guidance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="biblical-card bg-gradient-to-r from-biblical-divine-50 to-biblical-wisdom-50"
      >
        <div className="biblical-card-content">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-biblical-divine-500 rounded-full animate-divine-shimmer">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="biblical-heading text-lg text-biblical-divine-800">
                Divine Stewardship Guidance
              </h3>
              <p className="text-sm text-biblical-divine-700 mt-2">
                "Whoever is faithful in very little is also faithful in much" - Luke 16:10
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Use these self-service tools with wisdom and integrity.
                Your faithful stewardship of resources honors the divine purpose of this platform.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SelfServiceDashboard;