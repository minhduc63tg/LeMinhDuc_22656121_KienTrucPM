// src/components/Navbar.jsx
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activePage, setPage, notifCount }) {
  const { user, logout } = useAuth();

  const navItems = [
    { key: 'movies', label: '🎬 Phim', show: true },
    { key: 'bookings', label: '🎟️ Vé của tôi', show: true },
    { key: 'events', label: '⚡ Event Log', show: true },
    { key: 'admin', label: '⚙️ Quản lý', show: user?.role === 'ADMIN' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b" style={{
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(20px)',
      borderColor: 'rgba(255,255,255,0.08)',
    }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => setPage('movies')} className="flex items-center gap-2 cursor-pointer">
          <span className="text-2xl">🎬</span>
          <span className="text-xl font-bold text-white">CineTicket</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
            background: 'rgba(124,58,237,0.3)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.5)'
          }}>EDA</span>
        </button>

        {/* Nav */}
        <div className="flex items-center gap-1">
          {navItems.filter((i) => i.show).map((item) => (
            <button key={item.key} onClick={() => setPage(item.key)}
              className="relative px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer"
              style={{
                background: activePage === item.key ? 'rgba(124,58,237,0.3)' : 'transparent',
                color: activePage === item.key ? '#a78bfa' : '#9ca3af',
                border: activePage === item.key ? '1px solid rgba(124,58,237,0.5)' : '1px solid transparent',
              }}>
              {item.label}
              {item.key === 'events' && notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs" style={{ color: '#a78bfa' }}>{user?.role}</p>
          </div>
          <button onClick={logout}
            className="text-xs px-3 py-2 rounded-xl transition cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.07)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}>
            Thoát
          </button>
        </div>
      </div>
    </nav>
  );
}
