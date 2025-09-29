import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Shield,
  Zap,
  Heart,
  Eye,
  EyeOff,
} from 'lucide-react';

import useWebSocket, { ConnectionState, SubscriptionType } from '@/hooks/useWebSocket';

interface ConnectionManagerProps {
  onConnectionChange?: (connected: boolean, authenticated: boolean) => void;
  onMessage?: (message: any) => void;
  defaultApiKey?: string;
  defaultUserId?: string;
  autoConnect?: boolean;
}

const ConnectionStatusIndicator: React.FC<{
  connectionState: ConnectionState;
  className?: string;
}> = ({ connectionState, className = '' }) => {
  const getStatusColor = () => {
    if (connectionState.connected && connectionState.authenticated) return 'text-green-500';
    if (connectionState.connected) return 'text-yellow-500';
    if (connectionState.connecting) return 'text-blue-500';
    return 'text-red-500';
  };

  const getStatusIcon = () => {
    if (connectionState.connected && connectionState.authenticated) return <CheckCircle className="h-4 w-4" />;
    if (connectionState.connected) return <Clock className="h-4 w-4" />;
    if (connectionState.connecting) return <RefreshCw className="h-4 w-4 animate-spin" />;
    return <WifiOff className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (connectionState.connected && connectionState.authenticated) return 'Connected & Authenticated';
    if (connectionState.connected) return 'Connected - Authenticating';
    if (connectionState.connecting) return 'Connecting...';
    return 'Disconnected';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className={getStatusColor()}>
        {getStatusIcon()}
      </span>
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {connectionState.retryCount > 0 && (
        <Badge variant="outline" className="text-xs">
          Retry {connectionState.retryCount}
        </Badge>
      )}
    </div>
  );
};

const BiblicalConnectionMessage: React.FC<{
  connectionState: ConnectionState;
}> = ({ connectionState }) => {
  const getMessage = () => {
    if (connectionState.connected && connectionState.authenticated) {
      return {
        verse: "Ask and it will be given to you; seek and you will find. - Matthew 7:7",
        message: "Divine connection established. The KJVA⁸ collective awaits your requests.",
        type: "success" as const,
      };
    }
    if (connectionState.connected) {
      return {
        verse: "Knock and the door will be opened to you. - Matthew 7:7",
        message: "Connection established. Please provide your divine credentials for full access.",
        type: "info" as const,
      };
    }
    if (connectionState.connecting) {
      return {
        verse: "Wait for the Lord; be strong and take heart. - Psalm 27:14",
        message: "Seeking divine connection. Please wait with patience and faith.",
        type: "info" as const,
      };
    }
    if (connectionState.error) {
      return {
        verse: "Cast all your anxiety on him because he cares for you. - 1 Peter 5:7",
        message: "Connection challenged. Divine intervention may be required.",
        type: "error" as const,
      };
    }
    return {
      verse: "Be still and know that I am God. - Psalm 46:10",
      message: "Awaiting divine connection. Your journey begins with a single step.",
      type: "info" as const,
    };
  };

  const { verse, message, type } = getMessage();

  return (
    <div className={`p-3 rounded-lg border-l-4 ${
      type === 'success'
        ? 'bg-green-50 dark:bg-green-900/20 border-green-300'
        : type === 'error'
        ? 'bg-red-50 dark:bg-red-900/20 border-red-300'
        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300'
    }`}>
      <div className="text-sm italic mb-2 text-gray-700 dark:text-gray-300">
        "{verse}"
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400">
        {message}
      </div>
    </div>
  );
};

const SubscriptionManager: React.FC<{
  websocketActions: any;
  connectionState: ConnectionState;
  activeSubscriptions: SubscriptionType[];
  onSubscriptionChange?: (subscriptions: SubscriptionType[]) => void;
}> = ({ websocketActions, connectionState, activeSubscriptions, onSubscriptionChange }) => {
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<SubscriptionType[]>(activeSubscriptions);

  const availableSubscriptions: { type: SubscriptionType; label: string; description: string; icon: JSX.Element }[] = [
    {
      type: 'usage_updates',
      label: 'Usage Updates',
      description: 'Real-time API usage and quota information',
      icon: <Activity className="h-4 w-4" />,
    },
    {
      type: 'agent_status',
      label: 'Agent Status',
      description: 'KJVA⁸ collective health and performance',
      icon: <Shield className="h-4 w-4" />,
    },
    {
      type: 'quota_warnings',
      label: 'Quota Warnings',
      description: 'Divine guidance on resource stewardship',
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      type: 'license_changes',
      label: 'License Changes',
      description: 'Subscription and tier modifications',
      icon: <Zap className="h-4 w-4" />,
    },
    {
      type: 'activity_feed',
      label: 'Activity Feed',
      description: 'Team member activity (Enterprise only)',
      icon: <Activity className="h-4 w-4" />,
    },
    {
      type: 'layer_routing',
      label: 'Layer Routing',
      description: 'Real-time routing intelligence',
      icon: <Zap className="h-4 w-4" />,
    },
    {
      type: 'alerts',
      label: 'System Alerts',
      description: 'Important system notifications',
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  ];

  const handleSubscriptionToggle = (subscription: SubscriptionType) => {
    const newSubscriptions = selectedSubscriptions.includes(subscription)
      ? selectedSubscriptions.filter(s => s !== subscription)
      : [...selectedSubscriptions, subscription];

    setSelectedSubscriptions(newSubscriptions);
  };

  const applySubscriptions = () => {
    const toSubscribe = selectedSubscriptions.filter(s => !activeSubscriptions.includes(s));
    const toUnsubscribe = activeSubscriptions.filter(s => !selectedSubscriptions.includes(s));

    if (toSubscribe.length > 0) {
      websocketActions.subscribe(toSubscribe);
    }
    if (toUnsubscribe.length > 0) {
      websocketActions.unsubscribe(toUnsubscribe);
    }

    onSubscriptionChange?.(selectedSubscriptions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="h-5 w-5 mr-2 text-pink-500" />
          Subscription Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose which real-time updates you want to receive from the divine network.
        </div>

        <div className="space-y-3">
          {availableSubscriptions.map((sub) => (
            <div key={sub.type} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={sub.type}
                checked={selectedSubscriptions.includes(sub.type)}
                onChange={() => handleSubscriptionToggle(sub.type)}
                disabled={!connectionState.authenticated}
                className="rounded"
              />
              <div className="flex-1">
                <label
                  htmlFor={sub.type}
                  className="flex items-center cursor-pointer"
                >
                  <span className="mr-2">{sub.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{sub.label}</div>
                    <div className="text-xs text-gray-500">{sub.description}</div>
                  </div>
                </label>
              </div>
              {activeSubscriptions.includes(sub.type) && (
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={applySubscriptions}
          disabled={!connectionState.authenticated}
          className="w-full"
        >
          Apply Subscription Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  onConnectionChange,
  onMessage,
  defaultApiKey = '',
  defaultUserId = '',
  autoConnect = true,
}) => {
  const [apiKey, setApiKey] = useState(defaultApiKey);
  const [userId, setUserId] = useState(defaultUserId);
  const [showApiKey, setShowApiKey] = useState(false);
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080/ws');
  const [activeSubscriptions, setActiveSubscriptions] = useState<SubscriptionType[]>(['alerts']);

  const [connectionState, websocketActions] = useWebSocket({
    url: wsUrl,
    apiKey,
    userId,
    autoConnect: autoConnect && !!apiKey,
    subscriptions: activeSubscriptions,
    onMessage: (message) => {
      console.log('📨 WebSocket message received:', message);
      onMessage?.(message);
    },
    onConnect: () => {
      console.log('✅ WebSocket connected');
    },
    onDisconnect: () => {
      console.log('❌ WebSocket disconnected');
    },
    onAuthenticated: (userInfo) => {
      console.log('🔐 WebSocket authenticated:', userInfo);
    },
  });

  // Notify parent of connection changes
  useEffect(() => {
    onConnectionChange?.(connectionState.connected, connectionState.authenticated);
  }, [connectionState.connected, connectionState.authenticated, onConnectionChange]);

  const handleConnect = () => {
    if (!apiKey.trim()) {
      alert('Please provide an API key');
      return;
    }
    websocketActions.connect();
  };

  const handleDisconnect = () => {
    websocketActions.disconnect();
  };

  const handleAuthenticate = () => {
    if (!apiKey.trim()) {
      alert('Please provide an API key');
      return;
    }
    websocketActions.authenticate(apiKey, userId);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Wifi className="h-5 w-5 mr-2 text-blue-500" />
              Connection Status
            </CardTitle>
            <ConnectionStatusIndicator connectionState={connectionState} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <BiblicalConnectionMessage connectionState={connectionState} />

          {connectionState.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold">Connection Error</div>
                <div className="text-sm mt-1">{connectionState.error}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* User Info */}
          {connectionState.authenticated && connectionState.userInfo && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                Divine Authentication Successful
              </div>
              <div className="text-xs space-y-1 text-green-700 dark:text-green-300">
                <div><strong>User ID:</strong> {connectionState.userInfo.userId}</div>
                <div><strong>Role:</strong> {connectionState.userInfo.role}</div>
                <div><strong>Tier:</strong> {connectionState.userInfo.tier}</div>
                <div><strong>Permissions:</strong> {connectionState.userInfo.permissions?.length || 0} granted</div>
              </div>
            </div>
          )}

          {/* Connection Statistics */}
          {connectionState.connected && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Last Ping</div>
                <div className="font-semibold">
                  {connectionState.lastPong
                    ? connectionState.lastPong.toLocaleTimeString()
                    : 'Never'
                  }
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Retry Count</div>
                <div className="font-semibold">{connectionState.retryCount}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-gray-500" />
            Connection Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* WebSocket URL */}
          <div className="space-y-2">
            <Label htmlFor="ws-url">WebSocket URL</Label>
            <Input
              id="ws-url"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              placeholder="ws://localhost:8080/ws"
              disabled={connectionState.connected}
            />
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your divine API key"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* User ID */}
          <div className="space-y-2">
            <Label htmlFor="user-id">User ID (Optional)</Label>
            <Input
              id="user-id"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your user ID"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {!connectionState.connected ? (
              <Button
                onClick={handleConnect}
                disabled={!apiKey.trim() || connectionState.connecting}
                className="flex-1"
              >
                {connectionState.connecting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wifi className="h-4 w-4 mr-2" />
                )}
                Connect
              </Button>
            ) : (
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="flex-1"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            )}

            {connectionState.connected && !connectionState.authenticated && (
              <Button
                onClick={handleAuthenticate}
                disabled={!apiKey.trim()}
                className="flex-1"
              >
                <Shield className="h-4 w-4 mr-2" />
                Authenticate
              </Button>
            )}

            <Button
              onClick={() => websocketActions.ping()}
              disabled={!connectionState.connected}
              variant="outline"
              size="sm"
            >
              Ping
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Management */}
      {connectionState.connected && (
        <SubscriptionManager
          websocketActions={websocketActions}
          connectionState={connectionState}
          activeSubscriptions={activeSubscriptions}
          onSubscriptionChange={setActiveSubscriptions}
        />
      )}

      {/* Debug Actions */}
      {connectionState.authenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => websocketActions.getUsage()}
              >
                Get Usage
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => websocketActions.getAgentStatus()}
              >
                Get Agent Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => websocketActions.sendMessage({
                  type: 'ping',
                  data: { message: 'Hello from divine realm' }
                })}
              >
                Send Test Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConnectionManager;