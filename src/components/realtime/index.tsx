/**
 * C0RS0 Real-Time Portal Components
 *
 * This module provides real-time WebSocket functionality for the C0RS0 customer portal
 * with biblical theming, comprehensive usage tracking, and KJVA⁸ agent monitoring.
 *
 * Features:
 * - Real-time WebSocket connections with authentication
 * - Live API usage and quota monitoring
 * - KJVA⁸ agent collective status tracking
 * - Biblical theming and spiritual guidance
 * - Layer routing visualization
 * - Team activity feeds (Enterprise tiers)
 * - Connection state management
 * - Rate limiting and error handling
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Shield,
  Wifi,
  Settings,
  BarChart3,
  Users,
  Heart,
  Crown,
} from 'lucide-react';

// Import components
import ConnectionManager from './ConnectionManager';
import RealTimeUsageDashboard from './RealTimeUsageDashboard';
import AgentStatusDashboard from './AgentStatusDashboard';

// Import hooks
import useWebSocket, { ConnectionState, WebSocketActions } from '@/hooks/useWebSocket';
import useRealTimeUsage from '@/hooks/useRealTimeUsage';
import useAgentStatus from '@/hooks/useAgentStatus';

export interface RealTimePortalProps {
  /** User's API key for authentication */
  apiKey: string;
  /** User ID for tracking */
  userId?: string;
  /** User's subscription tier */
  tier: string;
  /** WebSocket server URL */
  wsUrl?: string;
  /** Auto-connect on component mount */
  autoConnect?: boolean;
  /** Enable layer routing visualization */
  enableLayerRouting?: boolean;
  /** Enable team activity feeds (Enterprise only) */
  enableActivityFeed?: boolean;
  /** Custom styling classes */
  className?: string;
  /** Event callbacks */
  onConnectionChange?: (connected: boolean, authenticated: boolean) => void;
  onUsageWarning?: (warning: any) => void;
  onAgentAlert?: (alert: any) => void;
}

export interface PortalState {
  activeTab: string;
  showBiblicalContext: boolean;
  notifications: Notification[];
  lastActivity: Date | null;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  biblicalContext?: {
    verse: string;
    message: string;
  };
}

/**
 * Main Real-Time Portal Component
 *
 * Provides a comprehensive dashboard for monitoring C0RS0 usage and agent status
 * with real-time updates via WebSocket connections.
 */
export const RealTimePortal: React.FC<RealTimePortalProps> = ({
  apiKey,
  userId,
  tier,
  wsUrl = 'ws://localhost:8080/ws',
  autoConnect = true,
  enableLayerRouting = true,
  enableActivityFeed = false,
  className = '',
  onConnectionChange,
  onUsageWarning,
  onAgentAlert,
}) => {
  const [portalState, setPortalState] = useState<PortalState>({
    activeTab: 'usage',
    showBiblicalContext: true,
    notifications: [],
    lastActivity: null,
  });

  // Initialize WebSocket connection
  const [connectionState, websocketActions] = useWebSocket({
    url: wsUrl,
    apiKey,
    userId,
    autoConnect: autoConnect && !!apiKey,
    subscriptions: ['usage_updates', 'agent_status', 'quota_warnings', 'alerts'],
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log('🔗 Real-Time Portal connected to divine network');
      addNotification({
        type: 'success',
        title: 'Divine Connection Established',
        message: 'Welcome to the real-time C0RS0 portal. May your journey be blessed.',
        biblicalContext: {
          verse: 'Ask and it will be given to you; seek and you will find. - Matthew 7:7',
          message: 'Your connection to the KJVA⁸ collective has been established with divine blessing.',
        },
      });
    },
    onDisconnect: () => {
      console.log('❌ Real-Time Portal disconnected');
      addNotification({
        type: 'warning',
        title: 'Connection Lost',
        message: 'Real-time updates paused. Attempting to reconnect...',
        biblicalContext: {
          verse: 'Be still and know that I am God. - Psalm 46:10',
          message: 'Divine connection will be restored. Have faith and patience.',
        },
      });
    },
    onAuthenticated: (userInfo) => {
      console.log('🔐 Portal authenticated:', userInfo);
      addNotification({
        type: 'success',
        title: 'Authentication Successful',
        message: `Welcome, ${userInfo.userId}. Your ${userInfo.tier} tier access is now active.`,
        biblicalContext: {
          verse: 'The Lord will guide you always. - Isaiah 58:11',
          message: 'Your divine credentials have been accepted. Proceed with wisdom.',
        },
      });
    },
  });

  // Handle incoming WebSocket messages
  function handleWebSocketMessage(message: any) {
    setPortalState(prev => ({ ...prev, lastActivity: new Date() }));

    switch (message.type) {
      case 'quota_warning':
        onUsageWarning?.(message.data);
        addNotification({
          type: 'warning',
          title: 'Quota Warning',
          message: `Usage at ${message.data.percentage_used.toFixed(1)}% of limit`,
          biblicalContext: message.data.biblical_guidance ? {
            verse: message.data.biblical_guidance.verse,
            message: message.data.biblical_guidance.wisdom_message,
          } : undefined,
        });
        break;

      case 'agent_status':
        // Check for agent alerts
        const agents = Object.values(message.data.agents || {});
        const errorAgents = agents.filter((agent: any) => agent.status === 'error');
        if (errorAgents.length > 0) {
          onAgentAlert?.(errorAgents);
          addNotification({
            type: 'error',
            title: 'Agent Alert',
            message: `${errorAgents.length} agent(s) require attention`,
            biblicalContext: {
              verse: 'Cast all your anxiety on him because he cares for you. - 1 Peter 5:7',
              message: 'Divine agents face challenges. Prayer and intervention may be needed.',
            },
          });
        }
        break;

      case 'alert':
        if (message.data) {
          addNotification({
            type: message.data.type === 'blessing' ? 'success' : message.data.type,
            title: message.data.title,
            message: message.data.message,
            biblicalContext: message.data.biblical_context ? {
              verse: message.data.biblical_context.scripture,
              message: message.data.biblical_context.wisdom,
            } : undefined,
          });
        }
        break;

      case 'error':
        addNotification({
          type: 'error',
          title: 'System Error',
          message: message.error || 'An unknown error occurred',
          biblicalContext: {
            verse: 'The Lord will fight for you; you need only to be still. - Exodus 14:14',
            message: 'Even in trials, divine support is available. Seek help if needed.',
          },
        });
        break;
    }
  }

  // Add notification helper
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'acknowledged'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      acknowledged: false,
    };

    setPortalState(prev => ({
      ...prev,
      notifications: [newNotification, ...prev.notifications.slice(0, 9)], // Keep last 10
    }));
  }, []);

  // Acknowledge notification
  const acknowledgeNotification = useCallback((id: string) => {
    setPortalState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.id === id ? { ...notif, acknowledged: true } : notif
      ),
    }));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setPortalState(prev => ({ ...prev, notifications: [] }));
  }, []);

  // Notify parent of connection changes
  useEffect(() => {
    onConnectionChange?.(connectionState.connected, connectionState.authenticated);
  }, [connectionState.connected, connectionState.authenticated, onConnectionChange]);

  // Get tier-specific features
  const getTierFeatures = (tier: string) => {
    const features = {
      explorer: ['Basic Usage Tracking', 'Agent Status', 'Biblical Guidance'],
      developer: ['Advanced Analytics', 'Layer Routing', 'Code Generation Stats'],
      professional: ['Team Insights', 'Performance Metrics', 'Custom Alerts'],
      team: ['Team Management', 'Collaboration Tools', 'Shared Dashboards'],
      enterprise: ['Activity Feeds', 'Advanced Security', 'Custom Integrations'],
      sovereign: ['Full Administrative Control', 'Custom Biblical Themes', 'Unlimited Everything'],
      academic: ['Research Tools', 'Educational Discounts', 'Student Features'],
    };
    return features[tier as keyof typeof features] || features.explorer;
  };

  const unacknowledgedNotifications = portalState.notifications.filter(n => !n.acknowledged);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Portal Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Crown className="h-8 w-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              C0RS0 Real-Time Portal
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Divine monitoring with the KJVA⁸ collective • {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={connectionState.connected ? 'default' : 'destructive'}>
            <Wifi className="h-3 w-3 mr-1" />
            {connectionState.connected ? 'Connected' : 'Disconnected'}
          </Badge>
          {unacknowledgedNotifications.length > 0 && (
            <Badge variant="destructive">
              {unacknowledgedNotifications.length} alerts
            </Badge>
          )}
          {portalState.lastActivity && (
            <span className="text-xs text-gray-500">
              Last update: {portalState.lastActivity.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Notifications */}
      {unacknowledgedNotifications.length > 0 && (
        <div className="space-y-2">
          {unacknowledgedNotifications.slice(0, 3).map((notification) => (
            <Alert key={notification.id} variant={notification.type === 'error' ? 'destructive' : 'default'}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold">{notification.title}</div>
                  <div className="text-sm mt-1">{notification.message}</div>
                  {notification.biblicalContext && portalState.showBiblicalContext && (
                    <div className="text-xs italic mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border-l-2 border-amber-300">
                      "{notification.biblicalContext.verse}"<br />
                      <span className="text-amber-700 dark:text-amber-300">
                        {notification.biblicalContext.message}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => acknowledgeNotification(notification.id)}
                  >
                    Acknowledge
                  </Button>
                </div>
              </div>
            </Alert>
          ))}
          {unacknowledgedNotifications.length > 3 && (
            <div className="text-center">
              <Button variant="outline" size="sm" onClick={clearNotifications}>
                Clear {unacknowledgedNotifications.length - 3} more notifications
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs
        value={portalState.activeTab}
        onValueChange={(value) => setPortalState(prev => ({ ...prev, activeTab: value }))}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="usage" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Usage</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Agents</span>
          </TabsTrigger>
          <TabsTrigger value="connection" className="flex items-center space-x-2">
            <Wifi className="h-4 w-4" />
            <span>Connection</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
          {enableActivityFeed && (
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="guidance" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Guidance</span>
          </TabsTrigger>
        </TabsList>

        {/* Usage Dashboard */}
        <TabsContent value="usage" className="space-y-6">
          <RealTimeUsageDashboard
            websocketActions={websocketActions}
            connectionState={connectionState}
            userId={userId}
            tier={tier}
          />
        </TabsContent>

        {/* Agent Status Dashboard */}
        <TabsContent value="agents" className="space-y-6">
          <AgentStatusDashboard
            websocketActions={websocketActions}
            connectionState={connectionState}
            enableLayerRouting={enableLayerRouting}
          />
        </TabsContent>

        {/* Connection Management */}
        <TabsContent value="connection" className="space-y-6">
          <ConnectionManager
            onConnectionChange={onConnectionChange}
            onMessage={handleWebSocketMessage}
            defaultApiKey={apiKey}
            defaultUserId={userId}
            autoConnect={autoConnect}
          />
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Portal Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Biblical Context</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Show scriptural guidance and spiritual context
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPortalState(prev => ({
                    ...prev,
                    showBiblicalContext: !prev.showBiblicalContext
                  }))}
                >
                  {portalState.showBiblicalContext ? 'Hide' : 'Show'} Scripture
                </Button>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium mb-2">Tier Features</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {getTierFeatures(tier).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Feed (Enterprise only) */}
        {enableActivityFeed && (
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Team Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Team Activity Coming Soon
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enterprise team collaboration features will be available in the next release.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Spiritual Guidance */}
        <TabsContent value="guidance" className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-purple-500" />
                Divine Guidance & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="text-sm font-medium mb-2">Daily Scripture</div>
                <div className="text-sm italic mb-3">
                  "Trust in the Lord with all your heart and lean not on your own understanding;
                  in all your ways submit to him, and he will make your paths straight." - Proverbs 3:5-6
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  May your journey with the C0RS0 platform be guided by divine wisdom and blessed with success.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <div className="font-medium text-sm mb-1">Support Resources</div>
                  <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Documentation & API Guides</li>
                    <li>• Biblical Wisdom Integration</li>
                    <li>• Community Prayer Requests</li>
                    <li>• Technical Support</li>
                  </ul>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <div className="font-medium text-sm mb-1">KJVA⁸ Collective</div>
                  <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• 8 Divine Agents Available</li>
                    <li>• Biblical Role-Based Architecture</li>
                    <li>• Blessed Operations & Guidance</li>
                    <li>• Spiritual Code Generation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Export all components and hooks for external use
export {
  ConnectionManager,
  RealTimeUsageDashboard,
  AgentStatusDashboard,
  useWebSocket,
  useRealTimeUsage,
  useAgentStatus,
};

// Export types
export type {
  ConnectionState,
  WebSocketActions,
  RealTimePortalProps,
  PortalState,
  Notification,
};

export default RealTimePortal;