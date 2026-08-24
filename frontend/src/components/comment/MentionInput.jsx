import React, { useState, useRef, useEffect } from 'react';
import { useTeam } from '../../hooks/useTeam';

/**
 * MentionInput Component
 * Textarea với @mention dropdown
 */
const MentionInput = ({ 
  value, 
  onChange, 
  placeholder = 'Write a comment...', 
  maxLength = 1000,
  className = '',
  onMentionSelect 
}) => {
  const { currentTeam } = useTeam();
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  // Get team members (giả sử có trong TeamContext)
  const teamMembers = currentTeam?.members || [];

  // Filter members based on search
  const filteredMembers = mentionSearch
    ? teamMembers.filter(member =>
        member.username?.toLowerCase().includes(mentionSearch.toLowerCase()) ||
        member.fullName?.toLowerCase().includes(mentionSearch.toLowerCase())
      )
    : teamMembers;

  // Detect @ character
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = value.substring(0, cursorPosition);
    const lastAtIndex = text.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = text.substring(lastAtIndex + 1);
      
      // Check if there's no space after @
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
        
        // Calculate dropdown position
        const rect = textarea.getBoundingClientRect();
        setMentionPosition({
          top: rect.top - 200, // Show above textarea
          left: rect.left,
        });
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  }, [value, cursorPosition]);

  // Handle text change
  const handleChange = (e) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  // Handle key down
  const handleKeyDown = (e) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === 'Escape') {
        setShowMentions(false);
        e.preventDefault();
      }
    }
  };

  // Handle mention select
  const handleMentionSelect = (member) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = value;
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);
    
    // Find last @ position
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    // Replace from @ to cursor with @username
    const newText = 
      text.substring(0, lastAtIndex) + 
      `@${member.username} ` + 
      afterCursor;

    onChange(newText);
    setShowMentions(false);

    // Notify parent about mention
    if (onMentionSelect) {
      onMentionSelect(member);
    }

    // Focus back to textarea
    setTimeout(() => {
      const newCursorPos = lastAtIndex + member.username.length + 2;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Close dropdown when click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !textareaRef.current.contains(event.target)
      ) {
        setShowMentions(false);
      }
    };

    if (showMentions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMentions]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={(e) => setCursorPosition(e.target.selectionStart)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          resize-none min-h-[100px] ${className}`}
      />

      {/* Character counter */}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
        {value.length} / {maxLength}
      </div>

      {/* Mention Dropdown */}
      {showMentions && filteredMembers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto"
          style={{
            bottom: '100%',
            marginBottom: '8px',
          }}
        >
          {filteredMembers.slice(0, 5).map((member) => (
            <button
              key={member.id}
              onClick={() => handleMentionSelect(member)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {member.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {member.fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @{member.username}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionInput;