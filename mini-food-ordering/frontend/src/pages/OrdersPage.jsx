// src/pages/OrdersPage.jsx
import { useState, useEffect } from 'react';
import { orderApi, paymentApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING:  { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700' },
  PAID:     { label: 'Đã thanh toán',  color: 'bg-green-100 text-green-700'  },
  CANCELLED:{ label: 'Đã huỷ',         color: 'bg-red-100 text-red-600'      },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const res = await orderApi.getAll(user.role === 'ADMIN' ? undefined : user.id);
      setOrders(res.data.data.slice().reverse());
    } catch {
      toast.error('Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (order) => {
    setPayingId(order.id);
    try {
      await paymentApi.process({ orderId: order.id, method: order.paymentMethod });
      toast.success(`Thanh toán ${order.orderCode} thành công! 🎉`);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thanh toán thất bại');
    } finally {
      setPayingId(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">📋</div>
        <p className="text-gray-500">Đang tải đơn hàng...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Đơn hàng</h2>
          <p className="text-gray-500 text-sm mt-1">
            {user.role === 'ADMIN' ? 'Tất cả đơn hàng' : 'Đơn hàng của bạn'}
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="text-sm text-orange-500 hover:text-orange-600 font-medium cursor-pointer"
        >
          ↻ Làm mới
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p>Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPay={handlePay}
              paying={payingId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onPay, paying }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg">
            🧾
          </div>
          <div>
            <p className="font-semibold text-gray-800">{order.orderCode}</p>
            <p className="text-xs text-gray-400">{order.userName} · {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${cfg.color}`}>
            {cfg.label}
          </span>
          <span className="font-bold text-orange-600">{order.totalAmount.toLocaleString()}đ</span>
          <span className="text-gray-400 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <div className="pt-3 space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name} × {item.quantity}</span>
                <span className="font-medium text-gray-800">{item.subtotal.toLocaleString()}đ</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 mt-3 pt-3 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span className="mr-3">💳 {order.paymentMethod}</span>
            </div>
            {order.status === 'PENDING' && (
              <button
                onClick={() => onPay(order)}
                disabled={paying}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                {paying ? 'Đang xử lý...' : '💳 Thanh toán'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
