'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Subscription, BillingHistory } from '@/types/dashboard';
import { format, addMonths, isPast } from 'date-fns';

interface BillingDashboardProps {
  subscription: Subscription;
  billingHistory: BillingHistory[];
  compact?: boolean;
  className?: string;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  subscription,
  billingHistory,
  compact = false,
  className = ''
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<BillingHistory | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'failed':
        return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'refunded':
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-500/30';
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'past_due':
        return 'text-yellow-400';
      case 'canceled':
        return 'text-red-400';
      case 'unpaid':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/v1/billing/invoices/${invoiceId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('corso_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to download invoice');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `corso-invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download invoice error:', err);
    }
  };

  const totalSpent = billingHistory
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const upcomingPayment = subscription.next_billing_date
    ? format(new Date(subscription.next_billing_date), 'MMM dd, yyyy')
    : 'N/A';

  if (compact) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-biblical text-white">Billing</h3>
          <CreditCard className="w-5 h-5 text-biblical-infrastructure-400" />
        </div>

        {/* Subscription Status */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-gray-600/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Subscription</span>
            <span className={`text-sm font-medium capitalize ${getSubscriptionStatusColor(subscription.status)}`}>
              {subscription.status}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Next billing: {upcomingPayment}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Recent Invoices</h4>
          {billingHistory.slice(0, 3).map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-3 bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30"
            >
              <div className="flex items-center space-x-2">
                {getStatusIcon(invoice.status)}
                <span className="text-sm text-white">{invoice.invoice_number}</span>
              </div>
              <div className="text-sm text-gray-300">
                ${invoice.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-biblical text-white">Billing & Subscription</h2>
          <p className="text-gray-400 mt-1">Manage your subscription and billing history</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Total Spent</div>
          <div className="text-2xl font-bold text-biblical-infrastructure-400">
            ${totalSpent.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Subscription Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <CreditCard className="w-6 h-6 text-biblical-infrastructure-400" />
            <h3 className="text-lg font-medium text-white">Current Subscription</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Status</span>
              <span className={`font-medium capitalize ${getSubscriptionStatusColor(subscription.status)}`}>
                {subscription.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Current Period</span>
              <span className="text-white">
                {format(new Date(subscription.current_period_start), 'MMM dd')} -{' '}
                {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Next Billing</span>
              <span className="text-white">{upcomingPayment}</span>
            </div>

            {subscription.cancel_at_period_end && (
              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-300 text-sm">
                    Subscription will cancel at period end
                  </span>
                </div>
              </div>
            )}

            {subscription.trial_end && !isPast(new Date(subscription.trial_end)) && (
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 text-sm">
                    Trial ends {format(new Date(subscription.trial_end), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30 p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <CreditCard className="w-6 h-6 text-biblical-wisdom-400" />
            <h3 className="text-lg font-medium text-white">Payment Method</h3>
          </div>

          {subscription.payment_method ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Type</span>
                <span className="text-white capitalize">{subscription.payment_method.type}</span>
              </div>

              {subscription.payment_method.last_four && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Card</span>
                  <span className="text-white">
                    •••• •••• •••• {subscription.payment_method.last_four}
                  </span>
                </div>
              )}

              {subscription.payment_method.exp_month && subscription.payment_method.exp_year && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Expires</span>
                  <span className="text-white">
                    {subscription.payment_method.exp_month.toString().padStart(2, '0')}/
                    {subscription.payment_method.exp_year}
                  </span>
                </div>
              )}

              <button className="w-full py-2 px-4 bg-biblical-wisdom-600 hover:bg-biblical-wisdom-700 text-white rounded-lg font-medium transition-colors">
                Update Payment Method
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-yellow-300 mb-4">No payment method on file</p>
              <button className="py-2 px-4 bg-biblical-wisdom-600 hover:bg-biblical-wisdom-700 text-white rounded-lg font-medium transition-colors">
                Add Payment Method
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Billing History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-black/30 backdrop-blur-sm rounded-lg border border-gray-600/30"
      >
        <div className="p-6 border-b border-gray-600/30">
          <h3 className="text-lg font-medium text-white">Billing History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-600/30">
                <th className="text-left p-4 text-sm font-medium text-gray-300">Invoice</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((invoice, index) => (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-700/30 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-white">{invoice.invoice_number}</div>
                      {invoice.items.length > 0 && (
                        <div className="text-sm text-gray-400 mt-1">
                          {invoice.items[0]?.description}
                          {invoice.items.length > 1 && ` +${invoice.items.length - 1} more`}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">
                    {format(new Date(invoice.issued_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">
                      ${invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
                    </div>
                    {invoice.paid_at && (
                      <div className="text-sm text-gray-400">
                        Paid {format(new Date(invoice.paid_at), 'MMM dd')}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      <span className="capitalize">{invoice.status}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-biblical-infrastructure-400 hover:text-biblical-infrastructure-300 transition-colors"
                        title="View details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => downloadInvoice(invoice.id)}
                        className="text-biblical-wisdom-400 hover:text-biblical-wisdom-300 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {billingHistory.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Billing History</h3>
              <p className="text-gray-400">Your invoices will appear here once you have billing activity</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedInvoice(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-900 rounded-lg border border-gray-600 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-biblical text-white">Invoice Details</h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Invoice Number:</span>
                  <p className="text-white font-medium">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <p className={`font-medium capitalize ${getSubscriptionStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Issued:</span>
                  <p className="text-white">{format(new Date(selectedInvoice.issued_at), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <span className="text-gray-400">Due:</span>
                  <p className="text-white">{format(new Date(selectedInvoice.due_at), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              <div className="border-t border-gray-600 pt-4">
                <h4 className="font-medium text-white mb-3">Line Items</h4>
                <div className="space-y-2">
                  {selectedInvoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <p className="text-white">{item.description}</p>
                        <p className="text-gray-400">Qty: {item.quantity} × ${item.unit_price.toFixed(2)}</p>
                      </div>
                      <div className="text-white font-medium">
                        ${item.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-biblical-infrastructure-400">
                    ${selectedInvoice.amount.toFixed(2)} {selectedInvoice.currency.toUpperCase()}
                  </span>
                </div>
              </div>

              {selectedInvoice.payment_method && (
                <div className="border-t border-gray-600 pt-4">
                  <h4 className="font-medium text-white mb-2">Payment Method</h4>
                  <p className="text-gray-300 text-sm">
                    {selectedInvoice.payment_method.type.charAt(0).toUpperCase() + selectedInvoice.payment_method.type.slice(1)}
                    {selectedInvoice.payment_method.last_four && ` ending in ${selectedInvoice.payment_method.last_four}`}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => downloadInvoice(selectedInvoice.id)}
                  className="flex-1 py-2 px-4 bg-biblical-infrastructure-600 hover:bg-biblical-infrastructure-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};