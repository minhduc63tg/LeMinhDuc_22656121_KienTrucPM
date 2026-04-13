// controllers/orderController.js
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { USER_SERVICE_URL, FOOD_SERVICE_URL } = require('../config');

const orders = [];

const createOrder = async (req, res) => {
  const { userId, items, paymentMethod } = req.body;
  // items: [{ foodId, quantity }]

  if (!userId || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin đặt hàng' });
  }

  try {
    // 1. Validate user từ User Service
    const userRes = await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
    const user = userRes.data.data;

    // 2. Lấy thông tin từng món từ Food Service
    const foodDetails = await Promise.all(
      items.map(async (item) => {
        const foodRes = await axios.get(`${FOOD_SERVICE_URL}/foods/${item.foodId}`);
        const food = foodRes.data.data;
        return {
          foodId: food.id,
          name: food.name,
          price: food.price,
          quantity: item.quantity,
          subtotal: food.price * item.quantity,
        };
      })
    );

    const totalAmount = foodDetails.reduce((sum, item) => sum + item.subtotal, 0);

    const newOrder = {
      id: uuidv4(),
      orderCode: `ORD-${Date.now()}`,
      userId,
      userName: user.name,
      userEmail: user.email,
      items: foodDetails,
      totalAmount,
      paymentMethod: paymentMethod || 'COD',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);

    console.log(`📦 Order mới: ${newOrder.orderCode} - ${user.name} - ${totalAmount.toLocaleString()}đ`);

    return res.status(201).json({ success: true, message: 'Đặt hàng thành công', data: newOrder });
  } catch (error) {
    console.error('Lỗi tạo order:', error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ success: false, message: 'User hoặc món ăn không tồn tại' });
    }
    return res.status(500).json({ success: false, message: 'Lỗi hệ thống khi tạo đơn hàng' });
  }
};

const getAllOrders = (req, res) => {
  const { userId } = req.query;
  const result = userId ? orders.filter((o) => o.userId === userId) : orders;
  return res.json({ success: true, data: result });
};

const getOrderById = (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
  return res.json({ success: true, data: order });
};

const updateOrderStatus = (req, res) => {
  const { status } = req.body;
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

  order.status = status;
  order.updatedAt = new Date().toISOString();
  console.log(`🔄 Order ${order.orderCode} → ${status}`);
  return res.json({ success: true, message: 'Cập nhật trạng thái thành công', data: order });
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus };
