import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Calendar, Download, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal';
  last4: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  createdAt: string;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  dueDate: string;
  downloadUrl: string;
}

interface PaymentManagementProps {
  className?: string;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({
  className = '',
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'methods' | 'invoices'>('methods');

  const { user, license } = useAuthStore();

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      const [methodsResponse, invoicesResponse] = await Promise.all([
        fetch('/api/license/payment-methods', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }),
        fetch('/api/license/invoices', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }),
      ]);

      if (methodsResponse.ok) {
        const methods = await methodsResponse.json();
        setPaymentMethods(methods);
      }

      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setInvoices(invoicesData);
      }
    } catch (error) {
      console.error('Failed to load payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setDefaultPaymentMethod = async (methodId: string) => {
    try {
      setProcessingId(methodId);
      const response = await fetch(`/api/license/payment-methods/${methodId}/default`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setPaymentMethods(prev => prev.map(method => ({
          ...method,
          isDefault: method.id === methodId,
        })));
      }
    } catch (error) {
      console.error('Failed to set default payment method:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const removePaymentMethod = async (methodId: string) => {
    try {
      setProcessingId(methodId);
      const response = await fetch(`/api/license/payment-methods/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      }
    } catch (error) {
      console.error('Failed to remove payment method:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const downloadInvoice = async (invoiceId: string, downloadUrl: string) => {
    try {
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download invoice:', error);
    }
  };

  const getCardBrandIcon = (brand?: string) => {
    const brandIcons: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
    };
    return brandIcons[brand?.toLowerCase() || ''] || '💳';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="biblical-card">
            <div className="biblical-card-content">
              <div className="loading-skeleton h-6 w-1/3 mb-4" />
              <div className="loading-skeleton h-4 w-2/3 mb-2" />
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
                Faithful Stewardship Center
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your payment methods and billing with divine integrity
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('methods')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === 'methods'
                    ? 'bg-biblical-king-500 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Payment Methods
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === 'invoices'
                    ? 'bg-biblical-king-500 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Invoices
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Summary */}
      <div className="biblical-card bg-gradient-to-r from-biblical-infrastructure-50 to-biblical-divine-50">
        <div className="biblical-card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Current Plan</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                ${license?.price || 0}/month
              </div>
              <div className="text-sm text-muted-foreground">
                {license?.tier?.charAt(0).toUpperCase() + license?.tier?.slice(1)} Tier
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Next Billing</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {license?.nextBilling ? new Date(license.nextBilling).toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">
                {license?.billingCycle === 'annual' ? 'Annual billing' : 'Monthly billing'}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Payment Status</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                Active
              </div>
              <div className="text-sm text-muted-foreground">
                All payments up to date
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Tab */}
      {activeTab === 'methods' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="biblical-heading text-lg text-foreground">
              Payment Methods
            </h3>
            <motion.button
              onClick={() => setIsAddingCard(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-biblical-infrastructure-500 text-white rounded-lg hover:bg-biblical-infrastructure-600 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-4 w-4" />
              <span>Add Payment Method</span>
            </motion.button>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="biblical-card">
              <div className="biblical-card-content text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="biblical-heading text-lg text-foreground mb-2">
                  No Payment Methods
                </h3>
                <p className="text-muted-foreground mb-6">
                  Add a payment method to ensure uninterrupted service
                </p>
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="btn-biblical px-6 py-2 rounded-lg"
                >
                  Add First Payment Method
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="biblical-card"
                >
                  <div className="biblical-card-content">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {getCardBrandIcon(method.brand)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-foreground">
                              {method.brand?.charAt(0).toUpperCase() + method.brand?.slice(1)} ending in {method.last4}
                            </span>
                            {method.isDefault && (
                              <span className="px-2 py-1 text-xs bg-biblical-king-100 text-biblical-king-700 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {method.expMonth && method.expYear && (
                              <span>Expires {method.expMonth}/{method.expYear}</span>
                            )}
                            <span className="ml-2">• Added {new Date(method.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!method.isDefault && (
                          <button
                            onClick={() => setDefaultPaymentMethod(method.id)}
                            disabled={processingId === method.id}
                            className="px-3 py-1 text-sm text-biblical-king-600 hover:text-biblical-king-700 hover:bg-biblical-king-50 rounded transition-colors"
                          >
                            {processingId === method.id ? 'Setting...' : 'Set Default'}
                          </button>
                        )}
                        <button
                          onClick={() => removePaymentMethod(method.id)}
                          disabled={method.isDefault || processingId === method.id}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === method.id ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Add Card Modal */}
          <AnimatePresence>
            {isAddingCard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setIsAddingCard(false)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="biblical-card max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="biblical-card-header">
                    <h3 className="biblical-heading text-lg">Add Payment Method</h3>
                  </div>
                  <div className="biblical-card-content">
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-6">
                        You will be redirected to our secure payment provider to add a new payment method.
                      </p>
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => setIsAddingCard(false)}
                          className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            window.location.href = '/api/license/payment-methods/add';
                          }}
                          className="px-6 py-2 bg-biblical-king-500 text-white rounded-lg hover:bg-biblical-king-600 transition-colors"
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <h3 className="biblical-heading text-lg text-foreground mb-4">
            Billing History
          </h3>

          {invoices.length === 0 ? (
            <div className="biblical-card">
              <div className="biblical-card-content text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="biblical-heading text-lg text-foreground mb-2">
                  No Invoices Yet
                </h3>
                <p className="text-muted-foreground">
                  Your billing history will appear here once you make your first payment
                </p>
              </div>
            </div>
          ) : (
            <div className="biblical-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Invoice</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-medium text-foreground">#{invoice.number}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-foreground">${invoice.amount.toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => downloadInvoice(invoice.id, invoice.downloadUrl)}
                            className="inline-flex items-center space-x-1 text-sm text-biblical-king-600 hover:text-biblical-king-700"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Biblical Guidance */}
      <div className="biblical-card bg-gradient-to-r from-biblical-infrastructure-50 to-biblical-wisdom-50">
        <div className="biblical-card-content">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-biblical-infrastructure-500 rounded-full animate-infrastructure-flow">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="biblical-heading text-lg text-biblical-infrastructure-800">
                Faithful Financial Stewardship
              </h3>
              <p className="text-sm text-biblical-infrastructure-700 mt-2">
                "Give, and it will be given to you. A good measure, pressed down, shaken together and running over" - Luke 6:38
              </p>
              <div className="text-xs text-muted-foreground mt-3 space-y-1">
                <p>• All payment information is encrypted with biblical-grade security</p>
                <p>• Invoices are automatically generated and sent to your email</p>
                <p>• Update payment methods before expiration to avoid service interruption</p>
                <p>• Contact support for any billing questions or concerns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;