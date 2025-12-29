import React from 'react';

/**
 * Component hiển thị priority badge
 */
const PriorityBadge = ({ priority, size = 'md' }) => {
  const config = {
    LOW: {
      label: 'Low',
      bgLight: 'bg-gray-100',
      bgDark: 'dark:bg-gray-800',
      textLight: 'text-gray-700',
      textDark: 'dark:text-gray-300',
    },
    MEDIUM: {
      label: 'Medium',
      bgLight: 'bg-yellow-100',
      bgDark: 'dark:bg-yellow-900/30',
      textLight: 'text-yellow-700',
      textDark: 'dark:text-yellow-400',
    },
    HIGH: {
      label: 'High',
      bgLight: 'bg-orange-100',
      bgDark: 'dark:bg-orange-900/30',
      textLight: 'text-orange-700',
      textDark: 'dark:text-orange-400',
    },
    URGENT: {
      label: 'Urgent',
      bgLight: 'bg-red-100',
      bgDark: 'dark:bg-red-900/30',
      textLight: 'text-red-700',
      textDark: 'dark:text-red-400',
    },
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const priorityConfig = config[priority] || config.MEDIUM;

  return (
    <span
      className={`
        inline-flex items-center rounded-md font-medium
        ${priorityConfig.bgLight} ${priorityConfig.bgDark}
        ${priorityConfig.textLight} ${priorityConfig.textDark}
        ${sizeClasses[size]}
      `}
    >
      {priorityConfig.label}
    </span>
  );
};

export default PriorityBadge;