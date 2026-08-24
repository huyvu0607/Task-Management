import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, Clock, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { taskApi } from '../../api/taskApi';
import { useToast } from '../ui/Toast';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import CommentSection from '../comment/CommentSection';
import { format } from 'date-fns';

/**
 * Modal chi tiết task
 * Updated với Comment Section
 */
const TaskDetailModal = ({ isOpen, onClose, taskId, onEdit, onDelete }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'comments'
  const toast = useToast();

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetail();
    }
  }, [isOpen, taskId]);

  const fetchTaskDetail = async () => {
    setLoading(true);
    const result = await taskApi.getTaskDetail(taskId);
    
    if (result.success) {
      setTask(result.data);
    } else {
      toast.error(result.message);
      onClose();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa task này?')) return;

    const result = await taskApi.deleteTask(taskId);
    if (result.success) {
      toast.success('Xóa task thành công');
      onDelete?.();
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {task.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                trong {task.projectName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {task.canEdit && (
                <button
                  onClick={() => onEdit?.(task)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
              {task.canDelete && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                  title="Xóa"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                activeTab === 'details'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Details
              {activeTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
                activeTab === 'comments'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Comments
              {task.commentCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  {task.commentCount}
                </span>
              )}
              {activeTab === 'comments' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            // Details Tab
            <div className="grid grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Mô tả
                  </h3>
                  {task.description ? (
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      {task.description}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Chưa có mô tả
                    </p>
                  )}
                </div>

                {/* Labels */}
                {task.labels && task.labels.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Nhãn
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {task.labels.map((label) => (
                        <span
                          key={label.id}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium"
                          style={{
                            backgroundColor: `${label.color}20`,
                            color: label.color,
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time Tracking */}
                {(task.estimatedHours || task.actualHours) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Thời gian
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
                      {task.estimatedHours && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Ước tính:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {task.estimatedHours}h
                          </span>
                        </div>
                      )}
                      {task.actualHours && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Thực tế:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {task.actualHours}h
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Assignees */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Người thực hiện
                  </h3>
                  {task.assignees && task.assignees.length > 0 ? (
                    <div className="space-y-2">
                      {task.assignees.map((assignee) => (
                        <div key={assignee.id} className="flex items-center gap-2">
                          {assignee.avatarUrl ? (
                            <img
                              src={assignee.avatarUrl}
                              alt={assignee.fullName}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                              {assignee.fullName?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {assignee.fullName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {assignee.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Chưa assign
                    </p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Hạn hoàn thành
                  </h3>
                  {dueDate ? (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${
                      task.isOverdue 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white'
                    }`}>
                      {task.isOverdue && <AlertCircle className="w-4 h-4" />}
                      <span className="text-sm font-medium">
                        {format(dueDate, 'dd MMM yyyy')}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Không có deadline
                    </p>
                  )}
                </div>

                {/* Creator */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Người tạo
                  </h3>
                  <div className="flex items-center gap-2">
                    {task.createdBy?.avatarUrl ? (
                      <img
                        src={task.createdBy.avatarUrl}
                        alt={task.createdBy.fullName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {task.createdBy?.fullName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.createdBy?.fullName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {task.createdAt && format(new Date(task.createdAt), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity Counts */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Comments:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {task.commentCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Attachments:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {task.attachmentCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Comments Tab
            <CommentSection 
              taskId={taskId} 
              initialCommentCount={task.commentCount || 0}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;