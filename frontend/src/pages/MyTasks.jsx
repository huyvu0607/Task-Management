import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, AlertCircle, CheckCircle2, Circle, MessageSquare, Paperclip, MoreVertical, Check } from 'lucide-react';
import { taskApi } from '../api/taskApi';
import { useToast } from '../components/ui/Toast';
import { useTeam } from '../hooks/useTeam';
import { useNavigate } from 'react-router-dom';
import CreateTaskFromSidebar from '../components/task/CreateTaskFromSidebar';
import EditTaskModal from '../components/task/EditTaskModal';

const MyTasks = () => {
  const { currentTeam } = useTeam();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    if (currentTeam?.id) {
      loadMyTasks();
    }
  }, [currentTeam]);

  const loadMyTasks = async () => {
    setLoading(true);
    try {
      const result = await taskApi.getMyTasks({ 
        status: 'ALL',
        priority: 'ALL',
        page: 0,
        size: 100
      });
      
      if (result.success) {
        setTasks(result.data.content || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Load my tasks error:', error);
      toast.error('Không thể tải danh sách tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTaskSuccess = (success) => {
    setIsCreateModalOpen(false);
    if (success) {
      loadMyTasks();
    }
  };

  const handleToggleStatus = async (e, task) => {
    e.stopPropagation();
    
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    const result = await taskApi.updateTaskStatus(task.id, newStatus);
    
    if (result.success) {
      toast.success(`Task đã được chuyển sang ${newStatus === 'DONE' ? 'Hoàn thành' : 'Chưa hoàn thành'}`);
      loadMyTasks();
    } else {
      toast.error(result.message);
    }
  };

  const handleTaskClick = (task) => {
    navigate(`/projects/${task.projectId}/tasks`);
  };

  const handleEditClick = (e, task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsEditModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleDeleteClick = async (e, task) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    
    if (window.confirm('Bạn có chắc muốn xóa task này?')) {
      const result = await taskApi.deleteTask(task.id);
      if (result.success) {
        toast.success('Xóa task thành công');
        loadMyTasks();
      } else {
        toast.error(result.message);
      }
    }
  };

  const handleEditTaskSuccess = (success) => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
    if (success) {
      loadMyTasks();
    }
  };

  const toggleDropdown = (e, taskId) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === taskId ? null : taskId);
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      LOW: { color: 'text-gray-500', label: 'Low' },
      MEDIUM: { color: 'text-blue-500', label: 'Medium' },
      HIGH: { color: 'text-orange-500', label: 'High' },
      URGENT: { color: 'text-red-500', label: 'Urgent' }
    };
    return badges[priority] || badges.MEDIUM;
  };

  const filteredTasks = tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'ALL') return matchSearch;
    if (activeTab === 'PENDING') return matchSearch && (task.status === 'TODO' || task.status === 'IN_PROGRESS' || task.status === 'REVIEW');
    if (activeTab === 'COMPLETED') return matchSearch && task.status === 'DONE';
    
    return matchSearch;
  });

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length;
  const pendingTasks = tasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS' || t.status === 'REVIEW').length;

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!currentTeam) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Chưa chọn team
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Vui lòng chọn team để xem tasks của bạn
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              My Tasks
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage and track your tasks
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all font-medium shadow-sm hover:shadow-md"
          >
            + New Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Circle className="w-5 h-5" />}
            title="Total Tasks"
            value={totalTasks}
            bgColor="bg-gray-100 dark:bg-gray-700"
            textColor="text-gray-700 dark:text-gray-300"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            title="In Progress"
            value={inProgressTasks}
            bgColor="bg-orange-100 dark:bg-orange-900/30"
            textColor="text-orange-600 dark:text-orange-400"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            title="Completed"
            value={completedTasks}
            bgColor="bg-green-100 dark:bg-green-900/30"
            textColor="text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5" />}
            title="High Priority"
            value={highPriorityTasks}
            bgColor="bg-red-100 dark:bg-red-900/30"
            textColor="text-red-600 dark:text-red-400"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8">
        <div className="flex gap-8">
          <TabButton
            active={activeTab === 'ALL'}
            onClick={() => setActiveTab('ALL')}
            count={totalTasks}
            label="All"
          />
          <TabButton
            active={activeTab === 'PENDING'}
            onClick={() => setActiveTab('PENDING')}
            count={pendingTasks}
            label="Pending"
          />
          <TabButton
            active={activeTab === 'COMPLETED'}
            onClick={() => setActiveTab('COMPLETED')}
            count={completedTasks}
            label="Completed"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search' : 'You have no tasks yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const priorityBadge = getPriorityBadge(task.priority);
              
              return (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:border-gray-900 dark:hover:border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="pt-0.5">
                      <button
                        onClick={(e) => handleToggleStatus(e, task)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          task.status === 'DONE'
                            ? 'border-black dark:border-white bg-black dark:bg-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-100'
                        }`}
                      >
                        {task.status === 'DONE' && (
                          <Check className="w-3 h-3 text-white dark:text-black" strokeWidth={3} />
                        )}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base font-semibold mb-1 ${
                        task.status === 'DONE' 
                          ? 'line-through text-gray-400 dark:text-gray-500' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                      
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4" />
                          <span>5</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <Paperclip className="w-4 h-4" />
                          <span>3</span>
                        </div>

                        {task.assignees && task.assignees.length > 0 && (
                          <div className="flex -space-x-2">
                            {task.assignees.slice(0, 3).map((assignee, index) => (
                              <img
                                key={index}
                                src={assignee.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignee.fullName || 'User')}&background=random`}
                                alt={assignee.fullName}
                                className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Priority Badge */}
                    <div className={`text-sm font-medium ${priorityBadge.color}`}>
                      {priorityBadge.label}
                    </div>

                    {/* Dropdown Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => toggleDropdown(e, task.id)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openDropdownId === task.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(null);
                            }}
                          />
                          <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                            <button
                              onClick={(e) => handleEditClick(e, task)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, task)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskFromSidebar
        isOpen={isCreateModalOpen}
        onClose={handleCreateTaskSuccess}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={handleEditTaskSuccess}
        task={selectedTask}
        teamMembers={teamMembers}
      />
    </div>
  );
};

const StatCard = ({ icon, title, value, bgColor, textColor }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} ${textColor} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, count, label }) => {
  return (
    <button
      onClick={onClick}
      className={`pb-4 border-b-2 transition-colors ${
        active
          ? 'border-black dark:border-white text-gray-900 dark:text-white font-semibold'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {label} ({count})
    </button>
  );
};

export default MyTasks;