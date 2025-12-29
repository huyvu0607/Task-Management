// frontend/src/components/team/EditTeamModal.jsx
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { updateTeam } from '../../api/teamApi';
import { useToast } from '../ui/Toast';

const EditTeamModal = ({ team, onClose, onSuccess }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: team.name || '',
    description: team.description || '',
    maxMembers: team.maxMembers || 10,
    isActive: team.isActive !== undefined ? team.isActive : true // ✅ Thêm isActive
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'maxMembers' ? parseInt(value) || '' : value)
    }));
    // Clear error khi user nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên team không được để trống';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Tên team phải có ít nhất 3 ký tự';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Tên team không được quá 100 ký tự';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Mô tả không được quá 500 ký tự';
    }

    if (!formData.maxMembers || formData.maxMembers < 2) {
      newErrors.maxMembers = 'Số lượng thành viên tối thiểu là 2';
    } else if (formData.maxMembers > 100) {
      newErrors.maxMembers = 'Số lượng thành viên tối đa là 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await updateTeam(team.id, formData);
      toast.success('Cập nhật team thành công!');
      onSuccess();
    } catch (error) {
      console.error('Error updating team:', error);
      const errorMsg = error.response?.data?.message || error.message;
      
      if (errorMsg.includes('không có quyền')) {
        toast.error('Bạn không có quyền chỉnh sửa team này');
      } else if (errorMsg.includes('đã có team') || errorMsg.includes('đã tồn tại')) {
        toast.error('Tên team đã được sử dụng');
      } else {
        toast.error('Không thể cập nhật team. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Chỉnh sửa Team
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên Team <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên team..."
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-gray-500'
              }`}
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả về team của bạn..."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors resize-none ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-gray-500'
              }`}
              disabled={loading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.description.length}/500 ký tự
            </p>
          </div>

          {/* Max Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Số lượng thành viên tối đa <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              min="2"
              max="100"
              className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.maxMembers
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-gray-500'
              }`}
              disabled={loading}
            />
            {errors.maxMembers && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maxMembers}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Từ 2 đến 100 thành viên
            </p>
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-gray-700 dark:text-gray-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-gray-500 cursor-pointer"
                disabled={loading}
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Team đang hoạt động
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tắt để tạm dừng hoạt động của team
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeamModal;