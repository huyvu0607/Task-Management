import { useAuth } from '../context/AuthContext';
import { LogOut, CheckSquare } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black rounded-xl p-2">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">TaskFlow</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">{user?.fullName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
              <CheckSquare className="w-10 h-10 text-green-600" />
            </div>
            
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Chào mừng đến với TaskFlow! 🎉
              </h1>
              <p className="text-xl text-gray-600">
                Xin chào <span className="font-semibold">{user?.fullName}</span>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-3">
                Thông tin tài khoản
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Username:</span>
                  <span className="font-medium text-blue-900">{user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Email:</span>
                  <span className="font-medium text-blue-900">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">User ID:</span>
                  <span className="font-medium text-blue-900">{user?.userId}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600">
              Dashboard chức năng sẽ được phát triển ở các phần tiếp theo.
              <br />
              Hiện tại bạn đã đăng nhập thành công! ✅
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;