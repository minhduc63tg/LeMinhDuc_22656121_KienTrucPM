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
      const r = await userApi.login(form);
      login(r.data.data);
      toast.success(`Chào mừng ${r.data.data.name}! 🎬`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎬</div>
          <h1 className="text-4xl font-bold text-white">CineTicket</h1>
          <p className="text-purple-300 mt-1">Đặt vé xem phim dễ dàng</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="text-xl font-semibold text-white mb-6">Đăng nhập</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-purple-300 mb-1">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                placeholder="email@cinema.com" required />
            </div>
            <div>
              <label className="block text-sm text-purple-300 mb-1">Mật khẩu</label>
              <input type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition cursor-pointer disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-400">
            Chưa có tài khoản?{' '}
            <button onClick={onSwitch} className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer">
              Đăng ký
            </button>
          </div>

          <div className="mt-6 p-3 rounded-xl text-xs text-gray-400" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="font-medium text-gray-300 mb-1">Demo accounts:</p>
            <p>Admin: <span className="font-mono text-purple-300">admin@cinema.com / admin123</span></p>
            <p>User: <span className="font-mono text-purple-300">user@cinema.com / user123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
