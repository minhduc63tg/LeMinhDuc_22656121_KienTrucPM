// src/pages/EventLogPage.jsx
import { useNotifications } from '../hooks/useNotifications';

const EVENT_CFG = {
  USER_REGISTERED:   { icon: '👤', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  label: 'USER_REGISTERED'   },
  BOOKING_CREATED:   { icon: '🎟️', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  label: 'BOOKING_CREATED'   },
  PAYMENT_COMPLETED: { icon: '✅', color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  label: 'PAYMENT_COMPLETED' },
  PAYMENT_FAILED:    { icon: '❌', color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'PAYMENT_FAILED'    },
};

// Luồng kiến trúc EDA để hiển thị trực quan
const ARCHITECTURE_FLOW = [
  { id: 'user',    label: 'User Service',     icon: '👤', port: '3001', color: '#60a5fa' },
  { id: 'movie',   label: 'Movie Service',    icon: '🎬', port: '3002', color: '#a78bfa' },
  { id: 'booking', label: 'Booking Service',  icon: '🎟️', port: '3003', color: '#fbbf24', core: true },
  { id: 'rabbit',  label: 'RabbitMQ Broker',  icon: '🐰', port: '5672', color: '#fb923c', broker: true },
  { id: 'payment', label: 'Payment Service',  icon: '💳', port: '3004', color: '#4ade80' },
  { id: 'notif',   label: 'Notification Svc', icon: '🔔', port: '3004', color: '#f472b6' },
];

export default function EventLogPage() {
  const notifications = useNotifications();

  const successCount = notifications.filter((n) => n.type === 'SUCCESS').length;
  const failedCount  = notifications.filter((n) => n.type === 'FAILED').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">⚡ Event-Driven Architecture Log</h2>
        <p className="text-gray-400 text-sm mt-1">
          Real-time event stream qua RabbitMQ · SSE connection
        </p>
      </div>

      {/* Architecture diagram */}
      <div className="rounded-2xl p-5" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Luồng kiến trúc</h3>
        <div className="flex flex-wrap items-center gap-2 justify-center">
          {ARCHITECTURE_FLOW.map((node, i) => (
            <div key={node.id} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl relative"
                  style={{
                    background: `${node.color}18`,
                    border: `1px solid ${node.color}40`,
                    boxShadow: node.broker ? `0 0 16px ${node.color}30` : 'none',
                  }}>
                  {node.icon}
                  {node.core && (
                    <span className="absolute -top-1 -right-1 text-xs bg-yellow-400 text-black rounded-full w-4 h-4 flex items-center justify-center font-bold">★</span>
                  )}
                </div>
                <p className="text-xs mt-1 text-center leading-tight" style={{ color: node.color }}>
                  {node.label}
                </p>
                <p className="text-xs text-gray-600">:{node.port}</p>
              </div>
              {i < ARCHITECTURE_FLOW.length - 1 && (
                <div className="text-gray-600 text-lg">
                  {i === 2 ? '📤' : i === 3 ? '📥' : '→'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Event flow legend */}
        <div className="mt-4 pt-4 border-t flex flex-wrap gap-3 justify-center"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {Object.entries(EVENT_CFG).map(([k, v]) => (
            <span key={k} className="text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5"
              style={{ background: v.bg, color: v.color, border: `1px solid ${v.color}30` }}>
              {v.icon} {v.label}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tổng Events', value: notifications.length, color: '#a78bfa' },
          { label: 'Thành công',  value: successCount,         color: '#4ade80' },
          { label: 'Thất bại',    value: failedCount,          color: '#f87171' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 text-center"
            style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Live event feed */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm font-medium text-white">Live Event Feed</span>
          </div>
          <span className="text-xs text-gray-500">Tự động cập nhật qua SSE</span>
        </div>

        {notifications.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <p className="text-4xl mb-3">📭</p>
            <p>Chưa có event nào</p>
            <p className="text-xs mt-2">Thử đặt vé để xem event flow!</p>
          </div>
        ) : (
          <div className="divide-y max-h-96 overflow-y-auto" style={{ divideColor: 'rgba(255,255,255,0.04)' }}>
            {notifications.map((n, i) => {
              const cfg = EVENT_CFG[n.event] || { icon: '📌', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', label: n.event };
              return (
                <div key={n.id || i} className="px-4 py-3 flex items-start gap-3 hover:bg-white/[0.02] transition">
                  <span className="text-xl mt-0.5 flex-shrink-0">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(n.timestamp).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
