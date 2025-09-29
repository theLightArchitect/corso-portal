'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Plus, Eye, EyeOff, Copy, Trash2, Edit3, Clock, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { ApiKey } from '@/types/dashboard';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import toast from 'react-hot-toast';

interface ApiKeyManagementProps {
  apiKeys: ApiKey[];
  compact?: boolean;
  className?: string;
}

export const ApiKeyManagement: React.FC<ApiKeyManagementProps> = ({
  apiKeys,
  compact = false,
  className = ''
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    permissions: [] as string[],
    expires_at: ''
  });

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('API key copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getKeyStatus = (apiKey: ApiKey) => {
    if (!apiKey.is_active) return { status: 'inactive', color: 'text-gray-400', icon: <AlertTriangle className="w-4 h-4" /> };
    if (apiKey.expires_at && isPast(new Date(apiKey.expires_at))) return { status: 'expired', color: 'text-red-400', icon: <AlertTriangle className="w-4 h-4" /> };
    return { status: 'active', color: 'text-green-400', icon: <CheckCircle className="w-4 h-4" /> };
  };

  const handleCreateKey = async () => {
    try {
      const response = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('corso_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newKeyData),
      });

      if (!response.ok) throw new Error('Failed to create API key');

      const result = await response.json();
      toast.success('API key created successfully');
      setShowCreateModal(false);
      setNewKeyData({ name: '', permissions: [], expires_at: '' });
      // Refresh the page or update the keys list
      window.location.reload();
    } catch (err) {
      toast.error('Failed to create API key');
      console.error('Create API key error:', err);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('corso_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete API key');

      toast.success('API key deleted successfully');
      // Refresh the page or update the keys list
      window.location.reload();
    } catch (err) {
      toast.error('Failed to delete API key');
      console.error('Delete API key error:', err);
    }
  };

  const availablePermissions = [
    'read:usage',
    'read:billing',
    'write:api',
    'admin:all',
    'read:logs',
    'write:webhooks'
  ];

  if (compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-biblical text-white">API Keys</h3>
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-biblical-wisdom-400" />
            <span className="text-sm text-gray-300">{apiKeys.length} active</span>
          </div>
        </div>

        <div className="space-y-3">
          {apiKeys.map((apiKey) => {
            const status = getKeyStatus(apiKey);
            return (
              <motion.div
                key={apiKey.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-white">{apiKey.name}</h4>
                      <div className={`flex items-center space-x-1 ${status.color}`}>
                        {status.icon}
                        <span className="text-xs capitalize">{status.status}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {apiKey.key_preview}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      {visibleKeys.has(apiKey.id) ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key_preview)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full py-2 px-4 bg-biblical-wisdom-600 hover:bg-biblical-wisdom-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New API Key</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-biblical text-white">API Key Management</h2>
          <p className="text-gray-400 mt-1">Manage your API keys and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-biblical-wisdom-600 hover:bg-biblical-wisdom-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Key</span>
        </button>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => {
          const status = getKeyStatus(apiKey);
          const isVisible = visibleKeys.has(apiKey.id);

          return (
            <motion.div
              key={apiKey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30 overflow-hidden"
            >
              {/* Key Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Key className="w-5 h-5 text-biblical-wisdom-400" />
                      <h3 className="text-lg font-medium text-white">{apiKey.name}</h3>
                      <div className={`flex items-center space-x-1 ${status.color}`}>
                        {status.icon}
                        <span className="text-sm capitalize">{status.status}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Created:</span>
                        <p className="text-white">{format(new Date(apiKey.created_at), 'MMM dd, yyyy')}</p>
                      </div>
                      {apiKey.last_used_at && (
                        <div>
                          <span className="text-gray-400">Last Used:</span>
                          <p className="text-white">
                            {formatDistanceToNow(new Date(apiKey.last_used_at), { addSuffix: true })}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400">Usage Count:</span>
                        <p className="text-white">{apiKey.usage_count.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                      title={isVisible ? 'Hide key' : 'Show key'}
                    >
                      {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key_preview)}
                      className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedKey(apiKey)}
                      className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                      title="Edit key"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-900/20"
                      title="Delete key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* API Key Display */}
                <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <code className="text-green-400 font-mono text-sm">
                      {isVisible ? `corso_${apiKey.id}_full_key_would_be_here` : apiKey.key_preview}
                    </code>
                    {isVisible && (
                      <span className="text-xs text-yellow-400 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Keep this secret</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Permissions */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {apiKey.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 bg-biblical-wisdom-600/20 text-biblical-wisdom-300 text-xs rounded-md border border-biblical-wisdom-600/30"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expiry */}
                {apiKey.expires_at && (
                  <div className="mt-4 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      Expires: {format(new Date(apiKey.expires_at), 'MMM dd, yyyy')}
                    </span>
                    {isPast(new Date(apiKey.expires_at)) && (
                      <span className="text-xs text-red-400">(Expired)</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {apiKeys.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30"
          >
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No API Keys</h3>
            <p className="text-gray-400 mb-4">Create your first API key to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-biblical-wisdom-600 hover:bg-biblical-wisdom-700 text-white rounded-lg font-medium transition-colors"
            >
              Create API Key
            </button>
          </motion.div>
        )}
      </div>

      {/* Create Key Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 rounded-lg border border-gray-600 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-biblical text-white mb-4">Create New API Key</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newKeyData.name}
                    onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-biblical-wisdom-500 focus:border-transparent"
                    placeholder="e.g., Production API"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
                    {availablePermissions.map((permission) => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newKeyData.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewKeyData({
                                ...newKeyData,
                                permissions: [...newKeyData.permissions, permission]
                              });
                            } else {
                              setNewKeyData({
                                ...newKeyData,
                                permissions: newKeyData.permissions.filter(p => p !== permission)
                              });
                            }
                          }}
                          className="rounded border-gray-600 bg-black/30 text-biblical-wisdom-600 focus:ring-biblical-wisdom-500"
                        />
                        <span className="text-sm text-gray-300">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newKeyData.expires_at}
                    onChange={(e) => setNewKeyData({ ...newKeyData, expires_at: e.target.value })}
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-biblical-wisdom-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={!newKeyData.name || newKeyData.permissions.length === 0}
                  className="flex-1 py-2 px-4 bg-biblical-wisdom-600 hover:bg-biblical-wisdom-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Create Key
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};