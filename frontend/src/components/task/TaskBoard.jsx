import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import { taskApi } from '../../api/taskApi';
import { useToast } from '../ui/Toast';

/**
 * Component Kanban Board hiển thị tasks theo columns
 */
const TaskBoard = ({ projectId, onTaskClick, onCreateTask, refreshTrigger }) => {
  const [tasks, setTasks] = useState({
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Fetch tasks
  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId, refreshTrigger]);

  const fetchTasks = async () => {
    setLoading(true);
    const result = await taskApi.getTasksByProject(projectId, 0, 100);
    
    if (result.success) {
      const tasksByStatus = {
        TODO: [],
        IN_PROGRESS: [],
        DONE: [],
      };

      result.data.content.forEach((task) => {
        if (tasksByStatus[task.status]) {
          tasksByStatus[task.status].push(task);
        }
      });

      setTasks(tasksByStatus);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  // Handle drag start
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('currentStatus', task.status);
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const currentStatus = e.dataTransfer.getData('currentStatus');

    if (currentStatus === newStatus) return;

    // Update task status via API
    const result = await taskApi.updateTaskStatus(taskId, newStatus);
    
    if (result.success) {
      toast.success('Cập nhật status thành công');
      fetchTasks(); // Refresh tasks
    } else {
      toast.error(result.message);
    }
  };

  const columns = [
    {
      id: 'TODO',
      title: 'To Do',
      icon: '⚪',
      count: tasks.TODO.length,
      bgColor: 'bg-gray-50 dark:bg-gray-900',
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      icon: '🟡',
      count: tasks.IN_PROGRESS.length,
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    },
    {
      id: 'DONE',
      title: 'Done',
      icon: '🟢',
      count: tasks.DONE.length,
      bgColor: 'bg-green-50 dark:bg-green-900/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex flex-col"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{column.icon}</span>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {column.title}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                {column.count}
              </span>
            </div>
            <button
              onClick={() => onCreateTask(column.id)}
              className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              title="Add task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Column Content */}
          <div className={`flex-1 rounded-lg p-3 space-y-3 overflow-y-auto ${column.bgColor}`}>
            {tasks[column.id].map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
              >
                <TaskCard task={task} onClick={() => onTaskClick(task)} />
              </div>
            ))}

            {tasks[column.id].length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                No tasks
              </div>
            )}

            {/* Add Task Button */}
            <button
              onClick={() => onCreateTask(column.id)}
              className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add task
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskBoard;