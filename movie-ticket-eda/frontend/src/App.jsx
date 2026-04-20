// src/App.jsx
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useNotifications } from './hooks/useNotifications';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MoviesPage from './pages/MoviesPage';
import BookingsPage from './pages/BookingsPage';
import EventLogPage from './pages/EventLogPage';
import AdminPage from './pages/AdminPage';
import Navbar from './components/Navbar';

function AppInner() {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [page, setPage] = useState('movies');
  const [bookingRefreshKey, setBookingRefreshKey] = useState(0);
  const notifications = useNotifications();

  if (!user) {
    return authMode === 'login'
      ? <LoginPage onSwitch={() => setAuthMode('register')} />
      : <RegisterPage onSwitch={() => setAuthMode('login')} />;
  }

  const handleBookingCreated = () => {
    setBookingRefreshKey((k) => k + 1);
    setPage('bookings');
  };

  const renderPage = () => {
    switch (page) {
      case 'movies':   return <MoviesPage onBookingCreated={handleBookingCreated} />;
      case 'bookings': return <BookingsPage refreshKey={bookingRefreshKey} />;
      case 'events':   return <EventLogPage />;
      case 'admin':    return user.role === 'ADMIN' ? <AdminPage /> : <MoviesPage onBookingCreated={handleBookingCreated} />;
      default:         return <MoviesPage onBookingCreated={handleBookingCreated} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      <Navbar activePage={page} setPage={setPage} notifCount={notifications.length} />
      <main>{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
            background: '#1f1f2e',
            color: '#e5e7eb',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          success: { iconTheme: { primary: '#a78bfa', secondary: '#1f1f2e' } },
        }}
      />
      <AppInner />
    </AuthProvider>
  );
}
