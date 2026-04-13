// src/pages/LoginPage.jsx
import { useState } from 'react';
import { userApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userApi.login(form);
      login(res.data.data);
      toast.success(`Chào mừng ${res.data.data.name}! 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🍜</div>
          <h1 className="text-3xl font-bold text-orange-600">MiniFood</h1>
          <p className="text-gray-500 mt-1">Hệ thống đặt món nội bộ</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Đăng nhập</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                placeholder="email@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <button onClick={onSwitch} className="text-orange-500 font-medium hover:underline cursor-pointer">
              Đăng ký
            </button>
          </div>

          {/* Demo hint */}
          <div className="mt-6 p-3 bg-orange-50 rounded-xl text-xs text-gray-500">
            <p className="font-medium text-gray-600 mb-1">Tài khoản demo:</p>
            <p>Admin: <span className="font-mono">admin@food.com / admin123</span></p>
            <p>User: <span className="font-mono">user@food.com / user123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
