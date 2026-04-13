// src/components/OrderSuccessModal.jsx
export default function OrderSuccessModal({ order, onPay, onClose, paying }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="text-xl font-bold text-gray-800">Đặt hàng thành công!</h3>
        <p className="text-gray-500 text-sm mt-1 mb-4">Mã đơn: <span className="font-mono font-semibold text-orange-600">{order.orderCode}</span></p>

        <div className="bg-gray-50 rounded-xl p-4 text-left mb-5 space-y-1">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.name} × {item.quantity}</span>
              <span className="font-medium">{item.subtotal.toLocaleString()}đ</span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
            <span>Tổng</span>
            <span className="text-orange-600">{order.totalAmount.toLocaleString()}đ</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
          >
            Xem sau
          </button>
          <button
            onClick={() => onPay(order)}
            disabled={paying}
            className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition cursor-pointer"
          >
            {paying ? 'Đang xử lý...' : '💳 Thanh toán ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}
