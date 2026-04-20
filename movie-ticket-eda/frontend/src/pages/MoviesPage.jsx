// src/pages/MoviesPage.jsx
import { useState, useEffect } from 'react';
import { movieApi, bookingApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  SHOWING:     { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80', label: 'Đang chiếu' },
  COMING_SOON: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24', label: 'Sắp chiếu' },
};

export default function MoviesPage({ onBookingCreated }) {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // movie for booking modal
  const [bookingForm, setBookingForm] = useState({ showTime: '', seats: 1 });
  const [booking, setBooking] = useState(false);

  useEffect(() => { loadMovies(); }, []);

  const loadMovies = async () => {
    try {
      const r = await movieApi.getAll();
      setMovies(r.data.data);
    } catch { toast.error('Không thể tải danh sách phim'); }
    finally { setLoading(false); }
  };

  const handleBook = async () => {
    if (!bookingForm.showTime) return toast.error('Vui lòng chọn giờ chiếu');
    setBooking(true);
    try {
      const r = await bookingApi.create({
        userId: user.id,
        movieId: selected.id,
        showTime: bookingForm.showTime,
        seats: bookingForm.seats,
      });
      toast.success('🎟️ Đặt vé thành công! Đang xử lý thanh toán qua event...');
      setSelected(null);
      onBookingCreated?.(r.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt vé thất bại');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center text-gray-400">
        <div className="text-5xl mb-3 animate-bounce">🎬</div>
        <p>Đang tải phim...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Lịch chiếu phim</h2>
        <p className="text-gray-400 mt-1">{movies.length} bộ phim đang cập nhật</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie}
            onBook={() => { setSelected(movie); setBookingForm({ showTime: movie.showTimes[0], seats: 1 }); }} />
        ))}
      </div>

      {/* Booking Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-start gap-4 mb-5">
              <span className="text-5xl">{selected.poster}</span>
              <div>
                <h3 className="text-lg font-bold text-white">{selected.title}</h3>
                <p className="text-sm text-gray-400">{selected.genre} · {selected.duration} phút</p>
                <p className="text-purple-400 font-semibold mt-1">{selected.price?.toLocaleString('vi-VN')}đ / ghế</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Chọn giờ chiếu</label>
                <div className="flex flex-wrap gap-2">
                  {selected.showTimes.map((t) => (
                    <button key={t} onClick={() => setBookingForm({ ...bookingForm, showTime: t })}
                      className="px-3 py-2 rounded-xl text-sm font-medium transition cursor-pointer"
                      style={{
                        background: bookingForm.showTime === t ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.07)',
                        color: bookingForm.showTime === t ? '#a78bfa' : '#9ca3af',
                        border: bookingForm.showTime === t ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(255,255,255,0.1)',
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Số ghế</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setBookingForm({ ...bookingForm, seats: Math.max(1, bookingForm.seats - 1) })}
                    className="w-10 h-10 rounded-xl text-lg font-bold text-white cursor-pointer transition"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>−</button>
                  <span className="text-xl font-bold text-white w-8 text-center">{bookingForm.seats}</span>
                  <button onClick={() => setBookingForm({ ...bookingForm, seats: Math.min(10, bookingForm.seats + 1) })}
                    className="w-10 h-10 rounded-xl text-lg font-bold cursor-pointer transition"
                    style={{ background: 'rgba(124,58,237,0.3)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.5)' }}>+</button>
                </div>
              </div>

              <div className="flex justify-between text-sm py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <span className="text-gray-400">Tổng tiền</span>
                <span className="text-white font-bold text-lg">
                  {(selected.price * bookingForm.seats).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setSelected(null)}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-400 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Huỷ
              </button>
              <button onClick={handleBook} disabled={booking}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                {booking ? 'Đang đặt...' : '🎟️ Đặt vé'}
              </button>
            </div>

            <p className="text-xs text-center mt-3 text-gray-500">
              ⚡ Sẽ publish event <code className="text-purple-400">BOOKING_CREATED</code> → Payment Service
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MovieCard({ movie, onBook }) {
  const sc = STATUS_COLORS[movie.status] || STATUS_COLORS.SHOWING;
  return (
    <div className="rounded-2xl overflow-hidden transition-transform hover:-translate-y-1"
      style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Poster */}
      <div className="h-40 flex items-center justify-center text-7xl"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.15))' }}>
        {movie.poster}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-white text-sm flex-1 leading-tight">{movie.title}</h3>
          <span className="text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0"
            style={{ background: sc.bg, color: sc.text }}>
            {sc.label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span>🎭 {movie.genre}</span>
          <span>⏱ {movie.duration}p</span>
          <span>⭐ {movie.rating}</span>
        </div>

        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{movie.description}</p>

        <div className="flex items-center justify-between">
          <span className="font-bold" style={{ color: '#a78bfa' }}>
            {movie.price?.toLocaleString('vi-VN')}đ
          </span>
          <button onClick={onBook} disabled={movie.status !== 'SHOWING'}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            {movie.status === 'SHOWING' ? 'Đặt vé' : 'Sắp chiếu'}
          </button>
        </div>
      </div>
    </div>
  );
}
