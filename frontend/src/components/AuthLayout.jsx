import { CheckSquare } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle, leftContent }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 p-12 flex-col justify-center items-center">
        <div className="text-center w-full">
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="bg-black rounded-xl p-2.5">
              <CheckSquare className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold">TaskFlow</span>
          </div>

          <div className="space-y-6 mb-16">
            <h1 className="text-4xl font-bold text-gray-900">
              {title}
            </h1>
            <p className="text-base text-gray-600 max-w-md mx-auto">
              {subtitle}
            </p>
          </div>

          {leftContent}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="bg-black rounded-xl p-2">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">TaskFlow</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;