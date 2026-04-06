const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3001;

// Cấu hình kết nối (Lưu ý: host là 'db' - tên service trong docker-compose)
const pool = new Pool({
  user: 'postgres',
  host: 'db', // Docker tự phân giải tên này thành IP của container database
  database: 'postgres',
  password: '123',
  port: 5432,
});

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json({
      message: "Kết nối Database thành công! 🚀",
      data: result.rows
    });
  } catch (err) {
    res.status(500).send("Lỗi kết nối: " + err.message);
  }
});

app.listen(port, () => {
  console.log(`App chạy tại http://localhost:${port}`);
});