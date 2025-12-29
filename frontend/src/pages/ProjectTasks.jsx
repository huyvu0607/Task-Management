import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import TaskBoard from '../components/task/TaskBoard';
import CreateTaskModal from '../components/task/CreateTaskModal';
import TaskDetailModal from '../components/task/TaskDetailModal';
import EditTaskModal from '../components/task/EditTaskModal';
import TaskFilters from '../components/task/TaskFilters';
import { projectApi } from '../api/projectApi';
import { teamApi } from '../api/teamApi';
import { useToast } from '../components/ui/Toast';

/**
 * Page chính cho quản lý tasks của một project
 */
const ProjectTasks = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [initialStatus, setInitialStatus] = useState('TODO');

  // Fetch project details
  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    const result = await projectApi.getProjectById(projectId);
    
    if (result.success) {
      setProject(result.data);
      // Fetch team members
      fetchTeamMembers(result.data.teamId);
    } else {
      toast.error(result.message);
      navigate('/projects');
    }
  };

  const fetchTeamMembers = async (teamId) => {
    const result = await teamApi.getTeamMembers(teamId);
    if (result.success) {
      setTeamMembers(result.data);
    }
  };

  const handleCreateTask = (status = 'TODO') => {
    setInitialStatus(status);
    setCreateModalOpen(true);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setDetailModalOpen(false);
    setEditModalOpen(true);
  };

  const handleCloseCreateModal = (shouldRefresh) => {
    setCreateModalOpen(false);
    if (shouldRefresh) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleCloseEditModal = (shouldRefresh) => {
    setEditModalOpen(false);
    setSelectedTask(null);
    if (shouldRefresh) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleDeleteTask = () => {
    setDetailModalOpen(false);
    setSelectedTask(null);
    setRefreshTrigger(prev => prev + 1);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/projects')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {project.description || '4 tasks'}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleCreateTask()}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>

            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setViewMode('board')}
                className={`p-2 rounded ${
                  viewMode === 'board'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Board view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <TaskFilters onFilterChange={(filters) => console.log('Filters:', filters)} />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'board' ? (
          <TaskBoard
            projectId={projectId}
            onTaskClick={handleTaskClick}
            onCreateTask={handleCreateTask}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-gray-600 dark:text-gray-400 text-center">
              List view - Coming soon
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={handleCloseCreateModal}
        projectId={projectId}
        initialStatus={initialStatus}
        teamMembers={teamMembers}
      />

      {selectedTask && (
        <>
          <TaskDetailModal
            isOpen={detailModalOpen}
            onClose={() => {
              setDetailModalOpen(false);
              setSelectedTask(null);
            }}
            taskId={selectedTask.id}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />

          <EditTaskModal
            isOpen={editModalOpen}
            onClose={handleCloseEditModal}
            task={selectedTask}
            teamMembers={teamMembers}
          />
        </>
      )}
    </div>
  );
};

export default ProjectTasks;