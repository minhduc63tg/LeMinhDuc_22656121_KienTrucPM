// src/App.jsx
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FoodsPage from './pages/FoodsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import Navbar from './components/Navbar';
import OrderSuccessModal from './components/OrderSuccessModal';
import { paymentApi } from './api/services';
import toast from 'react-hot-toast';

function AppInner() {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [page, setPage] = useState('foods');
  const [successOrder, setSuccessOrder] = useState(null);
  const [paying, setPaying] = useState(false);

  if (!user) {
    return authMode === 'login'
      ? <LoginPage onSwitch={() => setAuthMode('register')} />
      : <RegisterPage onSwitch={() => setAuthMode('login')} />;
  }

  const handleOrderSuccess = (order) => {
    setSuccessOrder(order);
    setPage('orders');
  };

  const handlePayNow = async (order) => {
    setPaying(true);
    try {
      await paymentApi.process({ orderId: order.id, method: order.paymentMethod });
      toast.success('Thanh toán ' + order.orderCode + ' thành công! 🎉');
      setSuccessOrder(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thanh toán thất bại');
    } finally {
      setPaying(false);
    }
  };

  const renderPage = () => {
    switch (page) {
      case 'foods':  return <FoodsPage />;
      case 'cart':   return <CartPage onOrderSuccess={handleOrderSuccess} />;
      case 'orders': return <OrdersPage />;
      case 'admin':  return user.role === 'ADMIN' ? <AdminPage /> : <FoodsPage />;
      default:       return <FoodsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activePage={page} setPage={setPage} />
      <main>{renderPage()}</main>
      {successOrder && (
        <OrderSuccessModal
          order={successOrder}
          onPay={handlePayNow}
          onClose={() => setSuccessOrder(null)}
          paying={paying}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: '14px' },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          }}
        />
        <AppInner />
      </CartProvider>
    </AuthProvider>
  );
}
