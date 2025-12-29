import { Calendar, MoreVertical, Edit, Archive, ArchiveRestore } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project, onEdit, onArchive, onUnarchive }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: { 
        bg: 'bg-green-100 dark:bg-green-900/30', 
        text: 'text-green-700 dark:text-green-400',
        label: 'Active'
      },
      COMPLETED: { 
        bg: 'bg-gray-100 dark:bg-gray-700', 
        text: 'text-gray-700 dark:text-gray-300',
        label: 'Completed'
      },
      ON_HOLD: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-700 dark:text-yellow-400',
        label: 'On Hold'
      },
      ARCHIVED: { 
        bg: 'bg-gray-100 dark:bg-gray-800', 
        text: 'text-gray-700 dark:text-gray-400',
        label: 'Archived'
      }
    };
    return badges[status] || badges.ACTIVE;
  };

  const statusBadge = getStatusBadge(project.status);

  const getProgressColor = (progress) => {
    const p = parseFloat(progress || 0);
    if (p >= 75) return 'bg-green-500';
    if (p >= 50) return 'bg-blue-500';
    if (p >= 25) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Navigate to project tasks page
  const handleCardClick = (e) => {
    // Không navigate nếu click vào menu button hoặc menu dropdown
    if (menuRef.current && menuRef.current.contains(e.target)) {
      return;
    }
    navigate(`/projects/${project.id}/tasks`);
  };

  // Lấy danh sách members từ teamMembers (Backend trả về)
  const teamMembers = project.teamMembers || [];
  
  // Hiển thị tối đa 5 members
  const displayMembers = teamMembers.slice(0, 5);
  const remainingCount = teamMembers.length > 5 ? teamMembers.length - 5 : 0;

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Color bar at top */}
      <div 
        className="h-1.5"
        style={{ backgroundColor: project.color || '#3B82F6' }}
      />

      <div className="p-5">
        {/* Header: Icon + Title + Menu */}
        <div className="flex items-start gap-3 mb-3">
          {/* Project Icon */}
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: project.color || '#3B82F6' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>

          {/* Title & Status */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-1.5">
              {project.name}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
              {statusBadge.label}
            </span>
          </div>

          {/* Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-20 overflow-hidden animate-slideDown">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(project);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                
                <div className="border-t border-gray-200 dark:border-gray-600"></div>
                
                {project.status !== 'ARCHIVED' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(project.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnarchive(project.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <ArchiveRestore className="w-4 h-4" />
                    Restore
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
          {project.description || 'No description'}
        </p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Progress</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {parseFloat(project.progress || 0).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(project.progress)}`}
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(project.startDate)}</span>
          <span className="mx-1">→</span>
          <span className={
            project.endDate && new Date(project.endDate) < new Date() && project.status === 'ACTIVE'
              ? 'text-red-600 dark:text-red-400 font-medium'
              : ''
          }>
            {formatDate(project.endDate)}
          </span>
          {project.totalTasks > 0 && (
            <>
              <span className="mx-2">•</span>
              <span>{project.totalTasks} tasks</span>
            </>
          )}
        </div>

        {/* Footer: Members */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center -space-x-2">
            {displayMembers.map((member, index) => (
              <div 
                key={member.id || index}
                className="relative group/member"
              >
                <img
                  src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName || member.username)}&background=random`}
                  alt={member.fullName || member.username}
                  className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 hover:ring-blue-500 transition-all cursor-pointer"
                  title={member.fullName || member.username}
                />
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/member:block z-10 animate-fadeIn">
                  <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg py-1.5 px-2.5 whitespace-nowrap shadow-lg">
                    {member.fullName || member.username}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {remainingCount > 0 && (
              <div 
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center"
                title={`+${remainingCount} more members`}
              >
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>

          {/* Task count or other info */}
          {project.totalTasks > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {project.completedTasks || 0}/{project.totalTasks}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;