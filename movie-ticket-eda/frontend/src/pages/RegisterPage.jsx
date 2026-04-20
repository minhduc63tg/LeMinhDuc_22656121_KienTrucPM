// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { userApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.register(form);
      const r = await userApi.login({ email: form.email, password: form.password });
      login(r.data.data);
      toast.success('Đăng ký thành công! 🎉 Event USER_REGISTERED đã được publish');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎬</div>
          <h1 className="text-4xl font-bold text-white">CineTicket</h1>
          <p className="text-purple-300 mt-1">Tạo tài khoản mới</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 className="text-xl font-semibold text-white mb-6">Đăng ký</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Họ tên', type: 'text', placeholder: 'Nguyễn Văn A' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
              { key: 'password', label: 'Mật khẩu', type: 'password', placeholder: 'Tối thiểu 6 ký tự' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm text-purple-300 mb-1">{label}</label>
                <input type={type} value={form[key]} placeholder={placeholder}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)' }}
                  required minLength={key === 'password' ? 6 : undefined} />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition cursor-pointer disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-400">
            Đã có tài khoản?{' '}
            <button onClick={onSwitch} className="text-purple-400 hover:text-purple-300 font-medium cursor-pointer">
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
