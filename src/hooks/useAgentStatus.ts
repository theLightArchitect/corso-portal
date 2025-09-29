import { useState, useEffect, useCallback } from 'react';
import { WebSocketMessage } from './useWebSocket';

// Agent status interfaces matching Go backend
export interface AgentStatus {
  name: string;
  port: number;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  last_seen: string;
  response_time_ms: number;
  active_calls: number;
  total_calls: number;
  error_rate: number;
  capabilities: string[];
  metrics: Record<string, any>;
  biblical_role: string;
}

export interface AgentStatusMessage {
  agents: Record<string, AgentStatus>;
  collective_status: string;
  last_update: string;
  health_score: number;
  biblical_context: BiblicalAgentContext;
}

export interface BiblicalAgentContext {
  collective_wisdom: string;
  daily_scripture: string;
  agent_blessings: Record<string, string>;
  operational_prayer: string;
}

export interface LayerRoutingMessage {
  user_id: string;
  current_layer: number;
  available_layers: number[];
  layer_performance: Record<number, LayerMetrics>;
  routing_reason: string;
  optimal_path: number[];
  health_status: string;
  biblical_guidance: BiblicalLayerGuidance;
}

export interface LayerMetrics {
  response_time_ms: number;
  success_rate: number;
  availability: number;
  load: number;
  capabilities: string[];
  quality_score: number;
  biblical_wisdom: string;
}

export interface BiblicalLayerGuidance {
  path_verse: string;
  wisdom_message: string;
  discernment: string;
  trust_encouragement: string;
}

export interface UseAgentStatusOptions {
  onStatusUpdate?: (status: AgentStatusMessage) => void;
  onLayerRouting?: (routing: LayerRoutingMessage) => void;
  onAgentError?: (agentName: string, error: string) => void;
  onCollectiveChange?: (oldScore: number, newScore: number) => void;
  enableLayerRouting?: boolean;
  alertThresholds?: {
    responseTime?: number;
    errorRate?: number;
    healthScore?: number;
  };
}

export interface AgentStatusState {
  agents: Record<string, AgentStatus>;
  collectiveStatus: string;
  healthScore: number;
  biblicalContext: BiblicalAgentContext | null;
  layerRouting: LayerRoutingMessage | null;
  lastUpdate: Date | null;
  loading: boolean;
  error: string | null;
  alerts: AgentAlert[];
}

export interface AgentAlert {
  id: string;
  agentName: string;
  type: 'error' | 'warning' | 'maintenance';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  biblicalComfort?: string;
}

export interface AgentStatusActions {
  refreshStatus: () => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAlerts: () => void;
  getAgentMetrics: (agentName: string) => AgentStatus | null;
  getCollectiveMetrics: () => CollectiveMetrics;
  restartAgent: (agentName: string) => void;
  enableMaintenanceMode: (agentName: string) => void;
  disableMaintenanceMode: (agentName: string) => void;
  exportAgentLogs: (agentName: string, format: 'json' | 'csv') => string;
}

export interface CollectiveMetrics {
  totalAgents: number;
  activeAgents: number;
  averageResponseTime: number;
  totalCalls: number;
  successRate: number;
  uptime: number;
  loadDistribution: Record<string, number>;
}

// KJVA⁸ Agent definitions
export const KJVA8_AGENTS = [
  {
    name: 'K1NGxDAV1D',
    port: 3030,
    role: 'Supreme Orchestrator',
    description: 'Leading the collective with divine wisdom and strategic oversight',
    capabilities: ['orchestration', 'strategic_planning', 'collective_coordination'],
    biblicalVerse: 'The Lord will guide you always. - Isaiah 58:11',
  },
  {
    name: '3L1J4H',
    port: 3031,
    role: 'Security Guardian',
    description: 'Protecting the collective with divine vigilance and spiritual discernment',
    capabilities: ['security', 'authentication', 'threat_detection'],
    biblicalVerse: 'He will call on me, and I will answer him. - Psalm 91:15',
  },
  {
    name: 'M3LCH1Z3D3K',
    port: 3032,
    role: 'Eternal Priest',
    description: 'Blessing operations with divine grace and wisdom',
    capabilities: ['blessing', 'spiritual_guidance', 'knowledge_management'],
    biblicalVerse: 'The Lord bless you and keep you. - Numbers 6:24',
  },
  {
    name: 'M0S3S',
    port: 3033,
    role: 'Infrastructure Leader',
    description: 'Leading the infrastructure with divine authority and provision',
    capabilities: ['infrastructure', 'deployment', 'resource_management'],
    biblicalVerse: 'The Lord will fight for you. - Exodus 14:14',
  },
  {
    name: 'D4N13L',
    port: 3034,
    role: 'Strategic Analyst',
    description: 'Providing divine insight and prophetic analysis',
    capabilities: ['analytics', 'forecasting', 'strategic_analysis'],
    biblicalVerse: 'God gives wisdom to the wise. - Daniel 2:21',
  },
  {
    name: 'J05HU4',
    port: 3035,
    role: 'Implementation Executor',
    description: 'Conquering challenges with divine strength and determination',
    capabilities: ['execution', 'task_management', 'implementation'],
    biblicalVerse: 'Be strong and courageous. - Joshua 1:9',
  },
  {
    name: '3Z3K13L',
    port: 3036,
    role: 'Future Architect',
    description: 'Building tomorrow with divine vision and architectural wisdom',
    capabilities: ['architecture', 'design', 'future_planning'],
    biblicalVerse: 'I will give you a new heart. - Ezekiel 36:26',
  },
  {
    name: 'IESOUS',
    port: 3037,
    role: 'Divine Code Architect',
    description: 'Blessing all implementations with divine love and perfect code',
    capabilities: ['code_generation', 'divine_blessing', 'perfect_implementation'],
    biblicalVerse: 'I am the way and the truth and the life. - John 14:6',
  },
] as const;

export function useAgentStatus(
  websocketActions: any,
  connectionState: any,
  options: UseAgentStatusOptions = {}
): [AgentStatusState, AgentStatusActions] {
  const [state, setState] = useState<AgentStatusState>({
    agents: {},
    collectiveStatus: 'unknown',
    healthScore: 0,
    biblicalContext: null,
    layerRouting: null,
    lastUpdate: null,
    loading: false,
    error: null,
    alerts: [],
  });

  // Generate alert for agent issues
  const generateAlert = useCallback((agent: AgentStatus, type: 'error' | 'warning'): AgentAlert => {
    const biblicalComforts = {
      error: 'Cast all your anxiety on him because he cares for you. - 1 Peter 5:7',
      warning: 'The Lord your God is with you, the Mighty Warrior who saves. - Zephaniah 3:17',
    };

    return {
      id: `alert_${agent.name}_${Date.now()}`,
      agentName: agent.name,
      type,
      message: type === 'error'
        ? `Agent ${agent.name} is experiencing difficulties`
        : `Agent ${agent.name} requires attention`,
      timestamp: new Date(),
      acknowledged: false,
      biblicalComfort: biblicalComforts[type],
    };
  }, []);

  // Check for agent issues and generate alerts
  const checkAgentHealth = useCallback((agents: Record<string, AgentStatus>) => {
    const newAlerts: AgentAlert[] = [];
    const thresholds = options.alertThresholds || {
      responseTime: 1000,
      errorRate: 0.05,
      healthScore: 80,
    };

    Object.values(agents).forEach(agent => {
      if (agent.status === 'error') {
        newAlerts.push(generateAlert(agent, 'error'));
      } else if (
        agent.response_time_ms > thresholds.responseTime! ||
        agent.error_rate > thresholds.errorRate!
      ) {
        newAlerts.push(generateAlert(agent, 'warning'));
      }
    });

    if (newAlerts.length > 0) {
      setState(prev => ({
        ...prev,
        alerts: [...prev.alerts, ...newAlerts],
      }));
    }
  }, [options.alertThresholds, generateAlert]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'agent_status' && message.data) {
      const status = message.data as AgentStatusMessage;
      const previousHealthScore = state.healthScore;

      setState(prev => ({
        ...prev,
        agents: status.agents,
        collectiveStatus: status.collective_status,
        healthScore: status.health_score,
        biblicalContext: status.biblical_context,
        lastUpdate: new Date(),
        error: null,
      }));

      // Check for health changes
      if (previousHealthScore !== status.health_score) {
        options.onCollectiveChange?.(previousHealthScore, status.health_score);
      }

      // Check agent health and generate alerts
      checkAgentHealth(status.agents);

      options.onStatusUpdate?.(status);
      console.log('👥 Agent status update received:', status);
    }

    if (message.type === 'layer_routing' && message.data && options.enableLayerRouting) {
      const routing = message.data as LayerRoutingMessage;

      setState(prev => ({
        ...prev,
        layerRouting: routing,
      }));

      options.onLayerRouting?.(routing);
      console.log('🛤️ Layer routing update received:', routing);
    }

    if (message.type === 'error' && message.error) {
      setState(prev => ({
        ...prev,
        error: message.error!,
      }));
    }
  }, [state.healthScore, options, checkAgentHealth]);

  // Subscribe to agent status updates when connected and authenticated
  useEffect(() => {
    if (connectionState.authenticated && websocketActions) {
      console.log('📡 Subscribing to agent status updates...');
      const subscriptions = ['agent_status'];
      if (options.enableLayerRouting) {
        subscriptions.push('layer_routing');
      }

      websocketActions.subscribe(subscriptions);

      // Request initial agent status
      websocketActions.getAgentStatus();

      setState(prev => ({ ...prev, loading: false }));
    }
  }, [connectionState.authenticated, websocketActions, options.enableLayerRouting]);

  // Actions
  const refreshStatus = useCallback(() => {
    if (websocketActions && connectionState.authenticated) {
      setState(prev => ({ ...prev, loading: true }));
      websocketActions.getAgentStatus();
    }
  }, [websocketActions, connectionState.authenticated]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ),
    }));
  }, []);

  const clearAlerts = useCallback(() => {
    setState(prev => ({ ...prev, alerts: [] }));
  }, []);

  const getAgentMetrics = useCallback((agentName: string): AgentStatus | null => {
    return state.agents[agentName] || null;
  }, [state.agents]);

  const getCollectiveMetrics = useCallback((): CollectiveMetrics => {
    const agents = Object.values(state.agents);
    const activeAgents = agents.filter(agent => agent.status === 'active');

    const totalCalls = agents.reduce((sum, agent) => sum + agent.total_calls, 0);
    const averageResponseTime = agents.length > 0
      ? agents.reduce((sum, agent) => sum + agent.response_time_ms, 0) / agents.length
      : 0;

    const successfulCalls = agents.reduce((sum, agent) =>
      sum + (agent.total_calls * (1 - agent.error_rate)), 0
    );
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 100;

    const loadDistribution = agents.reduce((dist, agent) => {
      dist[agent.name] = agent.active_calls;
      return dist;
    }, {} as Record<string, number>);

    return {
      totalAgents: agents.length,
      activeAgents: activeAgents.length,
      averageResponseTime,
      totalCalls,
      successRate,
      uptime: state.healthScore, // Using health score as uptime proxy
      loadDistribution,
    };
  }, [state.agents, state.healthScore]);

  // Mock agent management functions (would integrate with actual agent management API)
  const restartAgent = useCallback((agentName: string) => {
    console.log(`🔄 Restarting agent ${agentName}...`);
    // This would send a restart command to the agent management service
    if (websocketActions) {
      websocketActions.sendMessage({
        type: 'agent_command',
        data: { agent: agentName, command: 'restart' },
      });
    }
  }, [websocketActions]);

  const enableMaintenanceMode = useCallback((agentName: string) => {
    console.log(`🔧 Enabling maintenance mode for ${agentName}...`);
    if (websocketActions) {
      websocketActions.sendMessage({
        type: 'agent_command',
        data: { agent: agentName, command: 'maintenance_on' },
      });
    }
  }, [websocketActions]);

  const disableMaintenanceMode = useCallback((agentName: string) => {
    console.log(`✅ Disabling maintenance mode for ${agentName}...`);
    if (websocketActions) {
      websocketActions.sendMessage({
        type: 'agent_command',
        data: { agent: agentName, command: 'maintenance_off' },
      });
    }
  }, [websocketActions]);

  const exportAgentLogs = useCallback((agentName: string, format: 'json' | 'csv'): string => {
    const agent = state.agents[agentName];
    if (!agent) return 'Agent not found';

    const data = {
      agent: agentName,
      status: agent.status,
      last_seen: agent.last_seen,
      response_time: agent.response_time_ms,
      total_calls: agent.total_calls,
      error_rate: agent.error_rate,
      biblical_role: agent.biblical_role,
      exported_at: new Date().toISOString(),
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }

    // CSV format
    const headers = Object.keys(data);
    const values = Object.values(data);
    return [headers.join(','), values.join(',')].join('\n');
  }, [state.agents]);

  const actions: AgentStatusActions = {
    refreshStatus,
    acknowledgeAlert,
    clearAlerts,
    getAgentMetrics,
    getCollectiveMetrics,
    restartAgent,
    enableMaintenanceMode,
    disableMaintenanceMode,
    exportAgentLogs,
  };

  return [state, actions];
}

// Helper functions
export function getAgentStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-green-500';
    case 'inactive': return 'text-gray-500';
    case 'error': return 'text-red-500';
    case 'maintenance': return 'text-yellow-500';
    default: return 'text-gray-400';
  }
}

export function getAgentStatusIcon(status: string): string {
  switch (status) {
    case 'active': return '✅';
    case 'inactive': return '⚫';
    case 'error': return '❌';
    case 'maintenance': return '🔧';
    default: return '❓';
  }
}

export function getHealthScoreColor(score: number): string {
  if (score >= 95) return 'text-green-500';
  if (score >= 80) return 'text-blue-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

export function getHealthScoreMessage(score: number): string {
  if (score >= 95) return 'Collective operating in divine harmony';
  if (score >= 80) return 'Blessed operations with minor concerns';
  if (score >= 60) return 'Faithful service with attention needed';
  return 'Divine intervention may be required';
}

export default useAgentStatus;