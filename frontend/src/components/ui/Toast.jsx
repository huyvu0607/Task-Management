import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Toast Component with Swipe
const Toast = ({ id, message, type, duration, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const toastRef = useRef(null);
  const startXRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    timerRef.current = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX - dragX;
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - startXRef.current;
    if (newX > 0) {
      setDragX(newX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    if (dragX > 100) {
      handleClose();
    } else {
      setDragX(0);
      timerRef.current = setTimeout(() => {
        handleClose();
      }, duration / 2);
    }
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX - dragX;
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const newX = e.touches[0].clientX - startXRef.current;
    if (newX > 0) {
      setDragX(newX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (dragX > 100) {
      handleClose();
    } else {
      setDragX(0);
      timerRef.current = setTimeout(() => {
        handleClose();
      }, duration / 2);
    }
  };

  const config = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
    },
    error: {
      icon: XCircle,
      iconColor: 'text-red-600 dark:text-red-400',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  };

  const { icon: Icon, iconColor } = config[type];
  const opacity = Math.max(0, 1 - dragX / 200);

  return (
    <div
      ref={toastRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${isVisible ? dragX : 400}px)`,
        opacity: isVisible ? opacity : 0,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
      }}
      className={`
        flex items-center gap-3 min-w-[280px] max-w-md px-4 py-3 rounded-lg 
        bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700
        pointer-events-auto cursor-grab active:cursor-grabbing select-none
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
      <p className="flex-1 text-sm text-gray-900 dark:text-white">{message}</p>
    </div>
  );
};