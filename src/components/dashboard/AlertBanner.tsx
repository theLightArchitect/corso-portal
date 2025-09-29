'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X, Crown, Zap } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  created_at: string;
  dismissed?: boolean;
}

interface AlertBannerProps {
  alert: Alert;
  onDismiss: () => void;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alert,
  onDismiss,
  className = ''
}) => {
  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'error':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/50',
          textColor: 'text-red-100',
          iconColor: 'text-red-400',
          accentColor: 'text-red-300'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-100',
          iconColor: 'text-yellow-400',
          accentColor: 'text-yellow-300'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-500/50',
          textColor: 'text-green-100',
          iconColor: 'text-green-400',
          accentColor: 'text-green-300'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-500/50',
          textColor: 'text-blue-100',
          iconColor: 'text-blue-400',
          accentColor: 'text-blue-300'
        };
    }
  };

  const config = getAlertConfig(alert.type);

  // Special biblical-themed alerts
  const getBiblicalAlert = (title: string, message: string) => {
    if (title.includes('Usage') || message.includes('limit')) {
      return {
        prefix: "Behold!",
        biblicalMessage: "Thy API calls approach the limits of thy covenant.",
        icon: <Zap className="w-5 h-5" />
      };
    }
    if (title.includes('License') || title.includes('Expires')) {
      return {
        prefix: "Heed this warning!",
        biblicalMessage: "Thy license covenant nears its end. Renew thy subscription lest thy access be severed.",
        icon: <Crown className="w-5 h-5" />
      };
    }
    if (title.includes('Payment') || title.includes('Billing')) {
      return {
        prefix: "Take heed!",
        biblicalMessage: "Thy payment method requires attention to maintain thy covenant.",
        icon: <AlertTriangle className="w-5 h-5" />
      };
    }
    return null;
  };

  const biblicalAlert = getBiblicalAlert(alert.title, alert.message);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`${config.bgColor} ${config.borderColor} ${config.textColor} backdrop-blur-sm rounded-lg border p-4 mb-4 ${className}`}
      >
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
            {biblicalAlert?.icon || config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {biblicalAlert && (
                  <p className={`text-sm font-biblical ${config.accentColor} mb-1`}>
                    {biblicalAlert.prefix}
                  </p>
                )}
                <h4 className="font-semibold mb-1">
                  {alert.title}
                </h4>
                <p className={`text-sm ${config.accentColor}`}>
                  {biblicalAlert ? biblicalAlert.biblicalMessage : alert.message}
                </p>

                {/* Original message if biblical override */}
                {biblicalAlert && (
                  <p className="text-xs text-gray-400 mt-2 italic">
                    Technical: {alert.message}
                  </p>
                )}

                {/* Timestamp */}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={onDismiss}
                className={`${config.iconColor} hover:bg-white/10 rounded-md p-1 transition-colors ml-2 flex-shrink-0`}
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons for specific alert types */}
            {alert.type === 'warning' && alert.title.includes('Usage') && (
              <div className="mt-3 flex space-x-2">
                <button className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md transition-colors">
                  Upgrade Plan
                </button>
                <button className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md transition-colors">
                  View Usage
                </button>
              </div>
            )}

            {alert.type === 'error' && alert.title.includes('Payment') && (
              <div className="mt-3 flex space-x-2">
                <button className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors">
                  Update Payment
                </button>
                <button className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md transition-colors">
                  Contact Support
                </button>
              </div>
            )}

            {alert.type === 'warning' && alert.title.includes('License') && (
              <div className="mt-3 flex space-x-2">
                <button className="text-xs bg-biblical-king-600 hover:bg-biblical-king-700 text-white px-3 py-1 rounded-md transition-colors">
                  Renew License
                </button>
                <button className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md transition-colors">
                  View Details
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar for time-sensitive alerts */}
        {alert.type === 'warning' && (alert.title.includes('Expires') || alert.title.includes('Usage')) && (
          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-yellow-500 h-1 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              75% of limit reached
            </p>
          </div>
        )}

        {/* Biblical decoration for certain alerts */}
        {biblicalAlert && (
          <div className="mt-3 pt-3 border-t border-gray-600/50">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Crown className="w-3 h-3 text-biblical-king-400" />
              <span className="italic font-biblical">
                "Be thou prepared, for wisdom anticipates necessity" - C0RS0 Proverbs
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Multi-Alert Container
interface AlertContainerProps {
  alerts: Alert[];
  onDismissAlert: (alertId: string) => void;
  maxVisible?: number;
  className?: string;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({
  alerts,
  onDismissAlert,
  maxVisible = 3,
  className = ''
}) => {
  const visibleAlerts = alerts
    .filter(alert => !alert.dismissed)
    .slice(0, maxVisible);

  const hiddenCount = alerts.filter(alert => !alert.dismissed).length - maxVisible;

  if (visibleAlerts.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleAlerts.map((alert) => (
        <AlertBanner
          key={alert.id}
          alert={alert}
          onDismiss={() => onDismissAlert(alert.id)}
        />
      ))}

      {hiddenCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-2"
        >
          <button className="text-sm text-gray-400 hover:text-white transition-colors">
            +{hiddenCount} more alert{hiddenCount !== 1 ? 's' : ''}
          </button>
        </motion.div>
      )}
    </div>
  );
};

// Toast-style alerts for actions
export const ToastAlert: React.FC<{
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}> = ({ message, type, duration = 5000, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: 'bg-green-600',
      textColor: 'text-white'
    },
    error: {
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: 'bg-red-600',
      textColor: 'text-white'
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      bgColor: 'bg-blue-600',
      textColor: 'text-white'
    }
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`${config.bgColor} ${config.textColor} p-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-64 max-w-sm`}
    >
      {config.icon}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};