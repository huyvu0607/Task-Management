// frontend/src/pages/Projects.jsx
import { useState, useEffect } from 'react';
import { useTeam } from '../hooks/useTeam';
import { useToast } from '../components/ui/Toast';
import { projectApi } from '../api/projectApi';
import { LayoutGrid, List, Plus, Search, Archive } from 'lucide-react';
import CreateProjectModal from '../components/project/CreateProjectModal';
import EditProjectModal from '../components/project/EditProjectModal';
import ProjectCard from '../components/project/ProjectCard';
import ProjectListItem from '../components/project/ProjectListItem';

const Projects = () => {
  const { currentTeam } = useTeam();
  const toast = useToast();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('projectViewMode') || 'grid';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('DESC');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    totalPages: 0,
    totalElements: 0
  });

  useEffect(() => {
    if (currentTeam?.id) {
      loadProjects();
    }
  }, [currentTeam, statusFilter, sortBy, sortDir, pagination.page]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const status = statusFilter === 'ALL' ? null : statusFilter;
      const result = await projectApi.getProjectsByTeam(currentTeam.id, {
        page: pagination.page,
        size: pagination.size,
        status,
        sortBy,
        sortDir
      });

      if (result.success) {
        setProjects(result.data.content || []);
        setPagination(prev => ({
          ...prev,
          totalPages: result.data.totalPages,
          totalElements: result.data.totalElements
        }));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Load projects error:', error);
      toast.error('Không thể tải danh sách projects');
    } finally {
      setLoading(false);
    }
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('projectViewMode', mode);
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSuccess = () => {
    loadProjects();
    toast.success('Tạo project thành công!');
  };

  const handleEditClick = (project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    loadProjects();
    toast.success('Cập nhật project thành công!');
  };

  const handleArchive = async (projectId) => {
    if (!confirm('Bạn có chắc muốn archive project này?')) return;

    const result = await projectApi.archiveProject(projectId);
    if (result.success) {
      loadProjects();
      toast.success('Archive project thành công!');
    } else {
      toast.error(result.message);
    }
  };

  const handleUnarchive = async (projectId) => {
    const result = await projectApi.unarchiveProject(projectId);
    if (result.success) {
      loadProjects();
      toast.success('Khôi phục project thành công!');
    } else {
      toast.error(result.message);
    }
  };

  if (!currentTeam) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Chưa chọn team
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Vui lòng chọn hoặc tạo team để xem projects
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track all your projects
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors min-w-[180px] justify-between"
            >
              <div className="flex items-center gap-2">
                {statusFilter === 'ALL' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <span>All Status</span>
                  </>
                )}
                {statusFilter === 'ACTIVE' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Active</span>
                  </>
                )}
                {statusFilter === 'COMPLETED' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <span>Completed</span>
                  </>
                )}
                {statusFilter === 'ON_HOLD' && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>On Hold</span>
                  </>
                )}
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showStatusMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-20 overflow-hidden animate-slideDown">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setStatusFilter('ALL');
                      setShowStatusMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      statusFilter === 'ALL'
                        ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      <span>All Status</span>
                    </div>
                    {statusFilter === 'ALL' && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setStatusFilter('ACTIVE');
                      setShowStatusMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      statusFilter === 'ACTIVE'
                        ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Active</span>
                    </div>
                    {statusFilter === 'ACTIVE' && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setStatusFilter('COMPLETED');
                      setShowStatusMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      statusFilter === 'COMPLETED'
                        ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      <span>Completed</span>
                    </div>
                    {statusFilter === 'COMPLETED' && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setStatusFilter('ON_HOLD');
                      setShowStatusMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      statusFilter === 'ON_HOLD'
                        ? 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span>On Hold</span>
                    </div>
                    {statusFilter === 'ON_HOLD' && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Archived Button */}
          <button
            onClick={() => setStatusFilter(statusFilter === 'ARCHIVED' ? 'ALL' : 'ARCHIVED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'ARCHIVED'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Archived</span>
          </button>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortBy(field);
              setSortDir(direction);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="createdAt-DESC">Newest First</option>
            <option value="createdAt-ASC">Oldest First</option>
            <option value="name-ASC">Name (A-Z)</option>
            <option value="name-DESC">Name (Z-A)</option>
            <option value="progress-DESC">Progress (High-Low)</option>
            <option value="endDate-ASC">End Date (Soon)</option>
          </select>

          {/* View Toggle */}
          <div className="flex gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700">
            <button
              onClick={() => toggleViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => toggleViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Archive className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search' : 'Get started by creating a new project'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
              >
                <Plus className="w-5 h-5" />
                Create Project
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEditClick}
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProjects.map((project) => (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    onEdit={handleEditClick}
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {projects.length} of {pagination.totalElements} projects
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 0}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages - 1}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditModal && selectedProject && (
        <EditProjectModal
          project={selectedProject}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default Projects;