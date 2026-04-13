// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import { foodApi } from '../api/services';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', price: '', category: '', image: '🍽️' };
const CATEGORIES = ['Phở', 'Cơm', 'Bún', 'Bánh Mì', 'Hủ Tiếu', 'Gà', 'Đồ Uống'];

export default function AdminPage() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadFoods(); }, []);

  const loadFoods = async () => {
    try {
      const res = await foodApi.getAll();
      setFoods(res.data.data);
    } catch {
      toast.error('Không thể tải danh sách món');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (food) => {
    setForm({ name: food.name, description: food.description, price: food.price, category: food.category, image: food.image });
    setEditId(food.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await foodApi.update(editId, { ...form, price: Number(form.price) });
        toast.success('Cập nhật thành công!');
      } else {
        await foodApi.create({ ...form, price: Number(form.price) });
        toast.success('Thêm món thành công!');
      }
      setShowForm(false);
      loadFoods();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (food) => {
    if (!confirm(`Xoá món "${food.name}"?`)) return;
    try {
      await foodApi.delete(food.id);
      toast.success('Đã xoá món');
      loadFoods();
    } catch {
      toast.error('Xoá thất bại');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý thực đơn</h2>
          <p className="text-gray-500 text-sm mt-1">{foods.length} món đang có</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition cursor-pointer"
        >
          + Thêm món
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editId ? '✏️ Sửa món ăn' : '➕ Thêm món mới'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Tên món *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    placeholder="Phở Bò Tái"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Giá (đ) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    placeholder="55000"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Icon</label>
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    placeholder="🍜"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Danh mục *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Mô tả</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none"
                    rows={2}
                    placeholder="Mô tả ngắn về món ăn..."
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  {submitting ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Thêm món'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2 animate-pulse">📋</div>
          <p>Đang tải...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Món ăn</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Danh mục</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Giá</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {foods.map((food) => (
                <tr key={food.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{food.image}</span>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{food.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-48">{food.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">{food.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-orange-600 text-sm">
                    {food.price.toLocaleString()}đ
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => openEdit(food)}
                      className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition cursor-pointer mr-2"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(food)}
                      className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
