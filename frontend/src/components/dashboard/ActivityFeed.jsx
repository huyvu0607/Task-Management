// frontend/src/components/dashboard/ActivityFeed.jsx
import React from 'react';
import ActivityItem from './ActivityItem';
import { Bell } from 'lucide-react';

const ActivityFeed = ({ recentActivities = [] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Team activity feed
        </p>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No activity yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Activity will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;

// //Header với tiêu đề "Recent Activity"
// Activity list với scroll (max height 600px)
// Empty state khi chưa có activity nào
// Sử dụng component ActivityItem để render từng activity