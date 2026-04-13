// src/components/Navbar.jsx
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ activePage, setPage }) {
  const { user, logout } = useAuth();
  const { count } = useCart();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => setPage('foods')} className="flex items-center gap-2 cursor-pointer">
          <span className="text-2xl">🍜</span>
          <span className="text-xl font-bold text-orange-600">MiniFood</span>
        </button>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <NavBtn active={activePage === 'foods'} onClick={() => setPage('foods')}>
            🍽️ Thực đơn
          </NavBtn>
          <NavBtn active={activePage === 'orders'} onClick={() => setPage('orders')}>
            📋 Đơn hàng
          </NavBtn>
          {user?.role === 'ADMIN' && (
            <NavBtn active={activePage === 'admin'} onClick={() => setPage('admin')}>
              ⚙️ Quản lý
            </NavBtn>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <button
            onClick={() => setPage('cart')}
            className="relative p-2 rounded-xl hover:bg-orange-50 transition cursor-pointer"
          >
            <span className="text-xl">🛒</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </button>

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
              <p className="text-xs text-orange-500">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="text-xs bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 px-3 py-2 rounded-xl transition cursor-pointer"
            >
              Thoát
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
        active
          ? 'bg-orange-500 text-white'
          : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
      }`}
    >
      {children}
    </button>
  );
}
