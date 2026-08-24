import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import { taskApi } from '../../api/taskApi';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../context/AuthContext';

/**
 * Component Kanban Board hiển thị tasks theo columns
 * Fixed: Admin drag & drop bug - check createdBy structure correctly
 */
const TaskBoard = ({ projectId, onTaskClick, onCreateTask, refreshTrigger, userRole }) => {
  const [tasks, setTasks] = useState({
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user } = useAuth();

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
      
      //  DEBUG: Log để check structure
      console.log('📊 Tasks loaded:', result.data.content[0]);
      console.log('👤 Current user:', user);
      console.log('🎭 User role:', userRole);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  //  FIX: Check if user can move task
  const canMoveTask = (task) => {
    if (!user) {
      console.log('❌ No user');
      return false;
    }
    
    console.log(' Checking permission for task:', task.id, {
      userRole,
      userId: user.id,
      createdBy: task.createdBy,
      assignees: task.assignees
    });
    
    //  VIEWER KHÔNG BAO GIỜ ĐƯỢC MOVE TASK
    if (userRole === 'VIEWER') {
      console.log('❌ VIEWER cannot move');
      return false;
    }
    
    //  ADMIN & MANAGER luôn được move
    if (userRole === 'ADMIN' || userRole === 'MANAGER') {
      console.log(' ADMIN/MANAGER can move');
      return true;
    }
    
    //  DEVELOPER, DESIGNER, QA, MEMBER chỉ move được task của mình
    if (['DEVELOPER', 'DESIGNER', 'QA', 'MEMBER'].includes(userRole)) {
      // 🔧 FIX: Check createdBy structure correctly
      const isCreator = task.createdBy?.id === user.id || 
                       task.createdBy?.userId === user.id;
      
      const isAssignee = task.assignees?.some(a => 
        a.userId === user.id || a.id === user.id
      );
      
      console.log('🔍 Permission check:', { isCreator, isAssignee });
      return isCreator || isAssignee;
    }
    
    console.log('❌ No permission');
    return false;
  };

  // Handle drag start
  const handleDragStart = (e, task) => {
    const canMove = canMoveTask(task);
    console.log('🎯 Drag start:', { taskId: task.id, canMove });
    
    if (!canMove) {
      e.preventDefault();
      toast.error('Bạn không có quyền di chuyển task này');
      return;
    }
    
    e.dataTransfer.setData('taskId', task.id.toString());
    e.dataTransfer.setData('currentStatus', task.status);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const currentStatus = e.dataTransfer.getData('currentStatus');

    console.log('📍 Drop:', { taskId, currentStatus, newStatus });

    if (currentStatus === newStatus) {
      console.log('⏭️ Same status, skip');
      return;
    }

    // ✅ Double check permission before API call
    const task = Object.values(tasks)
      .flat()
      .find(t => t.id === parseInt(taskId));
      
    if (!task) {
      console.log('❌ Task not found');
      toast.error('Task không tồn tại');
      return;
    }

    if (!canMoveTask(task)) {
      console.log('❌ No permission to move');
      toast.error('Bạn không có quyền di chuyển task này');
      return;
    }

    console.log('🚀 Updating task status...');

    // Update task status via API
    const result = await taskApi.updateTaskStatus(taskId, newStatus);
    
    if (result.success) {
      console.log('✅ Status updated successfully');
      toast.success('Cập nhật status thành công');
      fetchTasks(); // Refresh tasks
    } else {
      console.log('❌ Update failed:', result.message);
      toast.error(result.message);
    }
  };

  // ✅ Handle quick update with role check
  const handleQuickUpdate = async (taskId, field, value) => {
    // Check permission
    const task = Object.values(tasks)
      .flat()
      .find(t => t.id === taskId);
      
    if (!task) {
      toast.error('Task không tồn tại');
      return;
    }

    if (!canMoveTask(task)) {
      toast.error('Bạn không có quyền cập nhật task này');
      return;
    }

    const updateData = { [field]: value };
    const result = await taskApi.updateTask(taskId, updateData);
    
    if (result.success) {
      toast.success('Cập nhật thành công');
      
      // Optimistic update
      setTasks(prev => {
        const newTasks = { ...prev };
        Object.keys(newTasks).forEach(status => {
          newTasks[status] = newTasks[status].map(task =>
            task.id === taskId ? { ...task, [field]: value } : task
          );
        });
        return newTasks;
      });
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
            
            {/* ✅ Chỉ show Add button nếu KHÔNG phải Viewer */}
            {userRole !== 'VIEWER' && (
              <button
                onClick={() => onCreateTask(column.id)}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                title="Add task"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Column Content */}
          <div className={`flex-1 rounded-lg p-3 space-y-3 overflow-y-auto ${column.bgColor}`}>
            {tasks[column.id].map((task) => {
              const canMove = canMoveTask(task);
              
              return (
                <div
                  key={task.id}
                  draggable={canMove}
                  onDragStart={(e) => handleDragStart(e, task)}
                  className={canMove ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-75'}
                  title={canMove ? 'Drag to move' : 'You cannot move this task'}
                >
                  <TaskCard 
                    task={task} 
                    onClick={() => onTaskClick(task)}
                    canMove={canMove}
                    currentUser={user}
                    userRole={userRole}
                    onQuickUpdate={handleQuickUpdate}
                  />
                </div>
              );
            })}

            {tasks[column.id].length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                No tasks
              </div>
            )}

            {/* Add Task Button - ẩn với Viewer */}
            {userRole !== 'VIEWER' && (
              <button
                onClick={() => onCreateTask(column.id)}
                className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add task
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskBoard;