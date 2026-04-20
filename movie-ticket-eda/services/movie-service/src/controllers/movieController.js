// src/controllers/movieController.js
const { v4: uuidv4 } = require("uuid");
const { movies } = require("../db");

const getAllMovies = (req, res) => {
  const { status } = req.query;
  const result = status ? movies.filter((m) => m.status === status) : movies;
  return res.json({ success: true, data: result });
};

const getMovieById = (req, res) => {
  const movie = movies.find((m) => m.id === req.params.id);
  if (!movie)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy phim" });
  return res.json({ success: true, data: movie });
};

const createMovie = (req, res) => {
  const {
    title,
    genre,
    duration,
    rating,
    poster,
    description,
    showTimes,
    price,
  } = req.body;
  if (!title || !price)
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin bắt buộc" });

  const movie = {
    id: uuidv4(),
    title,
    genre: genre || "Khác",
    duration: Number(duration) || 120,
    rating: Number(rating) || 7.0,
    poster: poster || "🎬",
    description: description || "",
    showTimes: showTimes || ["10:00", "15:00", "20:00"],
    price: Number(price),
    availableSeats: 150,
    status: "SHOWING",
  };

  movies.push(movie);
  return res.status(201).json({ success: true, data: movie });
};

// Cập nhật số ghế khi đặt vé (gọi nội bộ)
const updateSeats = (req, res) => {
  const { seats } = req.body;
  const movie = movies.find((m) => m.id === req.params.id);
  if (!movie)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy phim" });

  if (movie.availableSeats < seats)
    return res.status(400).json({ success: false, message: "Không đủ ghế" });

  movie.availableSeats -= seats;
  return res.json({ success: true, data: movie });
};

const updateMovie = (req, res) => {
  const index = movies.findIndex((m) => m.id === req.params.id);
  if (index === -1)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy phim" });

  const { title, genre, duration, rating, poster, description, price, status } =
    req.body;
  if (!title || !price)
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin bắt buộc" });

  movies[index] = {
    ...movies[index],
    title,
    genre: genre || "Khác",
    duration: Number(duration) || 120,
    rating: Number(rating) || 7.0,
    poster: poster || "🎬",
    description: description || "",
    price: Number(price),
    status: status || movies[index].status,
  };

  return res.json({ success: true, data: movies[index] });
};

const deleteMovie = (req, res) => {
  const index = movies.findIndex((m) => m.id === req.params.id);
  if (index === -1)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy phim" });

  movies.splice(index, 1);
  return res.json({ success: true, message: "Xóa phim thành công" });
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  updateSeats,
};
