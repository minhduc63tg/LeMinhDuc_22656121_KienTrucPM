// src/pages/CartPage.jsx
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/services';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Tiền mặt (COD)', icon: '💵' },
  { value: 'BANKING', label: 'Chuyển khoản', icon: '🏦' },
];

export default function CartPage({ onOrderSuccess }) {
  const { items, removeItem, updateQty, clearCart, total } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await orderApi.create({
        userId: user.id,
        items: items.map((i) => ({ foodId: i.foodId, quantity: i.quantity })),
        paymentMethod,
      });
      clearCart();
      toast.success('Đặt hàng thành công! 🎉');
      onOrderSuccess(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-700">Giỏ hàng trống</h2>
        <p className="text-gray-400 mt-2">Hãy chọn món từ thực đơn nhé!</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Giỏ hàng</h2>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.foodId} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <span className="text-3xl">{item.image}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{item.name}</p>
              <p className="text-orange-500 text-sm font-medium">{item.price.toLocaleString()}đ</p>
            </div>

            {/* Qty controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item.foodId, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600 cursor-pointer transition"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold text-gray-800">{item.quantity}</span>
              <button
                onClick={() => updateQty(item.foodId, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center font-bold text-orange-600 cursor-pointer transition"
              >
                +
              </button>
            </div>

            <div className="text-right min-w-16">
              <p className="font-bold text-gray-800">{(item.price * item.quantity).toLocaleString()}đ</p>
              <button
                onClick={() => removeItem(item.foodId)}
                className="text-xs text-red-400 hover:text-red-600 cursor-pointer mt-1"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment method */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <p className="font-semibold text-gray-700 mb-3">Phương thức thanh toán</p>
        <div className="flex gap-3">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setPaymentMethod(m.value)}
              className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 transition cursor-pointer ${
                paymentMethod === m.value
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200'
              }`}
            >
              <span>{m.icon}</span>
              <span className="text-sm font-medium text-gray-700">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} món)</span>
          <span>{total.toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between font-bold text-gray-800 text-lg border-t border-gray-100 pt-2">
          <span>Tổng cộng</span>
          <span className="text-orange-600">{total.toLocaleString()}đ</span>
        </div>
      </div>

      <button
        onClick={handleOrder}
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-lg transition cursor-pointer"
      >
        {loading ? 'Đang đặt hàng...' : `Đặt hàng • ${total.toLocaleString()}đ`}
      </button>
    </div>
  );
}
