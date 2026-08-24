// frontend/src/components/dashboard/TasksList.jsx
import React, { useState } from 'react';
import TaskItem from './TaskItem';
import CreateTaskFromSidebar from '../task/CreateTaskFromSidebar';
import { CheckSquare, Filter, ArrowUpDown, Plus } from 'lucide-react';

const TasksList = ({ myTasks = {}, onTaskCreated }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const tasks = myTasks.tasks || [];
  const pendingCount = myTasks.pendingCount || 0;
  const completedCount = myTasks.completedCount || 0;

  const handleModalClose = (shouldRefresh) => {
    setIsCreateModalOpen(false);
    if (shouldRefresh && onTaskCreated) {
      onTaskCreated(); // Refresh tasks list after creating new task
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                My Tasks
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {pendingCount} pending, {completedCount} completed
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <ArrowUpDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))
          ) : (
            <div className="p-12 text-center">
              <CheckSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No tasks yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Create your first task to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskFromSidebar 
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
      />
    </>
  );
};

export default TasksList;