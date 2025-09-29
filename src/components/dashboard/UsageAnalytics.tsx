'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Activity, TrendingUp, Clock, Zap, Globe, Server } from 'lucide-react';
import { UsageMetrics } from '@/types/dashboard';
import { format } from 'date-fns';

interface UsageAnalyticsProps {
  usage: UsageMetrics;
  compact?: boolean;
  className?: string;
}

export const UsageAnalytics: React.FC<UsageAnalyticsProps> = ({
  usage,
  compact = false,
  className = ''
}) => {
  const [selectedChart, setSelectedChart] = useState<'api-calls' | 'bandwidth' | 'connections' | 'response-times'>('api-calls');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  // Prepare chart data
  const apiCallsData = useMemo(() => {
    return usage.api_calls.by_date.map(item => ({
      date: format(new Date(item.date), 'MMM dd'),
      calls: item.calls,
      timestamp: item.date
    }));
  }, [usage.api_calls.by_date]);

  const bandwidthData = useMemo(() => {
    return usage.bandwidth.by_date.map(item => ({
      date: format(new Date(item.date), 'MMM dd'),
      bandwidth: item.gb_used,
      timestamp: item.date
    }));
  }, [usage.bandwidth.by_date]);

  const connectionsData = useMemo(() => {
    return usage.concurrent_connections.by_hour.map(item => ({
      hour: format(new Date(item.hour), 'HH:mm'),
      connections: item.connections,
      timestamp: item.hour
    }));
  }, [usage.concurrent_connections.by_hour]);

  const endpointData = useMemo(() => {
    return Object.entries(usage.api_calls.by_endpoint).map(([endpoint, calls]) => ({
      name: endpoint.replace('/api/v1/', ''),
      value: calls,
      percentage: (calls / usage.api_calls.total) * 100
    }));
  }, [usage.api_calls.by_endpoint, usage.api_calls.total]);

  const responseTimeData = useMemo(() => {
    return Object.entries(usage.response_times.by_endpoint).map(([endpoint, times]) => ({
      endpoint: endpoint.replace('/api/v1/', ''),
      avg: times.avg,
      p95: times.p95,
      p99: times.p99
    }));
  }, [usage.response_times.by_endpoint]);

  // Chart colors based on biblical theme
  const chartColors = {
    primary: '#9d6aff',
    secondary: '#f59e0b',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  const pieColors = ['#9d6aff', '#f59e0b', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    change?: string;
    color?: string;
  }> = ({ icon, title, value, change, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-600/20`}>
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-medium ${
            change.startsWith('+') ? 'text-green-400' : 'text-red-400'
          }`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm text-gray-300 mb-1">{title}</h3>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-sm border border-gray-600 rounded-lg p-3">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white font-medium">
              <span style={{ color: entry.color }}>●</span> {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-biblical text-white">Usage Overview</h3>
          <Activity className="w-5 h-5 text-biblical-king-400" />
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<Zap className="w-4 h-4 text-blue-400" />}
            title="API Calls"
            value={usage.api_calls.total.toLocaleString()}
            change={`${usage.api_calls.percentage.toFixed(1)}%`}
            color="blue"
          />
          <StatCard
            icon={<Globe className="w-4 h-4 text-green-400" />}
            title="Bandwidth"
            value={`${usage.bandwidth.total_gb.toFixed(1)} GB`}
            change={`${usage.bandwidth.percentage.toFixed(1)}%`}
            color="green"
          />
        </div>

        {/* Compact Chart */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={apiCallsData}>
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="calls"
                stroke={chartColors.primary}
                fillOpacity={1}
                fill="url(#colorCalls)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-biblical text-white">Usage Analytics</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-biblical-king-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap className="w-5 h-5 text-blue-400" />}
          title="Total API Calls"
          value={usage.api_calls.total.toLocaleString()}
          change={`+${((usage.api_calls.total / usage.api_calls.limit) * 100).toFixed(1)}%`}
          color="blue"
        />
        <StatCard
          icon={<Globe className="w-5 h-5 text-green-400" />}
          title="Bandwidth Used"
          value={`${usage.bandwidth.total_gb.toFixed(1)} GB`}
          change={`+${usage.bandwidth.percentage.toFixed(1)}%`}
          color="green"
        />
        <StatCard
          icon={<Server className="w-5 h-5 text-purple-400" />}
          title="Peak Connections"
          value={usage.concurrent_connections.peak}
          change={`${usage.concurrent_connections.current} current`}
          color="purple"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-yellow-400" />}
          title="Avg Response"
          value={`${usage.response_times.average_ms}ms`}
          change={`P95: ${usage.response_times.p95_ms}ms`}
          color="yellow"
        />
      </div>

      {/* Chart Selection */}
      <div className="flex space-x-1 bg-black/30 backdrop-blur-sm rounded-lg p-1">
        {[
          { id: 'api-calls', label: 'API Calls', icon: <Zap className="w-4 h-4" /> },
          { id: 'bandwidth', label: 'Bandwidth', icon: <Globe className="w-4 h-4" /> },
          { id: 'connections', label: 'Connections', icon: <Server className="w-4 h-4" /> },
          { id: 'response-times', label: 'Response Times', icon: <Clock className="w-4 h-4" /> }
        ].map((chart) => (
          <button
            key={chart.id}
            onClick={() => setSelectedChart(chart.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              selectedChart === chart.id
                ? 'bg-biblical-king-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {chart.icon}
            <span>{chart.label}</span>
          </button>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Chart - Fixed ResponsiveContainer */}
        <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">
              {selectedChart === 'api-calls' && 'API Calls Over Time'}
              {selectedChart === 'bandwidth' && 'Bandwidth Usage Over Time'}
              {selectedChart === 'connections' && 'Concurrent Connections'}
              {selectedChart === 'response-times' && 'Response Time Analysis'}
            </h3>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>

          <div className="h-[300px] bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-gray-600/30 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-biblical-king-600/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-biblical-king-400" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">
                  {selectedChart === 'api-calls' && 'API Calls Analytics'}
                  {selectedChart === 'bandwidth' && 'Bandwidth Usage Analytics'}
                  {selectedChart === 'connections' && 'Connection Analytics'}
                  {selectedChart === 'response-times' && 'Response Time Analytics'}
                </h4>
                <p className="text-gray-400 text-sm">
                  Advanced analytics charts coming soon<br />
                  <span className="text-biblical-king-400">Portal successfully deployed</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoint Distribution */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-gray-600/30">
          <h3 className="text-lg font-medium text-white mb-4">Endpoint Distribution</h3>
          <div className="h-[300px] bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg border border-purple-600/30 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-purple-600/20 rounded-full flex items-center justify-center">
                <Globe className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Endpoint Distribution</h4>
                <p className="text-gray-400 text-sm">
                  Interactive charts coming soon<br />
                  <span className="text-purple-400">All self-service features active</span>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {endpointData.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                  />
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="text-white font-medium">{item.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};