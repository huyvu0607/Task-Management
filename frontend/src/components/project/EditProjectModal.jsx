import { useState, useEffect, useRef } from 'react';
import { X, Calendar, ChevronDown } from 'lucide-react';
import { projectApi } from '../../api/projectApi';

const EditProjectModal = ({ project, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endDate: '',
    status: 'ACTIVE',
    color: '#3B82F6'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const colorDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  const colors = [
    { name: 'Xanh dương', value: '#3B82F6' },
    { name: 'Xanh lá', value: '#10B981' },
    { name: 'Vàng', value: '#F59E0B' },
    { name: 'Đỏ', value: '#EF4444' },
    { name: 'Tím', value: '#8B5CF6' },
    { name: 'Hồng', value: '#EC4899' },
  ];

  const statuses = [
    { label: 'Đang hoạt động', value: 'ACTIVE', dotColor: '#10B981' },
    { label: 'Tạm dừng', value: 'ON_HOLD', dotColor: '#F59E0B' },
    { label: 'Hoàn thành', value: 'COMPLETED', dotColor: '#6B7280' },
  ];

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        endDate: project.endDate || '',
        status: project.status || 'ACTIVE',
        color: project.color || '#3B82F6'
      });
    }
  }, [project]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target)) {
        setShowColorDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleColorSelect = (color) => {
    setFormData(prev => ({ ...prev, color }));
    setShowColorDropdown(false);
  };

  const handleStatusSelect = (status) => {
    setFormData(prev => ({ ...prev, status }));
    setShowStatusDropdown(false);
  };

  const getSelectedColor = () => {
    return colors.find(c => c.value === formData.color) || colors[0];
  };

  const getSelectedStatus = () => {
    return statuses.find(s => s.value === formData.status) || statuses[0];
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên dự án không được để trống';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Tên dự án phải có ít nhất 3 ký tự';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Tên dự án không được quá 100 ký tự';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Mô tả không được quá 500 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await projectApi.updateProject(project.id, formData);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setErrors({ submit: result.message });
      }
    } catch (error) {
      console.error('Update project error:', error);
      setErrors({ submit: 'Không thể cập nhật dự án, vui lòng thử lại' });
    } finally {
      setLoading(false);
    }
  };

  const selectedColor = getSelectedColor();
  const selectedStatus = getSelectedStatus();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Chỉnh Sửa Dự Án
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên dự án <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên dự án..."
              maxLength={100}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
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
              placeholder="Nhập mô tả dự án..."
              rows="3"
              maxLength={500}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all resize-none ${
                errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Color and Status Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Color Dropdown */}
            <div ref={colorDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Màu sắc
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorDropdown(!showColorDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: selectedColor.value }}
                    />
                    <span className="text-sm">{selectedColor.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showColorDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showColorDropdown && (
                  <div className="fixed inset-0 z-50" onClick={() => setShowColorDropdown(false)}>
                    <div 
                      className="absolute bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden animate-fadeIn"
                      style={{
                        top: colorDropdownRef.current?.getBoundingClientRect().bottom + 4,
                        left: colorDropdownRef.current?.getBoundingClientRect().left,
                        width: colorDropdownRef.current?.getBoundingClientRect().width,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => handleColorSelect(color.value)}
                          className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                            formData.color === color.value ? 'bg-gray-50 dark:bg-gray-600' : ''
                          }`}
                        >
                          {formData.color === color.value && (
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: color.value }}
                          />
                          <span className="text-sm text-gray-900 dark:text-white">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Dropdown */}
            <div ref={statusDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: selectedStatus.dotColor }}
                    />
                    <span className="text-sm">{selectedStatus.label}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showStatusDropdown && (
                  <div className="fixed inset-0 z-50" onClick={() => setShowStatusDropdown(false)}>
                    <div 
                      className="absolute bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl overflow-hidden animate-fadeIn"
                      style={{
                        top: statusDropdownRef.current?.getBoundingClientRect().bottom + 4,
                        left: statusDropdownRef.current?.getBoundingClientRect().left,
                        width: statusDropdownRef.current?.getBoundingClientRect().width,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {statuses.map((status) => (
                        <button
                          key={status.value}
                          type="button"
                          onClick={() => handleStatusSelect(status.value)}
                          className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                            formData.status === status.value ? 'bg-gray-50 dark:bg-gray-600' : ''
                          }`}
                        >
                          {formData.status === status.value && (
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: status.dotColor }}
                          />
                          <span className="text-sm text-gray-900 dark:text-white">{status.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ngày hết hạn <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Cập Nhật'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;