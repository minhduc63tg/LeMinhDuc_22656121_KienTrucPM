import { useState, useEffect } from "react";

// TODO: Đổi IP này thành IP LAN của Máy 1 (chứa Backend)
// VD: const API_URL = "http://192.168.1.50:3000";
const API_URL = "http://192.168.1.50:3000";

const USER_ID = "user_" + Math.floor(Math.random() * 1000); // Tạo user ngẫu nhiên

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (error) {
      console.error("Lỗi khi fetch products", error);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_URL}/cart/${USER_ID}`);
      const data = await res.json();
      if (Array.isArray(data)) setCart(data);
    } catch (error) {
      console.error("Lỗi load cart", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
    // Refresh products every 3s to view stock changes on other machine
    const interval = setInterval(fetchProducts, 3000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = async (product) => {
    if (product.stock <= 0)
      return alert("Sản phẩm đã hết hàng trên giao diện!");
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: USER_ID,
          productId: product.id,
          quantity: 1,
          productName: product.name,
          price: product.price,
        }),
      });
      const data = await res.json();
      setCart(data.cart);
    } catch (error) {
      alert("Lỗi thêm vào giỏ hàng");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Giỏ hàng rỗng!");
    setLoadingMsg("Đang xử lý thanh toán (RAM)...");
    try {
      const res = await fetch(`${API_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID }),
      });
      const result = await res.json();
      if (res.ok) {
        alert("🎉 " + result.message);
        setCart([]);
        fetchProducts();
      } else {
        alert(`❌ Lỗi: ${result.message}`);
      }
    } catch (error) {
      alert("Lỗi kết nối Server!");
    } finally {
      setLoadingMsg("");
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto font-sans text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-6">
        ⚡ FLASH SALE (Space-Based)
      </h1>
      {loadingMsg && (
        <p className="text-blue-600 font-bold mb-4">{loadingMsg}</p>
      )}
      <div className="grid grid-cols-2 gap-10 text-left">
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Sản Phẩm (Redis Cache)
          </h2>
          <div className="space-y-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="border p-4 rounded shadow-sm flex items-center justify-between"
              >
                <div>
                  <span className="text-3xl mr-3">{p.image || "📦"}</span>
                  <strong className="text-xl">{p.name}</strong>
                  <p className="text-gray-600">
                    Giá: {p.price.toLocaleString()}đ
                  </p>
                  <p
                    className={`font-bold ${p.stock > 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    Còn trong kho: {p.stock}
                  </p>
                </div>
                <button
                  onClick={() => addToCart(p)}
                  disabled={p.stock <= 0}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                  Mua
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="border p-6 bg-gray-50 rounded-lg h-fit text-black">
          <h2 className="text-2xl font-semibold mb-4">🛒 Giỏ Hàng (Redis)</h2>
          {cart.length === 0 ? (
            <p>Giỏ trống</p>
          ) : (
            <ul className="space-y-2 mb-6">
              {cart.map((item, idx) => (
                <li key={idx} className="flex justify-between border-b pb-2">
                  <span>
                    {item.productName} (x{item.quantity})
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-red-600 text-white font-bold py-3 rounded text-xl disabled:bg-gray-400"
          >
            CHECKOUT SIÊU TỐC
          </button>
        </div>
      </div>
    </div>
  );
}
