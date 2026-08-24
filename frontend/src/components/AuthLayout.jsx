import { CheckSquare, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AuthLayout = ({ children, title, subtitle, leftContent }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex">
      {/* Theme Toggle Button - Fixed position */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-lg"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-gray-800" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-400" />
        )}
      </button>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 dark:bg-gray-800 p-12 flex-col justify-center items-center transition-colors duration-200">
        <div className="text-center w-full">
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="bg-black dark:bg-white rounded-xl p-2.5 transition-colors duration-200">
              <CheckSquare className="w-7 h-7 text-white dark:text-black" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
          </div>

          <div className="space-y-6 mb-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              {subtitle}
            </p>
          </div>

          {leftContent}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="bg-black dark:bg-white rounded-xl p-2 transition-colors duration-200">
              <CheckSquare className="w-6 h-6 text-white dark:text-black" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;