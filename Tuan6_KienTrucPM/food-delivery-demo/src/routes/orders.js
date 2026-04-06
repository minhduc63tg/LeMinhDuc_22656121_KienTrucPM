// src/routes/orders.js
// Demonstrates RANGE partition pruning:
//   Queries filtered by date only scan the relevant partition(s)
const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// GET /orders — list orders (optionally filter by date range → triggers partition pruning)
router.get('/', async (req, res, next) => {
  try {
    const { user_id, from, to, status } = req.query;
    let sql = `
      SELECT o.*, u.name AS user_name, r.name AS restaurant_name
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN restaurants r ON r.id = o.restaurant_id
      WHERE 1=1`;
    const params = [];

    // Partition pruning: MariaDB converts TIMESTAMP to UNIX for partition selection
    if (from) { sql += ' AND o.created_ts >= UNIX_TIMESTAMP(?)'; params.push(from); }
    if (to)   { sql += ' AND o.created_ts <  UNIX_TIMESTAMP(?)'; params.push(to); }
    if (user_id) { sql += ' AND o.user_id = ?'; params.push(+user_id); }
    if (status)  { sql += ' AND o.status = ?';  params.push(status); }

    sql += ' ORDER BY o.created_at DESC LIMIT 50';
    const [rows] = await pool.query(sql, params);
    res.json({ data: rows, total: rows.length,
      note: from ? `Partition pruning active (from=${from})` : 'No date filter — full scan' });
  } catch (err) { next(err); }
});

// GET /orders/:id — single order with items
router.get('/:id', async (req, res, next) => {
  try {
    const [[order]] = await pool.query(
      `SELECT o.*, u.name AS user_name, r.name AS restaurant_name
       FROM orders o
       JOIN users u ON u.id = o.user_id
       JOIN restaurants r ON r.id = o.restaurant_id
       WHERE o.id = ?`, [+req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const [items] = await pool.query(
      `SELECT oi.*, m.name AS item_name
       FROM order_items oi JOIN menu_items m ON m.id = oi.menu_item_id
       WHERE oi.order_id = ?`, [order.id]);

    res.json({ order: { ...order, items } });
  } catch (err) { next(err); }
});

// POST /orders — create order + emit event to outbox
router.post('/', async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { user_id, restaurant_id, items } = req.body;
    if (!user_id || !restaurant_id || !Array.isArray(items) || !items.length)
      return res.status(400).json({ error: 'user_id, restaurant_id, items required' });

    // Fetch prices for submitted menu_item_ids
    const ids = items.map(i => i.menu_item_id);
    const [menuItems] = await conn.query(
      `SELECT id, price FROM menu_items WHERE id IN (?) AND is_available = 1`, [ids]);
    const priceMap = Object.fromEntries(menuItems.map(m => [m.id, m.price]));

    const total = items.reduce((sum, i) => {
      const price = priceMap[i.menu_item_id];
      if (!price) throw Object.assign(new Error(`Item ${i.menu_item_id} not found`), { status: 400 });
      return sum + price * (i.quantity || 1);
    }, 0);

    await conn.beginTransaction();

    const now_ts = Math.floor(Date.now() / 1000); // int for RANGE partition key
    const [{ insertId: orderId }] = await conn.query(
      `INSERT INTO orders (user_id, restaurant_id, status, total_amount, created_ts)
       VALUES (?, ?, 'pending', ?, ?)`,
      [user_id, restaurant_id, total, now_ts]);

    const itemRows = items.map(i => [orderId, i.menu_item_id, i.quantity || 1, priceMap[i.menu_item_id]]);
    await conn.query(
      `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES ?`, [itemRows]);

    // Outbox pattern: write event in same transaction → guaranteed delivery
    await conn.query(
      `INSERT INTO events (topic, payload) VALUES ('order.created', ?)`,
      [JSON.stringify({ orderId, user_id, restaurant_id, total, items })]);

    await conn.commit();
    res.status(201).json({ orderId, total, status: 'pending',
      message: 'Order created. Event queued in outbox.' });
  } catch (err) {
    await conn.rollback();
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  } finally { conn.release(); }
});

// PATCH /orders/:id/status — update order status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['confirmed','preparing','delivering','delivered','cancelled'];
    if (!valid.includes(status))
      return res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` });

    const [result] = await pool.query(
      `UPDATE orders SET status = ? WHERE id = ?`, [status, +req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Order not found' });

    // Emit status-change event to outbox
    await pool.query(
      `INSERT INTO events (topic, payload) VALUES ('order.status_changed', ?)`,
      [JSON.stringify({ orderId: +req.params.id, status })]);

    res.json({ orderId: +req.params.id, status });
  } catch (err) { next(err); }
});

module.exports = router;
