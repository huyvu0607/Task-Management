import React from 'react';
import { Calendar, MessageSquare, Paperclip, Circle, CheckCircle2 } from 'lucide-react';

const TaskItem = ({ task, onToggleComplete }) => {
  const priorityColors = {
    LOW: 'text-gray-500 bg-gray-100 dark:bg-gray-700',
    MEDIUM: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    HIGH: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
    URGENT: 'text-red-600 bg-red-100 dark:bg-red-900/30'
  };

  const statusIcons = {
    TODO: Circle,
    IN_PROGRESS: Circle,
    DONE: CheckCircle2
  };

  const StatusIcon = statusIcons[task.status] || Circle;
  const isCompleted = task.status === 'DONE';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group">
      {/* Checkbox */}
      <button 
        onClick={() => onToggleComplete?.(task.id)}
        className="mt-0.5 flex-shrink-0"
      >
        <StatusIcon 
          className={`w-5 h-5 ${
            isCompleted 
              ? 'text-green-500 fill-green-500' 
              : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600'
          }`}
        />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${
              isCompleted 
                ? 'text-gray-500 dark:text-gray-400 line-through' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {task.title}
            </h4>
            
            {task.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                {task.description}
              </p>
            )}
          </div>

          {/* Priority Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
          
          {task.commentCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{task.commentCount}</span>
            </div>
          )}
          
          {task.attachmentCount > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{task.attachmentCount}</span>
            </div>
          )}

          {/* Assignees */}
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-2 ml-auto">
              {task.assignees.slice(0, 3).map((assignee, index) => (
                <div
                  key={assignee.id}
                  className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium"
                  title={assignee.fullName || assignee.username}
                >
                  {assignee.avatarUrl ? (
                    <img 
                      src={assignee.avatarUrl} 
                      alt={assignee.fullName} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 dark:text-gray-300">
                      {(assignee.fullName || assignee.username).charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
              {task.assignees.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;

// Hiển thị từng task item
// Mỗi task sẽ show:

// ✅ Checkbox/Icon (Circle hoặc CheckCircle2 tùy status)
// 📝 Tiêu đề task (title) - có gạch ngang nếu DONE
// 📄 Mô tả ngắn (description) - tối đa 1 dòng
// 🏷️ Priority badge (LOW/MEDIUM/HIGH/URGENT) với màu sắc khác nhau
// 📅 Due date (ngày đến hạn)
// 💬 Comment count (số lượng comment)
// 📎 Attachment count (số file đính kèm)
// 👤 Assignees avatars (tối đa 3 avatar, nếu nhiều hơn hiện "+X")