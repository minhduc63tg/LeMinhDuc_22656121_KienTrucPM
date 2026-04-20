// src/pages/BookingsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { bookingApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_CFG = {
  PENDING:   { label: 'Đang xử lý',    color: '#fbbf24', bg: 'rgba(251,191,36,0.15)',  dot: '🔄' },
  CONFIRMED: { label: 'Đã xác nhận',   color: '#4ade80', bg: 'rgba(34,197,94,0.15)',   dot: '✅' },
  CANCELLED: { label: 'Đã huỷ',        color: '#f87171', bg: 'rgba(248,113,113,0.15)', dot: '❌' },
};

export default function BookingsPage({ refreshKey }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await bookingApi.getAll(user.role === 'ADMIN' ? undefined : user.id);
      setBookings(r.data.data);
    } catch { toast.error('Không thể tải danh sách vé'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load, refreshKey]);

  // Auto-refresh mỗi 3s để cập nhật trạng thái sau khi event được xử lý
  useEffect(() => {
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center">
        <div className="text-5xl mb-3 animate-pulse">🎟️</div>
        <p>Đang tải vé...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {user.role === 'ADMIN' ? 'Tất cả đặt vé' : 'Vé của tôi'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{bookings.length} vé · Tự động cập nhật</p>
        </div>
        <button onClick={load} className="text-sm text-purple-400 hover:text-purple-300 cursor-pointer">
          ↻ Làm mới
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-3">🎟️</div>
          <p>Chưa có vé nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => <BookingCard key={b.id} booking={b} />)}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking: b }) {
  const cfg = STATUS_CFG[b.status] || STATUS_CFG.PENDING;
  return (
    <div className="rounded-2xl p-4 transition-all"
      style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{b.moviePoster}</span>
          <div>
            <p className="font-semibold text-white">{b.movieTitle}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {b.bookingCode} · {b.showTime} · {b.seats} ghế
            </p>
            {b.userName && (
              <p className="text-xs text-gray-500">{b.userName}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs px-2 py-1 rounded-full font-medium"
            style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.dot} {cfg.label}
          </span>
          <p className="text-sm font-bold mt-2" style={{ color: '#a78bfa' }}>
            {b.totalAmount?.toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      {b.status === 'PENDING' && (
        <div className="mt-3 flex items-center gap-2 text-xs text-yellow-400">
          <span className="animate-spin">⚙️</span>
          <span>Payment Service đang xử lý qua RabbitMQ...</span>
        </div>
      )}
    </div>
  );
}
