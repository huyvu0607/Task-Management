import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Menu,
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings
} from 'lucide-react';
import TeamSwitcher from '../team/TeamSwitcher';
import CreateTaskFromSidebar from '../task/CreateTaskFromSidebar';
import { useTeam } from '../../hooks/useTeam';

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  navBadges = {},
  userProjects = []
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTeamMember } = useTeam();
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  // ✅ Check permission - VIEWER cannot create tasks
  const canCreateTask = currentTeamMember?.role !== 'VIEWER';

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleCloseCreateTask = (shouldRefresh) => {
    setShowCreateTaskModal(false);
    if (shouldRefresh) {
      // Refresh data if needed
      window.location.reload();
    }
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {sidebarOpen ? (
            <>
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-6 h-6 text-gray-900 dark:text-white" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  TaskFlow
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mx-auto transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Team Switcher */}
        <TeamSwitcher sidebarOpen={sidebarOpen} />

        {/* ✅ New Task Button - Hidden for VIEWER */}
        {canCreateTask && (
          <div className="p-4">
            <button 
              onClick={() => setShowCreateTaskModal(true)}
              className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg py-3 flex items-center justify-center space-x-2 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">New Task</span>}
            </button>
          </div>
        )}

        {/* ✅ Role Badge - Show for VIEWER (optional, helps user understand) */}
        {!canCreateTask && sidebarOpen && (
          <div className="px-4 pb-3">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                View Only Mode
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                You have viewer access
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="px-2 space-y-1">
          <NavItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={isActive('/dashboard') || isActive('/')}
            sidebarOpen={sidebarOpen}
            onClick={() => navigate('/dashboard')}
          />
          <NavItem 
            icon={CheckSquare} 
            label="My Tasks" 
            active={isActive('/tasks')}
            badge={navBadges.myTasksCount}
            sidebarOpen={sidebarOpen}
            onClick={() => navigate('/tasks')}
          />
          <NavItem 
            icon={FolderKanban} 
            label="Projects" 
            active={isActive('/projects')}
            badge={navBadges.activeProjectsCount}
            sidebarOpen={sidebarOpen}
            onClick={() => navigate('/projects')}
          />
          <NavItem 
            icon={Users} 
            label="Team" 
            active={isActive('/team')}
            badge={navBadges.teamsCount}
            sidebarOpen={sidebarOpen}
            onClick={() => navigate('/team')}
          />
        </nav>

        {/* Projects Section */}
        {sidebarOpen && userProjects.length > 0 && (
          <div className="px-4 mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Projects
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {userProjects.length}
              </span>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
              {userProjects.map((project) => (
                <ProjectItem 
                  key={project.id} 
                  project={project}
                  onClick={() => navigate(`/projects/${project.id}/tasks`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Settings - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <NavItem 
            icon={Settings} 
            label="Settings"
            active={isActive('/settings')}
            sidebarOpen={sidebarOpen}
            onClick={() => navigate('/settings')}
          />
        </div>
      </aside>

      {/* Create Task Modal */}
      <CreateTaskFromSidebar
        isOpen={showCreateTaskModal}
        onClose={handleCloseCreateTask}
      />
    </>
  );
};

// NavItem Component
const NavItem = ({ icon: Icon, label, active, badge, sidebarOpen, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all relative group ${
      active
        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    {sidebarOpen ? (
      <>
        <span className="flex-1 text-left text-sm font-medium">{label}</span>
        {badge > 0 && (
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full min-w-[20px] text-center ${
            active
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
              : 'bg-red-500 text-white'
          }`}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </>
    ) : (
      badge > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
      )
    )}
    
    {/* Tooltip for collapsed state */}
    {!sidebarOpen && (
      <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
        {label}
        {badge > 0 && <span className="ml-2 text-red-400">({badge})</span>}
      </div>
    )}
  </button>
);

// ProjectItem Component
const ProjectItem = ({ project, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group relative"
    >
      {/* Project color dot */}
      <div 
        className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-gray-800 shadow-sm"
        style={{ backgroundColor: project.color || '#3B82F6' }}
      ></div>
      
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span className="text-sm truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
          {project.name}
        </span>
        
        {/* Task count badge */}
        {project.taskCount !== undefined && project.taskCount > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full font-medium">
            {project.taskCount}
          </span>
        )}
      </div>

      {/* Progress indicator */}
      {project.progress !== undefined && (
        <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
          <div 
            className="h-full rounded-full transition-all"
            style={{ 
              width: `${project.progress || 0}%`,
              backgroundColor: project.color || '#3B82F6'
            }}
          />
        </div>
      )}
    </button>
  );
};

export default Sidebar;