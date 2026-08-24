import React, { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

/**
 * Component dropdown để quick edit priority
 */
const PriorityDropdown = ({ currentPriority, onSelect, onClose }) => {
  const dropdownRef = useRef(null);

  const priorities = [
    { value: 'LOW', label: 'Low', color: 'text-gray-700 dark:text-gray-300' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'HIGH', label: 'High', color: 'text-orange-600 dark:text-orange-400' },
    { value: 'URGENT', label: 'Urgent', color: 'text-red-600 dark:text-red-400' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 mt-1 w-40 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-1"
      onClick={(e) => e.stopPropagation()}
    >
      {priorities.map((priority) => (
        <button
          key={priority.value}
          onClick={() => onSelect(priority.value)}
          className={`
            w-full px-3 py-2 text-left text-sm flex items-center justify-between
            hover:bg-gray-100 dark:hover:bg-gray-700
            ${priority.color}
          `}
        >
          <span>{priority.label}</span>
          {currentPriority === priority.value && (
            <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          )}
        </button>
      ))}
    </div>
  );
};

export default PriorityDropdown;