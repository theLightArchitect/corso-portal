import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// WebSocket message types matching Go backend
export type MessageType =
  | 'auth' | 'subscribe' | 'unsubscribe' | 'ping' | 'get_usage' | 'get_agent_status'
  | 'auth_result' | 'pong' | 'usage_update' | 'agent_status' | 'quota_warning'
  | 'license_change' | 'activity_feed' | 'layer_routing' | 'alert' | 'error';

export type SubscriptionType =
  | 'usage_updates' | 'agent_status' | 'quota_warnings' | 'license_changes'
  | 'activity_feed' | 'layer_routing' | 'alerts';

export interface WebSocketMessage {
  type: MessageType;
  id?: string;
  timestamp: string;
  data?: any;
  error?: string;
  success?: boolean;
}

export interface ConnectionState {
  connected: boolean;
  authenticated: boolean;
  connecting: boolean;
  error: string | null;
  lastPong: Date | null;
  retryCount: number;
  userInfo: {
    userId?: string;
    role?: string;
    tier?: string;
    permissions?: string[];
  } | null;
}

export interface UseWebSocketOptions {
  url?: string;
  apiKey: string;
  userId?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number;
  subscriptions?: SubscriptionType[];
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onAuthenticated?: (userInfo: any) => void;
}

export interface WebSocketActions {
  connect: () => void;
  disconnect: () => void;
  authenticate: (apiKey: string, userId?: string) => void;
  subscribe: (subscriptions: SubscriptionType[]) => void;
  unsubscribe: (subscriptions: SubscriptionType[]) => void;
  sendMessage: (message: Partial<WebSocketMessage>) => void;
  getUsage: () => void;
  getAgentStatus: () => void;
  ping: () => void;
}

const DEFAULT_OPTIONS: Partial<UseWebSocketOptions> = {
  url: 'ws://localhost:8080/ws',
  autoConnect: true,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  pingInterval: 30000,
  subscriptions: ['alerts'],
};

export function useWebSocket(options: UseWebSocketOptions): [ConnectionState, WebSocketActions] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    connected: false,
    authenticated: false,
    connecting: false,
    error: null,
    lastPong: null,
    retryCount: 0,
    userInfo: null,
  });

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<WebSocketMessage[]>([]);
  const pendingSubscriptionsRef = useRef<SubscriptionType[]>(opts.subscriptions || []);

  // Generate unique message IDs
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Send message with automatic queuing when disconnected
  const sendMessage = useCallback((message: Partial<WebSocketMessage>) => {
    const fullMessage: WebSocketMessage = {
      type: message.type!,
      id: message.id || generateMessageId(),
      timestamp: new Date().toISOString(),
      data: message.data,
      ...message,
    };

    if (socketRef.current && connectionState.connected) {
      try {
        socketRef.current.emit('message', fullMessage);
        console.log('🔗 C0RS0 WebSocket sent:', fullMessage.type);
      } catch (error) {
        console.error('❌ Error sending WebSocket message:', error);
        messageQueueRef.current.push(fullMessage);
      }
    } else {
      messageQueueRef.current.push(fullMessage);
      console.log('📋 Queued message for later delivery:', fullMessage.type);
    }
  }, [connectionState.connected, generateMessageId]);

  // Process queued messages
  const processMessageQueue = useCallback(() => {
    if (socketRef.current && connectionState.connected && messageQueueRef.current.length > 0) {
      console.log(`📬 Processing ${messageQueueRef.current.length} queued messages`);
      const queue = [...messageQueueRef.current];
      messageQueueRef.current = [];

      queue.forEach(message => {
        try {
          socketRef.current!.emit('message', message);
        } catch (error) {
          console.error('❌ Error sending queued message:', error);
          messageQueueRef.current.push(message);
        }
      });
    }
  }, [connectionState.connected]);

  // Authentication
  const authenticate = useCallback((apiKey: string, userId?: string) => {
    sendMessage({
      type: 'auth',
      data: { api_key: apiKey, user_id: userId },
    });
  }, [sendMessage]);

  // Subscription management
  const subscribe = useCallback((subscriptions: SubscriptionType[]) => {
    if (connectionState.authenticated) {
      sendMessage({
        type: 'subscribe',
        data: { subscriptions },
      });
    } else {
      pendingSubscriptionsRef.current = [...new Set([...pendingSubscriptionsRef.current, ...subscriptions])];
      console.log('📋 Subscriptions queued until authenticated:', subscriptions);
    }
  }, [connectionState.authenticated, sendMessage]);

  const unsubscribe = useCallback((subscriptions: SubscriptionType[]) => {
    sendMessage({
      type: 'unsubscribe',
      data: { subscriptions },
    });
  }, [sendMessage]);

  // Utility actions
  const getUsage = useCallback(() => {
    sendMessage({ type: 'get_usage' });
  }, [sendMessage]);

  const getAgentStatus = useCallback(() => {
    sendMessage({ type: 'get_agent_status' });
  }, [sendMessage]);

  const ping = useCallback(() => {
    sendMessage({ type: 'ping' });
  }, [sendMessage]);

  // Connection management
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('🔗 Already connected to C0RS0 WebSocket');
      return;
    }

    setConnectionState(prev => ({ ...prev, connecting: true, error: null }));
    console.log('🔗 Connecting to C0RS0 WebSocket:', opts.url);

    try {
      const socket = io(opts.url!, {
        transports: ['websocket'],
        timeout: 10000,
        forceNew: true,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('✅ Connected to C0RS0 WebSocket with divine blessing');
        setConnectionState(prev => ({
          ...prev,
          connected: true,
          connecting: false,
          error: null,
          retryCount: 0,
        }));

        // Clear reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        // Start ping interval
        if (opts.pingInterval && opts.pingInterval > 0) {
          pingIntervalRef.current = setInterval(() => {
            ping();
          }, opts.pingInterval);
        }

        // Authenticate immediately
        authenticate(opts.apiKey, opts.userId);

        // Process queued messages
        processMessageQueue();

        opts.onConnect?.();
      });

      socket.on('disconnect', (reason) => {
        console.log('🔗 Disconnected from C0RS0 WebSocket:', reason);
        setConnectionState(prev => ({
          ...prev,
          connected: false,
          authenticated: false,
          connecting: false,
        }));

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        opts.onDisconnect?.();

        // Auto-reconnect if not manually disconnected
        if (reason !== 'io client disconnect' && connectionState.retryCount < (opts.maxReconnectAttempts || 10)) {
          const delay = Math.min(opts.reconnectInterval! * Math.pow(2, connectionState.retryCount), 30000);
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${connectionState.retryCount + 1})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
            connect();
          }, delay);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('❌ C0RS0 WebSocket connection error:', error);
        setConnectionState(prev => ({
          ...prev,
          connected: false,
          connecting: false,
          error: error.message,
        }));
        opts.onError?.(error);
      });

      socket.on('message', (message: WebSocketMessage) => {
        console.log('📨 C0RS0 WebSocket received:', message.type);

        // Update last pong timestamp for ping messages
        if (message.type === 'pong') {
          setConnectionState(prev => ({ ...prev, lastPong: new Date() }));
        }

        // Handle authentication result
        if (message.type === 'auth_result') {
          const authData = message.data;
          if (authData?.success) {
            console.log('🔐 Authentication successful:', authData);
            setConnectionState(prev => ({
              ...prev,
              authenticated: true,
              userInfo: {
                userId: authData.user_id,
                role: authData.role,
                tier: authData.tier,
                permissions: authData.permissions,
              },
            }));

            // Subscribe to pending subscriptions
            if (pendingSubscriptionsRef.current.length > 0) {
              subscribe(pendingSubscriptionsRef.current);
              pendingSubscriptionsRef.current = [];
            }

            opts.onAuthenticated?.(authData);
          } else {
            console.error('❌ Authentication failed:', authData?.error);
            setConnectionState(prev => ({
              ...prev,
              authenticated: false,
              error: authData?.error || 'Authentication failed',
            }));
          }
        }

        // Handle error messages
        if (message.type === 'error') {
          console.error('❌ Server error:', message.error);
          setConnectionState(prev => ({
            ...prev,
            error: message.error || 'Server error',
          }));
        }

        opts.onMessage?.(message);
      });

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setConnectionState(prev => ({
        ...prev,
        connecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
      opts.onError?.(error instanceof Error ? error : new Error('Connection failed'));
    }
  }, [opts, authenticate, ping, processMessageQueue, connectionState.retryCount]);

  const disconnect = useCallback(() => {
    console.log('🔗 Disconnecting from C0RS0 WebSocket');

    // Clear intervals and timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setConnectionState({
      connected: false,
      authenticated: false,
      connecting: false,
      error: null,
      lastPong: null,
      retryCount: 0,
      userInfo: null,
    });
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (opts.autoConnect && opts.apiKey) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [opts.autoConnect, opts.apiKey]); // Only reconnect if API key changes

  // Subscribe to initial subscriptions when authenticated
  useEffect(() => {
    if (connectionState.authenticated && opts.subscriptions && opts.subscriptions.length > 0) {
      subscribe(opts.subscriptions);
    }
  }, [connectionState.authenticated, subscribe]);

  const actions: WebSocketActions = {
    connect,
    disconnect,
    authenticate,
    subscribe,
    unsubscribe,
    sendMessage,
    getUsage,
    getAgentStatus,
    ping,
  };

  return [connectionState, actions];
}

export default useWebSocket;