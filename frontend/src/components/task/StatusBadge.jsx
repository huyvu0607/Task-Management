import React from 'react';
import { Circle, Clock, CheckCircle } from 'lucide-react';

/**
 * Component hiển thị status badge
 */
const StatusBadge = ({ status, showIcon = true, size = 'md' }) => {
  const config = {
    TODO: {
      label: 'To Do',
      icon: Circle,
      bgLight: 'bg-gray-100',
      bgDark: 'dark:bg-gray-800',
      textLight: 'text-gray-700',
      textDark: 'dark:text-gray-300',
      iconColor: 'text-gray-500 dark:text-gray-400',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      icon: Clock,
      bgLight: 'bg-blue-100',
      bgDark: 'dark:bg-blue-900/30',
      textLight: 'text-blue-700',
      textDark: 'dark:text-blue-400',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    DONE: {
      label: 'Done',
      icon: CheckCircle,
      bgLight: 'bg-green-100',
      bgDark: 'dark:bg-green-900/30',
      textLight: 'text-green-700',
      textDark: 'dark:text-green-400',
      iconColor: 'text-green-600 dark:text-green-400',
    },
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const statusConfig = config[status] || config.TODO;
  const Icon = statusConfig.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-md font-medium
        ${statusConfig.bgLight} ${statusConfig.bgDark}
        ${statusConfig.textLight} ${statusConfig.textDark}
        ${sizeClasses[size]}
      `}
    >
      {showIcon && <Icon className={`${iconSizes[size]} ${statusConfig.iconColor}`} />}
      {statusConfig.label}
    </span>
  );
};

export default StatusBadge;