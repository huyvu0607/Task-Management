import React from 'react';
import { Calendar, MessageSquare, Paperclip, AlertCircle } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import { format } from 'date-fns';

/**
 * Component card hiển thị task trong kanban board
 */
const TaskCard = ({ task, onClick }) => {
  const isOverdue = task.isOverdue;
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;

  return (
    <div
      onClick={onClick}
      className="
        group bg-white dark:bg-gray-800 rounded-lg p-4 
        border border-gray-200 dark:border-gray-700
        hover:border-blue-500 dark:hover:border-blue-500
        hover:shadow-md transition-all cursor-pointer
      "
    >
      {/* Title */}
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: `${label.color}20`,
                color: label.color,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Due Date */}
      {dueDate && (
        <div className={`flex items-center gap-1.5 text-xs mb-3 ${
          isOverdue 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          <Calendar className="w-3.5 h-3.5" />
          <span>{format(dueDate, 'MMM d')}</span>
          {isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
        </div>
      )}

      {/* Priority Badge */}
      <div className="mb-3">
        <PriorityBadge priority={task.priority} size="sm" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex -space-x-2">
          {task.assignees && task.assignees.slice(0, 3).map((assignee, index) => (
            <div
              key={assignee.userId}
              className="relative w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800"
              title={assignee.fullName}
            >
              {assignee.avatarUrl ? (
                <img
                  src={assignee.avatarUrl}
                  alt={assignee.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                  {assignee.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
          {task.assignees && task.assignees.length > 3 && (
            <div className="relative w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                +{task.assignees.length - 3}
              </span>
            </div>
          )}
        </div>

        {/* Counts */}
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          {task.commentCount > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{task.commentCount}</span>
            </div>
          )}
          {task.attachmentCount > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{task.attachmentCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;