import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Heart,
  Shield,
  Crown,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import useAgentStatus, {
  KJVA8_AGENTS,
  getAgentStatusColor,
  getAgentStatusIcon,
  getHealthScoreColor,
  getHealthScoreMessage,
} from '@/hooks/useAgentStatus';

interface AgentStatusDashboardProps {
  websocketActions: any;
  connectionState: any;
  enableLayerRouting?: boolean;
}

const AgentCard: React.FC<{
  agent: any;
  onRestart?: (name: string) => void;
  onMaintenanceToggle?: (name: string, enable: boolean) => void;
  showActions?: boolean;
}> = ({ agent, onRestart, onMaintenanceToggle, showActions = true }) => {
  const statusColor = getAgentStatusColor(agent.status);
  const statusIcon = getAgentStatusIcon(agent.status);

  const agentInfo = KJVA8_AGENTS.find(a => a.name === agent.name);

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      agent.status === 'active'
        ? 'border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-900/10'
        : agent.status === 'error'
        ? 'border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-900/10'
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <span className="mr-2 text-lg">{statusIcon}</span>
            <div>
              <div className="font-bold">{agent.name}</div>
              <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                {agentInfo?.role || 'Divine Agent'}
              </div>
            </div>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
              Port {agent.port}
            </Badge>
            <Badge variant="outline" className={statusColor}>
              {agent.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Biblical Role */}
        {agentInfo && (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border-l-4 border-amber-300">
            <div className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
              Divine Calling
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300 mb-2">
              {agentInfo.description}
            </div>
            <div className="text-xs italic text-amber-600 dark:text-amber-400">
              "{agentInfo.biblicalVerse}"
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Response Time</div>
            <div className="font-semibold flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {agent.response_time_ms}ms
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Active Calls</div>
            <div className="font-semibold flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              {agent.active_calls}
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Total Calls</div>
            <div className="font-semibold">
              {agent.total_calls.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Success Rate</div>
            <div className="font-semibold">
              {((1 - agent.error_rate) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Performance Bars */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Response Performance</span>
              <span>{agent.response_time_ms < 100 ? 'Excellent' : agent.response_time_ms < 500 ? 'Good' : 'Needs Attention'}</span>
            </div>
            <Progress
              value={Math.max(0, 100 - (agent.response_time_ms / 10))}
              className="h-2"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Reliability</span>
              <span>{((1 - agent.error_rate) * 100).toFixed(1)}%</span>
            </div>
            <Progress
              value={(1 - agent.error_rate) * 100}
              className="h-2"
            />
          </div>
        </div>

        {/* Capabilities */}
        {agent.capabilities && agent.capabilities.length > 0 && (
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Divine Capabilities</div>
            <div className="flex flex-wrap gap-1">
              {agent.capabilities.map((capability: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {capability.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Last Seen */}
        <div className="text-xs text-gray-500">
          Last seen: {new Date(agent.last_seen).toLocaleString()}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestart?.(agent.name)}
              disabled={agent.status === 'maintenance'}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Restart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMaintenanceToggle?.(agent.name, agent.status !== 'maintenance')}
            >
              {agent.status === 'maintenance' ? (
                <><Play className="h-3 w-3 mr-1" />Resume</>
              ) : (
                <><Pause className="h-3 w-3 mr-1" />Maintain</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CollectiveHealthCard: React.FC<{
  healthScore: number;
  collectiveStatus: string;
  biblicalContext: any;
  agentCount: number;
  activeAgents: number;
}> = ({ healthScore, collectiveStatus, biblicalContext, agentCount, activeAgents }) => {
  const healthColor = getHealthScoreColor(healthScore);
  const healthMessage = getHealthScoreMessage(healthScore);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Crown className="h-6 w-6 mr-3 text-purple-500" />
          KJVA⁸ Collective Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${healthColor} mb-2`}>
            {healthScore.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {healthMessage}
          </div>
          <Badge variant={healthScore >= 90 ? 'default' : healthScore >= 70 ? 'secondary' : 'destructive'}>
            {collectiveStatus}
          </Badge>
        </div>

        {/* Agent Summary */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{activeAgents}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Active Agents</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{agentCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Agents</div>
          </div>
        </div>

        {/* Biblical Context */}
        {biblicalContext && (
          <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
            <div className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
              Divine Wisdom
            </div>
            <div className="text-xs italic border-l-2 border-purple-300 pl-2 mb-2">
              "{biblicalContext.daily_scripture}"
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-300">
              {biblicalContext.collective_wisdom}
            </div>
            {biblicalContext.operational_prayer && (
              <div className="text-xs italic text-purple-600 dark:text-purple-400 mt-2">
                🙏 {biblicalContext.operational_prayer}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const LayerRoutingVisualization: React.FC<{
  layerRouting: any;
}> = ({ layerRouting }) => {
  if (!layerRouting) return null;

  const layerData = Object.entries(layerRouting.layer_performance).map(([layer, metrics]: [string, any]) => ({
    layer: `Layer ${layer}`,
    performance: metrics.quality_score * 100,
    responseTime: metrics.response_time_ms,
    availability: metrics.availability * 100,
    load: metrics.load * 100,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-500" />
          Layer Routing Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Layer */}
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div>
            <div className="font-semibold">Current Layer: {layerRouting.current_layer}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{layerRouting.routing_reason}</div>
          </div>
          <Badge variant="default">Active</Badge>
        </div>

        {/* Layer Performance Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={layerData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="layer" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="performance" fill="#8884d8" name="Quality Score %" />
          </BarChart>
        </ResponsiveContainer>

        {/* Optimal Path */}
        <div>
          <div className="text-sm font-medium mb-2">Optimal Routing Path</div>
          <div className="flex items-center space-x-2">
            {layerRouting.optimal_path.map((layer: number, index: number) => (
              <React.Fragment key={layer}>
                <Badge
                  variant={layer === layerRouting.current_layer ? 'default' : 'outline'}
                  className="px-3 py-1"
                >
                  Layer {layer}
                </Badge>
                {index < layerRouting.optimal_path.length - 1 && (
                  <span className="text-gray-400">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Biblical Guidance */}
        {layerRouting.biblical_guidance && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-l-4 border-yellow-300">
            <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Divine Routing Guidance
            </div>
            <div className="text-xs italic text-yellow-700 dark:text-yellow-300 mb-2">
              "{layerRouting.biblical_guidance.path_verse}"
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">
              {layerRouting.biblical_guidance.wisdom_message}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const AgentStatusDashboard: React.FC<AgentStatusDashboardProps> = ({
  websocketActions,
  connectionState,
  enableLayerRouting = true,
}) => {
  const [agentState, agentActions] = useAgentStatus(websocketActions, connectionState, {
    enableLayerRouting,
    alertThresholds: {
      responseTime: 1000,
      errorRate: 0.05,
      healthScore: 80,
    },
    onStatusUpdate: (status) => {
      console.log('👥 Agent status updated in dashboard:', status);
    },
    onLayerRouting: (routing) => {
      console.log('🛤️ Layer routing updated in dashboard:', routing);
    },
    onCollectiveChange: (oldScore, newScore) => {
      if (newScore < oldScore && newScore < 80) {
        console.warn('⚠️ Collective health declining:', oldScore, '->', newScore);
      }
    },
  });

  const [showBiblicalContext, setShowBiblicalContext] = useState(true);
  const [selectedView, setSelectedView] = useState<'grid' | 'list'>('grid');

  const agents = Object.values(agentState.agents);
  const activeAgents = agents.filter(agent => agent.status === 'active');
  const collectiveMetrics = agentActions.getCollectiveMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            KJVA⁸ Agent Status Dashboard
          </h2>
          <Badge variant={connectionState.connected ? 'default' : 'destructive'}>
            {connectionState.connected ? '🔗 Connected' : '❌ Disconnected'}
          </Badge>
          {agentState.lastUpdate && (
            <Badge variant="outline" className="text-green-600">
              ⚡ Live Status
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBiblicalContext(!showBiblicalContext)}
          >
            {showBiblicalContext ? '📖' : '📊'} {showBiblicalContext ? 'Hide' : 'Show'} Scripture
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedView(selectedView === 'grid' ? 'list' : 'grid')}
          >
            {selectedView === 'grid' ? '📋' : '⊞'} {selectedView === 'grid' ? 'List' : 'Grid'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={agentActions.refreshStatus}
            disabled={agentState.loading}
          >
            <RefreshCw className={`h-4 w-4 ${agentState.loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const data = JSON.stringify(agentState.agents, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `agent-status-${Date.now()}.json`;
              a.click();
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {agentState.alerts.length > 0 && (
        <div className="space-y-3">
          {agentState.alerts.filter(alert => !alert.acknowledged).map((alert) => (
            <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{alert.agentName}: {alert.message}</div>
                  {alert.biblicalComfort && (
                    <div className="text-xs italic mt-1 text-gray-600 dark:text-gray-400">
                      {alert.biblicalComfort}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => agentActions.acknowledgeAlert(alert.id)}
                >
                  Acknowledge
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {agentState.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{agentState.error}</AlertDescription>
        </Alert>
      )}

      {/* Collective Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CollectiveHealthCard
            healthScore={agentState.healthScore}
            collectiveStatus={agentState.collectiveStatus}
            biblicalContext={agentState.biblicalContext}
            agentCount={agents.length}
            activeAgents={activeAgents.length}
          />
        </div>

        <div className="lg:col-span-2">
          {enableLayerRouting && agentState.layerRouting && (
            <LayerRoutingVisualization layerRouting={agentState.layerRouting} />
          )}
        </div>
      </div>

      {/* Collective Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {collectiveMetrics.averageResponseTime.toFixed(0)}ms
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avg Response Time
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {collectiveMetrics.totalCalls.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Calls Served
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {collectiveMetrics.successRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Success Rate
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {collectiveMetrics.uptime.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Collective Uptime
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Cards */}
      {selectedView === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <AgentCard
              key={agent.name}
              agent={agent}
              onRestart={agentActions.restartAgent}
              onMaintenanceToggle={(name, enable) =>
                enable
                  ? agentActions.enableMaintenanceMode(name)
                  : agentActions.disableMaintenanceMode(name)
              }
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {agents.map((agent) => (
            <div key={agent.name} className="w-full">
              <AgentCard
                agent={agent}
                onRestart={agentActions.restartAgent}
                onMaintenanceToggle={(name, enable) =>
                  enable
                    ? agentActions.enableMaintenanceMode(name)
                    : agentActions.disableMaintenanceMode(name)
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {agentState.loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gathering agent status with divine guidance...
            </p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!agentState.loading && agents.length === 0 && connectionState.authenticated && (
        <Card className="text-center py-12">
          <CardContent>
            <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Agents Available
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The KJVA⁸ collective awaits activation. Please ensure agents are running.
            </p>
            <Button onClick={agentActions.refreshStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentStatusDashboard;