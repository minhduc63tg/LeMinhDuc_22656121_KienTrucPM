// src/controllers/bookingController.js
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const { bookings } = require("../db");
const { publish } = require("../../../../shared/rabbitmq");
const EVENTS = require("../../../../shared/events");

const USER_SERVICE = process.env.USER_SERVICE_URL || "http://localhost:3001";
const MOVIE_SERVICE = process.env.MOVIE_SERVICE_URL || "http://localhost:3002";

const createBooking = async (req, res) => {
  const { userId, movieId, showTime, seats } = req.body;

  if (!userId || !movieId || !showTime || !seats)
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin đặt vé" });

  try {
    // 1. Validate user
    const userRes = await axios.get(`${USER_SERVICE}/users/${userId}`);
    const user = userRes.data.data;

    // 2. Lấy thông tin phim
    const movieRes = await axios.get(`${MOVIE_SERVICE}/movies/${movieId}`);
    const movie = movieRes.data.data;

    if (movie.availableSeats < seats)
      return res
        .status(400)
        .json({ success: false, message: "Không đủ ghế trống" });

    if (!movie.showTimes.includes(showTime))
      return res
        .status(400)
        .json({ success: false, message: "Giờ chiếu không hợp lệ" });

    const totalAmount = movie.price * seats;

    // 3. Tạo booking với trạng thái PENDING
    const booking = {
      id: uuidv4(),
      bookingCode: `BKG-${Date.now()}`,
      userId,
      userName: user.name,
      userEmail: user.email,
      movieId,
      movieTitle: movie.title,
      moviePoster: movie.poster,
      showTime,
      seats,
      pricePerSeat: movie.price,
      totalAmount,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    bookings.push(booking);

    // 4. PUBLISH event BOOKING_CREATED (KHÔNG xử lý payment trực tiếp)
    await publish(EVENTS.BOOKING_CREATED, {
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      userId: booking.userId,
      userName: booking.userName,
      userEmail: booking.userEmail,
      movieTitle: booking.movieTitle,
      showTime: booking.showTime,
      seats: booking.seats,
      totalAmount: booking.totalAmount,
    });

    console.log(
      `📦 Booking tạo thành công: ${booking.bookingCode} — event published`,
    );

    return res.status(201).json({
      success: true,
      message: "Đặt vé thành công! Đang xử lý thanh toán...",
      data: booking,
    });
  } catch (err) {
    console.error("Lỗi tạo booking:", err.message);
    if (err.response?.status === 404)
      return res
        .status(404)
        .json({ success: false, message: "Phim hoặc user không tồn tại" });
    return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

const getAllBookings = (req, res) => {
  const { userId } = req.query;
  const result = userId
    ? bookings.filter((b) => b.userId === userId)
    : bookings;
  return res.json({ success: true, data: result.slice().reverse() });
};

const getBookingById = (req, res) => {
  const b = bookings.find((b) => b.id === req.params.id);
  if (!b)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy booking" });
  return res.json({ success: true, data: b });
};

// Được gọi bởi Payment Service để cập nhật status
const updateBookingStatus = (req, res) => {
  const { status } = req.body;
  const b = bookings.find((b) => b.id === req.params.id);
  if (!b)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy booking" });
  b.status = status;
  b.updatedAt = new Date().toISOString();
  console.log(`🔄 Booking ${b.bookingCode} → ${status}`);
  return res.json({ success: true, data: b });
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
};
