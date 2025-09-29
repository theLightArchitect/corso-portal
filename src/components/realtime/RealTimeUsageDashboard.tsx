import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Zap,
  TrendingUp,
  Clock,
  BarChart3,
  Download,
  RefreshCw,
  AlertTriangle,
  Crown,
  Shield,
  Heart,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import useRealTimeUsage, {
  UsageUpdateMessage,
  QuotaWarningMessage,
  getUsageStatusColor,
  getUsageStatusMessage,
  formatUsageWithBiblicalContext,
} from '@/hooks/useRealTimeUsage';

interface RealTimeUsageDashboardProps {
  websocketActions: any;
  connectionState: any;
  userId?: string;
  tier: string;
}

const BiblicalProgress: React.FC<{
  value: number;
  max: number;
  label: string;
  verse?: string;
  className?: string;
}> = ({ value, max, label, verse, className = '' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const statusColor = getUsageStatusColor(percentage);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className={`text-sm font-bold ${statusColor}`}>
          {value.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-2"
      />
      <div className="flex justify-between items-center text-xs">
        <span className={statusColor}>
          {percentage.toFixed(1)}% used
        </span>
        {verse && (
          <span className="italic text-gray-500 dark:text-gray-400 text-right max-w-xs truncate">
            {verse}
          </span>
        )}
      </div>
    </div>
  );
};

const BiblicalAlert: React.FC<{
  warning: QuotaWarningMessage;
  onDismiss: () => void;
}> = ({ warning, onDismiss }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'exceeded': return <Shield className="h-5 w-5 text-red-600" />;
      case 'approaching': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Heart className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Alert className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
      <div className="flex items-start space-x-3">
        {getAlertIcon(warning.warning_type)}
        <div className="flex-1 space-y-2">
          <AlertDescription className="text-sm">
            <div className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              Stewardship Guidance
            </div>
            <div className="mb-2">
              {warning.biblical_guidance.wisdom_message}
            </div>
            <div className="text-xs italic border-l-2 border-yellow-300 pl-2 py-1 bg-yellow-100/50 dark:bg-yellow-800/30">
              "{warning.biblical_guidance.verse}"
            </div>
            <div className="mt-2 text-xs">
              <strong>Current Usage:</strong> {warning.current_usage.toLocaleString()} / {warning.limit.toLocaleString()} ({warning.percentage_used.toFixed(1)}%)
            </div>
            <div className="text-xs">
              <strong>Recommended Action:</strong> {warning.recommended_action}
            </div>
            {warning.biblical_guidance.prayer && (
              <div className="mt-2 text-xs italic text-gray-600 dark:text-gray-400">
                🙏 {warning.biblical_guidance.prayer}
              </div>
            )}
          </AlertDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onDismiss}
          className="shrink-0"
        >
          Acknowledge
        </Button>
      </div>
    </Alert>
  );
};

const AgentBreakdownChart: React.FC<{
  agentBreakdown: Record<string, number>;
  biblical?: boolean;
}> = ({ agentBreakdown, biblical = true }) => {
  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300',
    '#00C49F', '#FFBB28', '#FF8042', '#0088FE'
  ];

  const data = Object.entries(agentBreakdown).map(([agent, calls], index) => ({
    name: agent,
    calls,
    fill: COLORS[index % COLORS.length],
  }));

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.payload.name}</p>
          <p className="text-sm">
            <span className="text-blue-600">Calls:</span> {data.value.toLocaleString()}
          </p>
          {biblical && (
            <p className="text-xs italic text-gray-500 mt-1">
              "Each agent serves according to divine purpose"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="calls"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={customTooltip} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const UsageTimelineChart: React.FC<{
  recentCalls: any[];
  className?: string;
}> = ({ recentCalls, className = '' }) => {
  // Process recent calls into hourly data
  const hourlyData = recentCalls.reduce((acc, call) => {
    const hour = new Date(call.timestamp).getHours();
    const existing = acc.find(item => item.hour === hour);
    if (existing) {
      existing.calls += 1;
      if (call.success) existing.successful += 1;
    } else {
      acc.push({
        hour,
        calls: 1,
        successful: call.success ? 1 : 0,
        time: `${hour.toString().padStart(2, '0')}:00`,
      });
    }
    return acc;
  }, [] as Array<{ hour: number; calls: number; successful: number; time: string }>);

  // Fill missing hours with 0
  const completeData = Array.from({ length: 24 }, (_, hour) => {
    const existing = hourlyData.find(item => item.hour === hour);
    return existing || {
      hour,
      calls: 0,
      successful: 0,
      time: `${hour.toString().padStart(2, '0')}:00`,
    };
  }).sort((a, b) => a.hour - b.hour);

  return (
    <ResponsiveContainer width="100%" height={200} className={className}>
      <AreaChart data={completeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number, name: string) => [
            value,
            name === 'calls' ? 'Total Calls' : 'Successful Calls'
          ]}
          labelStyle={{ color: '#666' }}
        />
        <Area
          type="monotone"
          dataKey="calls"
          stackId="1"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="successful"
          stackId="2"
          stroke="#82ca9d"
          fill="#82ca9d"
          fillOpacity={0.8}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const RealTimeUsageDashboard: React.FC<RealTimeUsageDashboardProps> = ({
  websocketActions,
  connectionState,
  userId,
  tier,
}) => {
  const [usageState, usageActions] = useRealTimeUsage(websocketActions, connectionState, {
    userId,
    enableAnalytics: true,
    onUsageUpdate: (usage) => {
      console.log('📊 Usage updated in dashboard:', usage);
    },
    onQuotaWarning: (warning) => {
      console.log('⚠️ Quota warning in dashboard:', warning);
    },
  });

  const [showBiblicalContext, setShowBiblicalContext] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  const getTierIcon = (tier: string) => {
    const icons: Record<string, JSX.Element> = {
      'sovereign': <Crown className="h-4 w-4 text-yellow-500" />,
      'enterprise': <Shield className="h-4 w-4 text-blue-500" />,
      'professional': <BarChart3 className="h-4 w-4 text-green-500" />,
      'developer': <Zap className="h-4 w-4 text-purple-500" />,
      'explorer': <Heart className="h-4 w-4 text-pink-500" />,
    };
    return icons[tier] || <Activity className="h-4 w-4 text-gray-500" />;
  };

  const filteredCalls = selectedTimeRange === '24h'
    ? usageActions.getUsageByTimeRange(24)
    : selectedTimeRange === '7d'
    ? usageActions.getUsageByTimeRange(24 * 7)
    : usageActions.getUsageByTimeRange(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getTierIcon(tier)}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Real-Time Usage Dashboard
            </h2>
          </div>
          <Badge variant={connectionState.connected ? 'default' : 'destructive'}>
            {connectionState.connected ? '🔗 Connected' : '❌ Disconnected'}
          </Badge>
          {usageState.isRealTime && (
            <Badge variant="outline" className="text-green-600">
              ⚡ Live Updates
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
            onClick={usageActions.refreshUsage}
            disabled={usageState.loading}
          >
            <RefreshCw className={`h-4 w-4 ${usageState.loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const data = usageActions.exportUsageData('json');
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `usage-${Date.now()}.json`;
              a.click();
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quota Warnings */}
      {usageState.quotaWarnings.length > 0 && (
        <div className="space-y-3">
          {usageState.quotaWarnings.map((warning, index) => (
            <BiblicalAlert
              key={index}
              warning={warning}
              onDismiss={() => usageActions.dismissWarning(warning.user_id)}
            />
          ))}
        </div>
      )}

      {usageState.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{usageState.error}</AlertDescription>
        </Alert>
      )}

      {/* Usage Overview Cards */}
      {usageState.usage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <Activity className="h-4 w-4 mr-2 text-blue-500" />
                Monthly Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BiblicalProgress
                value={usageState.usage.monthly_usage}
                max={usageState.usage.monthly_limit}
                label="API Calls This Month"
                verse={showBiblicalContext ? usageState.usage.biblical_theme.verse : undefined}
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <Clock className="h-4 w-4 mr-2 text-green-500" />
                Daily Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BiblicalProgress
                value={usageState.usage.daily_usage}
                max={usageState.usage.daily_limit}
                label="API Calls Today"
                verse={showBiblicalContext ? "This is the day the Lord has made" : undefined}
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usageState.analytics && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Trend:</span>
                    <Badge variant={usageState.analytics.trend === 'increasing' ? 'destructive' : 'default'}>
                      {usageState.analytics.trend}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Efficiency:</span>
                    <span className="text-sm font-semibold">
                      {usageState.analytics.efficiency.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Peak Hour:</span>
                    <span className="text-sm font-semibold">
                      {usageState.analytics.peakHours[0]}:00
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-sm font-medium">
                <BarChart3 className="h-4 w-4 mr-2 text-yellow-500" />
                Last Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {new Date(usageState.usage.last_call_time).toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(usageState.usage.last_call_time).toLocaleDateString()}
                </div>
                {usageState.analytics && (
                  <div className="text-xs">
                    Most Used: <span className="font-semibold">{usageState.analytics.mostUsedAgent}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Biblical Context */}
      {showBiblicalContext && usageState.usage?.biblical_theme && (
        <Card className="border-l-4 border-l-gold bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Heart className="h-5 w-5 mr-2 text-amber-500" />
              Divine Stewardship Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm italic border-l-2 border-amber-300 pl-3 py-2 bg-amber-100/50 dark:bg-amber-800/30">
                "{usageState.usage.biblical_theme.verse}"
              </div>
              <p className="text-sm">{usageState.usage.biblical_theme.message}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Stewardship:</strong> {usageState.usage.biblical_theme.stewardship}
              </p>
              {usageState.usage.biblical_theme.blessing && (
                <p className="text-xs text-green-700 dark:text-green-300">
                  <strong>Blessing:</strong> {usageState.usage.biblical_theme.blessing}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      {usageState.usage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-500" />
                KJVA⁸ Agent Usage Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AgentBreakdownChart
                agentBreakdown={usageState.usage.agent_breakdown}
                biblical={showBiblicalContext}
              />
            </CardContent>
          </Card>

          {/* Usage Timeline */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-500" />
                  Usage Timeline
                </CardTitle>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <UsageTimelineChart recentCalls={filteredCalls} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {usageState.loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gathering usage data with divine blessing...
            </p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!usageState.loading && !usageState.usage && connectionState.authenticated && (
        <Card className="text-center py-12">
          <CardContent>
            <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Usage Data Available
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your journey with the KJVA⁸ collective begins with your first API call.
            </p>
            <Button onClick={usageActions.refreshUsage}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeUsageDashboard;