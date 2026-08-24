// frontend/src/components/team/TeamMemberGrid.jsx
import React from 'react';
import TeamMemberCard from './TeamMemberCard';
import { Users } from 'lucide-react';

const TeamMemberGrid = ({ members, loading, onMemberUpdate, userRole }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Không tìm thấy thành viên
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
          Không có thành viên nào phù hợp với bộ lọc của bạn. Thử thay đổi bộ lọc hoặc mời thêm thành viên mới.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <TeamMemberCard
          key={member.id}
          member={member}
          onUpdate={onMemberUpdate}
          userRole={userRole}
          allMembers={members}
        />
      ))}
    </div>
  );
};

export default TeamMemberGrid;