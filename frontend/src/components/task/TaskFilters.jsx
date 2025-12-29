import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Component filters cho tasks
 */
const TaskFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    dueDateFilter: '',
  });

  const handleStatusToggle = (status) => {
    setFilters((prev) => {
      const newStatus = prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status];
      
      const newFilters = { ...prev, status: newStatus };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handlePriorityToggle = (priority) => {
    setFilters((prev) => {
      const newPriority = prev.priority.includes(priority)
        ? prev.priority.filter((p) => p !== priority)
        : [...prev.priority, priority];
      
      const newFilters = { ...prev, priority: newPriority };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const handleDueDateChange = (value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, dueDateFilter: value };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: [],
      priority: [],
      dueDateFilter: '',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.status.length > 0 || 
                          filters.priority.length > 0 || 
                          filters.dueDateFilter !== '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <div className="space-y-2">
            {[
              { value: 'TODO', label: 'To Do', color: 'gray' },
              { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
              { value: 'DONE', label: 'Done', color: 'green' },
            ].map((status) => (
              <label
                key={status.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.status.includes(status.value)}
                  onChange={() => handleStatusToggle(status.value)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {status.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority
          </label>
          <div className="space-y-2">
            {[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' },
            ].map((priority) => (
              <label
                key={priority.value}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters.priority.includes(priority.value)}
                  onChange={() => handlePriorityToggle(priority.value)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {priority.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Due Date Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Due Date
          </label>
          <select
            value={filters.dueDateFilter}
            onChange={(e) => handleDueDateChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="OVERDUE">Overdue</option>
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
          </select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.status.map((status) => (
            <span
              key={status}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
            >
              {status.replace('_', ' ')}
              <button
                onClick={() => handleStatusToggle(status)}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.priority.map((priority) => (
            <span
              key={priority}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
            >
              {priority}
              <button
                onClick={() => handlePriorityToggle(priority)}
                className="hover:bg-orange-200 dark:hover:bg-orange-800 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.dueDateFilter && (
            <span
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            >
              {filters.dueDateFilter.replace('_', ' ')}
              <button
                onClick={() => handleDueDateChange('')}
                className="hover:bg-green-200 dark:hover:bg-green-800 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;