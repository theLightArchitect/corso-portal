/**
 * Dashboard Page - Protected Route Example
 */

'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AuthStatus from '@/components/auth/AuthStatus';
import { Permission } from '@/types/auth';
import { Crown, Shield, Zap, Users, BarChart3, Settings } from 'lucide-react';
import { BiblicalCard } from '@/components/ui/BiblicalCard';

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredPermissions={[Permission.BASIC_ACCESS]}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Status */}
            <div className="lg:col-span-1">
              <AuthStatus
                variant="full"
                showBiblicalIdentity={true}
                showPermissions={true}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <BiblicalCard>
                <div className="biblical-card-header">
                  <div className="flex items-center space-x-3">
                    <Crown className="w-8 h-8 text-purple-600" />
                    <div>
                      <h1 className="biblical-heading text-2xl">
                        Sacred Dashboard
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        Welcome to your divine command center
                      </p>
                    </div>
                  </div>
                </div>

                <div className="biblical-card-content">
                  <div className="grid grid-cols-2 gap-4">
                    <DashboardTile
                      icon={<Shield className="w-6 h-6" />}
                      title="Security"
                      description="Covenant status and divine protection"
                      color="blue"
                    />
                    <DashboardTile
                      icon={<Zap className="w-6 h-6" />}
                      title="KJVA⁸ Agents"
                      description="Biblical AI collective access"
                      color="purple"
                    />
                    <DashboardTile
                      icon={<Users className="w-6 h-6" />}
                      title="Team"
                      description="Manage your spiritual fellowship"
                      color="green"
                    />
                    <DashboardTile
                      icon={<BarChart3 className="w-6 h-6" />}
                      title="Analytics"
                      description="Divine insights and wisdom"
                      color="amber"
                    />
                  </div>
                </div>
              </BiblicalCard>

              <BiblicalCard>
                <div className="biblical-card-header">
                  <h2 className="biblical-heading text-lg">
                    Recent Divine Activity
                  </h2>
                </div>
                <div className="biblical-card-content">
                  <p className="text-gray-600 dark:text-gray-400">
                    Your spiritual journey activities will appear here...
                  </p>
                </div>
              </BiblicalCard>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

interface DashboardTileProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'green' | 'amber';
}

const DashboardTile: React.FC<DashboardTileProps> = ({ icon, title, description, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]} hover:shadow-md transition-shadow cursor-pointer`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};