// src/pages/FoodsPage.jsx
import { useState, useEffect } from "react";
import { foodApi } from "../api/services";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Tất cả",
  "Phở",
  "Cơm",
  "Bún",
  "Bánh Mì",
  "Hủ Tiếu",
  "Gà",
  "Đồ Uống",
];

export default function FoodsPage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const { addItem } = useCart();

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      const res = await foodApi.getAll();
      setFoods(res.data.data);
    } catch {
      toast.error("Không thể tải danh sách món ăn");
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    activeCategory === "Tất cả"
      ? foods
      : foods.filter((f) => f.category === activeCategory);

  const handleAdd = (food) => {
    addItem(food);
    toast.success(`Đã thêm ${food.name} vào giỏ 🛒`);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🍜</div>
          <p className="text-gray-500">Đang tải thực đơn...</p>
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Thực đơn hôm nay</h2>
        <p className="text-gray-500 mt-1">
          {foods.length} món ngon đang chờ bạn
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer flex-shrink-0 ${
              activeCategory === cat
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <p>Không có món trong danh mục này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((food) => (
            <FoodCard key={food.id} food={food} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  );
}

function FoodCard({ food, onAdd }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-50">
      {/* Image placeholder */}
      <div className="h-36 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <span className="text-6xl">{food.image}</span>
      </div>

      <div className="p-4">
        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
          {food.category}
        </span>
        <h3 className="font-semibold text-gray-800 mt-2">{food.name}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {food.description}
        </p>

        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-bold text-orange-600">
            {food.price.toLocaleString()}đ
          </span>
          <button
            onClick={() => onAdd(food)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition cursor-pointer"
          >
            + Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
