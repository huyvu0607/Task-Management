import React, { useState, useEffect, useRef } from 'react';
import { Tag, X, Check, Plus } from 'lucide-react';

/**
 * Component để quick add/remove labels
 */
const LabelQuickAdd = ({ 
  projectId, 
  currentLabels = [], 
  onUpdate, 
  onClose 
}) => {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(
    currentLabels.map(l => l.id)
  );
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');
  const dropdownRef = useRef(null);

  const predefinedColors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#6366F1', '#8B5CF6', '#EC4899', '#6B7280'
  ];

  useEffect(() => {
    fetchProjectLabels();
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

  const fetchProjectLabels = async () => {
    // TODO: Implement API call để lấy labels của project
    setLoading(false);
  };

  const handleToggleLabel = (labelId) => {
    setSelectedIds(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;

    // TODO: Implement API call để tạo label mới
    const newLabel = {
      id: Date.now(),
      name: newLabelName,
      color: newLabelColor,
    };

    setLabels(prev => [...prev, newLabel]);
    setSelectedIds(prev => [...prev, newLabel.id]);
    setNewLabelName('');
    setShowCreateNew(false);
  };

  const handleSave = () => {
    const selectedLabels = labels.filter(l => selectedIds.includes(l.id));
    onUpdate(selectedLabels);
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
          Labels
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Labels List */}
      <div className="max-h-60 overflow-y-auto py-1">
        {loading ? (
          <div className="px-3 py-4 text-center text-sm text-gray-500">
            Loading...
          </div>
        ) : (
          <>
            {labels.map((label) => (
              <button
                key={label.id}
                onClick={() => handleToggleLabel(label.id)}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {/* Color indicator */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: label.color }}
                />

                {/* Label name */}
                <span className="flex-1 text-left text-sm text-gray-900 dark:text-white">
                  {label.name}
                </span>

                {/* Checkbox */}
                {selectedIds.includes(label.id) && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}

            {labels.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                No labels yet
              </div>
            )}
          </>
        )}
      </div>

      {/* Create New Label */}
      {showCreateNew ? (
        <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <input
            type="text"
            placeholder="Label name"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          
          {/* Color picker */}
          <div className="flex gap-1">
            {predefinedColors.map((color) => (
              <button
                key={color}
                onClick={() => setNewLabelColor(color)}
                className={`w-6 h-6 rounded-full border-2 ${
                  newLabelColor === color 
                    ? 'border-gray-900 dark:border-white' 
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateNew(false)}
              className="flex-1 px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateLabel}
              className="flex-1 px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreateNew(true)}
          className="w-full px-3 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
        >
          <Plus className="w-4 h-4" />
          Create new label
        </button>
      )}

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

export default LabelQuickAdd;