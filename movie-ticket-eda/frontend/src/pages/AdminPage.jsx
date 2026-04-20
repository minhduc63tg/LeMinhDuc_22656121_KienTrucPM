// src/pages/AdminPage.jsx
import { useState, useEffect } from "react";
import { movieApi } from "../api/services";
import toast from "react-hot-toast";

const GENRES = [
  "Hành động",
  "Khoa học viễn tưởng",
  "Hoạt hình",
  "Tâm lý - Hành động",
  "Sử thi viễn tưởng",
  "Kinh dị",
  "Lãng mạn",
  "Hài",
  "Khác",
];
const EMPTY = {
  title: "",
  genre: "Hành động",
  duration: 120,
  rating: 7.5,
  poster: "🎬",
  description: "",
  price: 120000,
  status: "SHOWING",
};

export default function AdminPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const r = await movieApi.getAll();
      setMovies(r.data.data);
    } catch {
      toast.error("Không thể tải danh sách phim");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await movieApi.update(editId, {
          ...form,
          duration: Number(form.duration),
          rating: Number(form.rating),
          price: Number(form.price),
        });
        toast.success("Sửa phim thành công!");
      } else {
        await movieApi.create({
          ...form,
          duration: Number(form.duration),
          rating: Number(form.rating),
          price: Number(form.price),
        });
        toast.success("Thêm phim thành công!");
      }
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
      setForm(EMPTY);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (movie) => {
    setForm({
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration,
      rating: movie.rating,
      poster: movie.poster,
      description: movie.description || "",
      price: movie.price,
      status: movie.status,
    });
    setEditId(movie.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá phim này không?")) return;
    try {
      await movieApi.delete(id);
      toast.success("Xoá phim thành công!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể xoá phim");
    }
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setEditId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý phim</h2>
          <p className="text-gray-400 text-sm mt-1">
            {movies.length} phim đang có
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
        >
          + Thêm phim
        </button>
      </div>

      {/* Add Movie Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{
              background: "#13131a",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h3 className="text-lg font-bold text-white mb-5">
              {isEditing ? "✏️ Cập nhật phim" : "➕ Thêm phim mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">
                    Tên phim *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                    placeholder="Avengers: ..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Thể loại
                  </label>
                  <select
                    value={form.genre}
                    onChange={(e) =>
                      setForm({ ...form, genre: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      background: "#1f1f2e",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {GENRES.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Icon/Poster
                  </label>
                  <input
                    value={form.poster}
                    onChange={(e) =>
                      setForm({ ...form, poster: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                    placeholder="🎬"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Đánh giá (1-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={form.rating}
                    onChange={(e) =>
                      setForm({ ...form, rating: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">
                    Giá vé (đồng) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Nội dung phim..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  />
                </div>
              </div>
              {isEditing && (
                <div className="col-span-2 mb-2">
                  <label className="block text-xs text-gray-400 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{
                      background: "#1f1f2e",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <option value="SHOWING">Đang chiếu</option>
                    <option value="UPCOMING">Sắp chiếu</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  }}
                >
                  {submitting
                    ? "Đang lưu..."
                    : isEditing
                      ? "Cập nhật"
                      : "Thêm phim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-2 animate-pulse">🎬</div>
          <p>Đang tải...</p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#13131a",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <table className="w-full">
            <thead>
              <tr
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {[
                  "Phim",
                  "Thể loại",
                  "Thời lượng",
                  "Đánh giá",
                  "Giá vé",
                  "Ghế trống",
                  "Trạng thái",
                  "Hành động",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className="divide-y"
              style={{ divideColor: "rgba(255,255,255,0.04)" }}
            >
              {movies.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.poster}</span>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {m.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-40">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{m.genre}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {m.duration}p
                  </td>
                  <td className="px-4 py-3 text-sm text-yellow-400">
                    ⭐ {m.rating}
                  </td>
                  <td
                    className="px-4 py-3 text-sm font-medium"
                    style={{ color: "#a78bfa" }}
                  >
                    {m.price?.toLocaleString("vi-VN")}đ
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {m.availableSeats}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        background:
                          m.status === "SHOWING"
                            ? "rgba(74,222,128,0.15)"
                            : "rgba(251,191,36,0.15)",
                        color: m.status === "SHOWING" ? "#4ade80" : "#fbbf24",
                      }}
                    >
                      {m.status === "SHOWING" ? "Đang chiếu" : "Sắp chiếu"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(m)}
                        className="p-1.5 text-blue-400 hover:bg-blue-400/10 hover:rounded-lg transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 hover:rounded-lg transition"
                      >
                        Xóa
                      </button>
                    </div>
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
