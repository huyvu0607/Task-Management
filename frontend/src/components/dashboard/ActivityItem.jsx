import React from 'react';
import { CheckCircle2, MessageSquare, Edit, Circle } from 'lucide-react';

const ActivityItem = ({ activity }) => {
  const actionIcons = {
    completed: CheckCircle2,
    commented: MessageSquare,
    updated: Edit,
    created: Circle
  };

  const actionColors = {
    completed: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    commented: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    updated: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
    created: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30'
  };

  const Icon = actionIcons[activity.actionType] || Circle;
  const colorClass = actionColors[activity.actionType] || 'text-gray-500 bg-gray-100';

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 cursor-pointer group hover:shadow-sm hover:scale-[1.01] border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
      {/* Avatar or Icon */}
      <div className="flex-shrink-0 group-hover:scale-110 transition-transform">
        {activity.user?.avatarUrl ? (
          <img 
            src={activity.user.avatarUrl} 
            alt={activity.user.fullName || activity.user.username}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-gray-300 dark:group-hover:ring-gray-600 transition-all"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:bg-gray-400 dark:group-hover:bg-gray-500 transition-colors">
            {(activity.user?.fullName || activity.user?.username || 'U').charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors">
          <span className="font-medium">
            {activity.user?.fullName || activity.user?.username}
          </span>
          {' '}
          <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {activity.actionType}
          </span>
          {' '}
          <span className="font-medium text-gray-900 dark:text-white">
            {activity.targetTitle}
          </span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
          {activity.timeAgo}
        </p>
      </div>

      {/* Action Icon */}
      <div className={`flex-shrink-0 p-1.5 rounded ${colorClass} group-hover:scale-110 group-hover:rotate-12 transition-all`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};

export default ActivityItem;
//  Hiển thị hoạt động gần đây
// Mỗi activity sẽ show:

// 👤 Avatar người dùng (hoặc chữ cái đầu nếu không có ảnh)
// 📝 Nội dung hoạt động: "John Doe completed Task ABC"
// ⏰ Thời gian (timeAgo) - ví dụ: "2 hours ago"
// 🎨 Icon action (completed, commented, updated, created) với màu sắc:

// ✅ Completed = xanh lá
// 💬 Commented = xanh dương
// ✏️ Updated = vàng
// ⭕ Created = tím