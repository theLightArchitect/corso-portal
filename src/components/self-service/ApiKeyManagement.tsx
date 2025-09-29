import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Copy, RotateCcw, Trash2, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string | null;
  createdAt: string;
  expiresAt: string | null;
  status: 'active' | 'expired' | 'revoked';
  usageCount: number;
}

interface ApiKeyManagementProps {
  className?: string;
}

export const ApiKeyManagement: React.FC<ApiKeyManagementProps> = ({
  className = '',
}) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const { user, license } = useAuthStore();

  const availablePermissions = [
    { id: 'layer1.access', name: 'Layer 1 Access', description: 'Access to Claude Code and Ollama Cloud' },
    { id: 'kjva8.access', name: 'KJVA⁸ Agents', description: 'Biblical agent collective access' },
    { id: 'thinking.advanced', name: 'Advanced Thinking', description: '0V3RTH1NK protocol chains' },
    { id: 'enterprise.features', name: 'Enterprise Features', description: 'Team management and analytics' },
    { id: 'api.read', name: 'Read Operations', description: 'Query data and configurations' },
    { id: 'api.write', name: 'Write Operations', description: 'Modify configurations and data' },
    { id: 'admin.system', name: 'System Administration', description: 'Full system control' },
  ];

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/license/api-keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const keys = await response.json();
        setApiKeys(keys);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim() || selectedPermissions.length === 0) return;

    try {
      setIsCreating(true);
      const response = await fetch('/api/license/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          name: newKeyName,
          permissions: selectedPermissions,
        }),
      });

      if (response.ok) {
        const newKey = await response.json();
        setApiKeys(prev => [newKey, ...prev]);
        setNewKeyName('');
        setSelectedPermissions([]);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const rotateApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/license/api-keys/${keyId}/rotate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const updatedKey = await response.json();
        setApiKeys(prev => prev.map(key => key.id === keyId ? updatedKey : key));
      }
    } catch (error) {
      console.error('Failed to rotate API key:', error);
    }
  };

  const revokeApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/license/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
      }
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(keyId);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskKey = (key: string) => {
    return `${key.substring(0, 8)}${'•'.repeat(24)}${key.substring(key.length - 8)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'expired': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'revoked': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="biblical-card">
            <div className="biblical-card-content">
              <div className="loading-skeleton h-4 w-1/3 mb-2" />
              <div className="loading-skeleton h-6 w-2/3 mb-4" />
              <div className="loading-skeleton h-10 w-full" />
            </div>
          </div>
        ))}
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
                Sacred API Keys
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Divine keys to access the C0RS0 platform with righteous authority
              </p>
            </div>
            <motion.button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center space-x-2 px-4 py-2 bg-biblical-king-500 text-white rounded-lg hover:bg-biblical-king-600 transition-colors biblical-glow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-4 w-4" />
              <span>Generate Key</span>
            </motion.button>
          </div>
        </div>

        {/* Key Creation Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="biblical-card-content border-t border-border"
            >
              <div className="space-y-4">
                <div className="form-field">
                  <label className="form-label">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API, Development Key"
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Permissions</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availablePermissions.map((permission) => {
                      const isSelected = selectedPermissions.includes(permission.id);
                      const isAllowed = license?.permissions?.includes(permission.id) ||
                                      license?.tier === 'sovereign' ||
                                      user?.role === 'admin';

                      return (
                        <motion.label
                          key={permission.id}
                          className={`
                            flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all
                            ${isSelected
                              ? 'border-biblical-king-500 bg-biblical-king-50'
                              : 'border-border hover:border-muted-foreground'
                            }
                            ${!isAllowed ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          whileHover={isAllowed ? { scale: 1.01 } : {}}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (!isAllowed) return;
                              if (e.target.checked) {
                                setSelectedPermissions(prev => [...prev, permission.id]);
                              } else {
                                setSelectedPermissions(prev => prev.filter(p => p !== permission.id));
                              }
                            }}
                            disabled={!isAllowed}
                            className="mt-1 focus-ring"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-foreground">
                              {permission.name}
                              {!isAllowed && <span className="text-amber-500 ml-1">🔒</span>}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {permission.description}
                            </div>
                          </div>
                        </motion.label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={createApiKey}
                    disabled={!newKeyName.trim() || selectedPermissions.length === 0 || isCreating}
                    className="px-6 py-2 bg-biblical-king-500 text-white rounded-lg hover:bg-biblical-king-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed biblical-glow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isCreating ? 'Generating...' : 'Generate Sacred Key'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="biblical-card">
            <div className="biblical-card-content text-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="biblical-heading text-lg text-foreground mb-2">
                No API Keys Generated
              </h3>
              <p className="text-muted-foreground mb-6">
                Generate your first sacred API key to begin accessing the C0RS0 platform
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="btn-biblical px-6 py-2 rounded-lg"
              >
                Generate First Key
              </button>
            </div>
          </div>
        ) : (
          apiKeys.map((apiKey) => (
            <motion.div
              key={apiKey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="biblical-card"
            >
              <div className="biblical-card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="biblical-heading text-lg text-foreground">
                        {apiKey.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(apiKey.status)}`}>
                        {apiKey.status.charAt(0).toUpperCase() + apiKey.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex-1 font-mono text-sm bg-muted p-3 rounded border">
                        {showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                      </div>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copySuccess === apiKey.id ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Permissions:</span>
                        <div className="mt-1 space-y-1">
                          {apiKey.permissions.map((perm) => (
                            <span key={perm} className="inline-block px-2 py-1 bg-biblical-king-100 text-biblical-king-700 rounded text-xs mr-1">
                              {availablePermissions.find(p => p.id === perm)?.name || perm}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Used:</span>
                        <div className="text-foreground">
                          {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
                        </div>
                        <span className="text-muted-foreground">Usage Count:</span>
                        <div className="text-foreground">{apiKey.usageCount.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <div className="text-foreground">{new Date(apiKey.createdAt).toLocaleDateString()}</div>
                        {apiKey.expiresAt && (
                          <>
                            <span className="text-muted-foreground">Expires:</span>
                            <div className="text-foreground">{new Date(apiKey.expiresAt).toLocaleDateString()}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => rotateApiKey(apiKey.id)}
                      className="p-2 text-biblical-wisdom-600 hover:text-biblical-wisdom-700 hover:bg-biblical-wisdom-50 rounded transition-colors"
                      title="Rotate Key"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => revokeApiKey(apiKey.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Revoke Key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Biblical Guidance */}
      <div className="biblical-card bg-gradient-to-r from-biblical-king-50 to-biblical-wisdom-50">
        <div className="biblical-card-content">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-biblical-king-500 rounded-full animate-biblical-glow">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="biblical-heading text-lg text-biblical-king-800">
                Sacred Key Stewardship
              </h3>
              <p className="text-sm text-biblical-king-700 mt-2">
                "I will give you the keys of the kingdom of heaven; whatever you bind on earth will be bound in heaven" - Matthew 16:19
              </p>
              <div className="text-xs text-muted-foreground mt-3 space-y-1">
                <p>• Guard your API keys as sacred trusts - never share them publicly</p>
                <p>• Rotate keys regularly to maintain security integrity</p>
                <p>• Use minimal permissions following the principle of least privilege</p>
                <p>• Monitor usage patterns to detect unauthorized access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManagement;