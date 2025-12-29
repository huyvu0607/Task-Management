import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, change, changeLabel, icon: Icon, iconBgColor, iconColor }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 group-hover:scale-105 transition-transform">
            {value}
          </h3>
          
          {change !== undefined && (
            <div className="flex items-center mt-2 space-x-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500 group-hover:animate-bounce" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 group-hover:animate-bounce" />
              )}
              <span className={`text-sm font-medium ${
                isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {isPositive ? '+' : ''}{change}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {changeLabel}
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${iconBgColor} group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;

// Card thống kê
// Hiển thị các số liệu tổng quan:

// 📊 Tiêu đề (Total Tasks, In Progress, Overdue, Completed)
// 🔢 Giá trị lớn (số tasks)
// 📈 Xu hướng (TrendingUp/Down icon)

// Màu xanh nếu tăng (+12)
// Màu đỏ nếu giảm (-5)


// 📝 Label phụ ("from last month", "due today"...)
// 🎨 Icon với background màu khác nhau