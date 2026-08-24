import React, { useState, useEffect, useRef } from 'react';
import { X, Check, ChevronDown } from 'lucide-react';
import { taskApi } from '../../api/taskApi';
import { useToast } from '../ui/Toast';

/**
 * Modal tạo task mới - Updated với phong cách CreateTaskFromSidebar
 */
const CreateTaskModal = ({ isOpen, onClose, projectId, initialStatus = 'TODO', teamMembers = [] }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    projectId: projectId,
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: initialStatus,
    dueDate: '',
    assigneeIds: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề task');
      return;
    }

    setLoading(true);
    const result = await taskApi.createTask(formData);

    if (result.success) {
      toast.success('Tạo task thành công');
      onClose(true);
      resetForm();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      projectId: projectId,
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: initialStatus,
      dueDate: '',
      assigneeIds: [],
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAssignee = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter((id) => id !== userId)
        : [...prev.assigneeIds, userId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh] animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tạo Task Mới
          </h2>
          <button
            onClick={() => {
              onClose(false);
              resetForm();
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - Scrollable content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Nhập tiêu đề task..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-shadow"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Nhập mô tả chi tiết..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none transition-shadow"
              />
            </div>

            {/* Priority, Status & Due Date */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Độ ưu tiên
                </label>
                <CustomSelect
                  value={formData.priority}
                  onChange={(value) => handleChange('priority', value)}
                  options={[
                    { value: 'LOW', label: 'Thấp', color: '#6B7280' },
                    { value: 'MEDIUM', label: 'Trung bình', color: '#3B82F6' },
                    { value: 'HIGH', label: 'Cao', color: '#F59E0B' },
                    { value: 'URGENT', label: 'Khẩn cấp', color: '#EF4444' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trạng thái
                </label>
                <CustomSelect
                  value={formData.status}
                  onChange={(value) => handleChange('status', value)}
                  options={[
                    { value: 'TODO', label: 'To Do' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'DONE', label: 'Done' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hạn chót
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* Assignees */}
            {teamMembers.length > 0 && (
              <div className="animate-slideDown">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Người thực hiện
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                  {teamMembers.map((member) => (
                    <label
                      key={member.userId}
                      className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-all hover:shadow-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formData.assigneeIds.includes(member.userId)}
                        onChange={() => toggleAssignee(member.userId)}
                        className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img
                          src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName || member.username)}&background=random`}
                          alt={member.fullName || member.username}
                          className="w-7 h-7 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-gray-800"
                        />
                        <span className="text-sm text-gray-900 dark:text-white truncate">
                          {member.fullName || member.username}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose(false);
              resetForm();
            }}
            className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                Đang tạo...
              </span>
            ) : (
              'Tạo Task'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Select Component with Fixed Positioning
const CustomSelect = ({ value, onChange, options, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = Math.min(240, options.length * 44);
      
      const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      
      setDropdownStyle({
        position: 'fixed',
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        top: showAbove ? 'auto' : `${rect.bottom + 8}px`,
        bottom: showAbove ? `${window.innerHeight - rect.top + 8}px` : 'auto',
        zIndex: 9999,
      });
    }
  }, [isOpen, options.length]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-left flex items-center justify-between hover:border-gray-400 dark:hover:border-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
        >
          <span className="flex items-center gap-2">
            {selectedOption?.color && (
              <span 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedOption.color }}
              />
            )}
            <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
              {selectedOption?.label || placeholder}
            </span>
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div 
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-slideDown"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ${
                value === option.value ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                {option.color && (
                  <span 
                    className="w-3 h-3 rounded-full flex-shrink-0 transition-transform hover:scale-110"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <span className="text-sm text-gray-900 dark:text-white">{option.label}</span>
              </span>
              {value === option.value && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-fadeIn" />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default CreateTaskModal;