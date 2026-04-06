// src/routes/events.js
// Simulates the "outbox processor" — in production this publishes to Kafka/RabbitMQ
const express = require('express');
const { pool } = require('../config/db');
const router = express.Router();

// GET /events — view pending events (what would be published to Kafka)
router.get('/', async (req, res, next) => {
  try {
    const { status = 'pending', topic } = req.query;
    let sql = 'SELECT * FROM events WHERE status = ?';
    const params = [status];
    if (topic) { sql += ' AND topic = ?'; params.push(topic); }
    sql += ' ORDER BY created_at DESC LIMIT 20';
    const [rows] = await pool.query(sql, params);
    res.json({ data: rows, total: rows.length,
      note: 'In production: outbox processor publishes these to Kafka and marks them published' });
  } catch (err) { next(err); }
});

// POST /events/:id/publish — simulate publishing an event (mark as published)
router.post('/:id/publish', async (req, res, next) => {
  try {
    const [result] = await pool.query(
      `UPDATE events SET status = 'published' WHERE id = ? AND status = 'pending'`,
      [+req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Event not found or already published' });

    const [[event]] = await pool.query('SELECT * FROM events WHERE id = ?', [+req.params.id]);
    console.log(`📨 [Kafka Simulation] Published → topic: ${event.topic}`);
    res.json({ message: 'Event published (simulated)', event });
  } catch (err) { next(err); }
});

// GET /partition-info — show partition metadata (demo utility)
router.get('/partition-info', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT TABLE_NAME, PARTITION_NAME, PARTITION_METHOD, PARTITION_EXPRESSION,
             PARTITION_DESCRIPTION, TABLE_ROWS
      FROM INFORMATION_SCHEMA.PARTITIONS
      WHERE TABLE_SCHEMA = DATABASE()
        AND PARTITION_NAME IS NOT NULL
      ORDER BY TABLE_NAME, PARTITION_NAME
    `);
    res.json({ partitions: rows });
  } catch (err) { next(err); }
});

module.exports = router;
