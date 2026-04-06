// src/routes/restaurants.js
const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// GET /restaurants — list all open restaurants
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM restaurants WHERE is_open = 1';
    const params = [];
    if (category) { sql += ' AND category = ?'; params.push(category); }
    sql += ' ORDER BY rating DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ data: rows, total: rows.length });
  } catch (err) { next(err); }
});

// GET /restaurants/:id/menu — restaurant menu
router.get('/:id/menu', async (req, res, next) => {
  try {
    const [menu] = await pool.query(
      `SELECT m.*, r.name AS restaurant_name
       FROM menu_items m
       JOIN restaurants r ON r.id = m.restaurant_id
       WHERE m.restaurant_id = ? AND m.is_available = 1
       ORDER BY m.category, m.name`,
      [req.params.id]
    );
    if (!menu.length) return res.status(404).json({ error: 'Restaurant not found or no menu' });
    res.json({ restaurant_id: +req.params.id, menu });
  } catch (err) { next(err); }
});

module.exports = router;
