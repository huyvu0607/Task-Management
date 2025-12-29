// frontend/src/components/team/RoleFilter.jsx
import React, { useMemo } from 'react';

const RoleFilter = ({ selectedRole, onRoleChange, members }) => {
  // Lấy danh sách roles duy nhất từ members và đếm số lượng
  const roleStats = useMemo(() => {
    const stats = { ALL: members.length };
    
    members.forEach(member => {
      if (member.role) {
        stats[member.role] = (stats[member.role] || 0) + 1;
      }
    });
    
    return stats;
  }, [members]);

  // Tạo danh sách roles từ members (dynamic)
  const roles = useMemo(() => {
    const uniqueRoles = ['ALL', ...new Set(members.map(m => m.role).filter(Boolean))];
    return uniqueRoles;
  }, [members]);

  // Nếu không có members hoặc chỉ có 1 role (ALL), không hiển thị filter
  if (roles.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {roles.map((role) => (
        <button
          key={role}
          onClick={() => onRoleChange(role)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedRole === role
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {role === 'ALL' ? 'Tất cả' : role}
          <span className="ml-2 opacity-60">({roleStats[role] || 0})</span>
        </button>
      ))}
    </div>
  );
};

export default RoleFilter;