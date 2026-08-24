import { Calendar, MoreVertical, Edit, Archive, ArchiveRestore, Clock, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectListItem = ({ project, onEdit, onArchive, onUnarchive }) => {
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
        ring: 'ring-green-500/20',
        label: 'Active',
        icon: null
      },
      COMPLETED: { 
        bg: 'bg-gray-100 dark:bg-gray-700', 
        text: 'text-gray-700 dark:text-gray-300',
        ring: 'ring-gray-500/20',
        label: 'Completed',
        icon: null
      },
      ON_HOLD: { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-700 dark:text-yellow-400',
        ring: 'ring-yellow-500/20',
        label: 'On Hold',
        icon: Clock
      },
      ARCHIVED: { 
        bg: 'bg-gray-100 dark:bg-gray-800', 
        text: 'text-gray-700 dark:text-gray-400',
        ring: 'ring-gray-500/20',
        label: 'Archived',
        icon: Archive
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
    return 'bg-red-500';
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

  const isOverdue = (endDate, status) => {
    if (!endDate || status !== 'ACTIVE') return false;
    return new Date(endDate) < new Date();
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(project.endDate);
  const overdue = isOverdue(project.endDate, project.status);

  // Navigate to project tasks page
  const handleRowClick = (e) => {
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
      onClick={handleRowClick}
      className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-center gap-4 p-4">
        {/* Color indicator */}
        <div 
          className="w-1 h-20 rounded-full flex-shrink-0 transition-all"
          style={{ backgroundColor: project.color || '#3B82F6' }}
        />

        {/* Project info - Responsive Grid */}
        <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* Name & Status - 3 cols */}
          <div className="lg:col-span-3 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-1.5 transition-colors">
              {project.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${statusBadge.bg} ${statusBadge.text} ${statusBadge.ring}`}>
                {statusBadge.icon && <statusBadge.icon className="w-3 h-3" />}
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* Description - 2 cols */}
          <div className="lg:col-span-2 min-w-0 hidden md:block">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {project.description || 'No description'}
            </p>
          </div>

          {/* Progress - 2 cols */}
          <div className="lg:col-span-2 flex items-center">
            <div className="flex-1">
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
          </div>

          {/* Date - 2 cols */}
          <div className="lg:col-span-2 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(project.endDate)}</span>
            </div>
            {daysRemaining !== null && project.status === 'ACTIVE' && (
              <div className={`flex items-center gap-1.5 text-xs ${
                overdue ? 'text-red-600 dark:text-red-400 font-semibold' : 
                daysRemaining <= 7 ? 'text-yellow-600 dark:text-yellow-400' : 
                'text-gray-600 dark:text-gray-400'
              }`}>
                {overdue ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Overdue {Math.abs(daysRemaining)}d</span>
                  </>
                ) : daysRemaining === 0 ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due today</span>
                  </>
                ) : daysRemaining <= 7 ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{daysRemaining}d left</span>
                  </>
                ) : null}
              </div>
            )}
            {project.totalTasks > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {project.completedTasks || 0}/{project.totalTasks} tasks
              </div>
            )}
          </div>

          {/* Members - 3 cols */}
          <div className="lg:col-span-3 flex items-center justify-end">
            <div className="flex items-center -space-x-2">
              {displayMembers.map((member, index) => (
                <div 
                  key={member.id || index}
                  className="relative group/member"
                >
                  <img
                    src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName || member.username)}&background=random`}
                    alt={member.fullName || member.username}
                    className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 transition-all cursor-pointer"
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/member:block z-10 animate-fadeIn pointer-events-none">
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
                  className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center transition-all cursor-pointer"
                  title={`+${remainingCount} more members`}
                >
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-20 overflow-hidden animate-slideDown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <ArchiveRestore className="w-4 h-4" />
                  Restore
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectListItem;