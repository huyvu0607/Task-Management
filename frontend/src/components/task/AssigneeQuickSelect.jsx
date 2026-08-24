import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, X, Check } from 'lucide-react';
import { teamApi } from '../../api/teamApi';

/**
 * Component để quick edit assignees
 */
const AssigneeQuickSelect = ({ 
  projectId, 
  currentAssignees = [], 
  onUpdate, 
  onClose 
}) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(
    currentAssignees.map(a => a.userId)
  );
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchProjectMembers();
  }, [projectId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const fetchProjectMembers = async () => {
    // TODO: Implement API call để lấy members của project
    // Tạm thời dùng teamApi
    setLoading(false);
  };

  const handleToggleMember = (userId) => {
    setSelectedIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = () => {
    onUpdate(selectedIds);
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 mt-1 w-64 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          Assign Members
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Members List */}
      <div className="max-h-60 overflow-y-auto py-1">
        {loading ? (
          <div className="px-3 py-4 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : members.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-gray-500">
            No members available
          </div>
        ) : (
          members.map((member) => (
            <button
              key={member.userId}
              onClick={() => handleToggleMember(member.userId)}
              className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {member.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name */}
              <span className="flex-1 text-left text-sm text-gray-900 dark:text-white">
                {member.fullName}
              </span>

              {/* Checkbox */}
              {selectedIds.includes(member.userId) && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AssigneeQuickSelect;