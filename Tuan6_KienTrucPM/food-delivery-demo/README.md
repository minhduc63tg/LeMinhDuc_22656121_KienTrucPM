# 🍜 Online Food Delivery — Distributed Architecture Demo

Demo Node.js/Express project minh hoạ **Server-based architecture** với MariaDB **database partitioning**.

---

## Kiến trúc tổng quan

```
Client
  └─► Express Server (single process, port 3000)
        ├─ /restaurants  →  Restaurant Service logic
        ├─ /orders       →  Order Service logic (+ Outbox Events)
        ├─ /users        →  User Service logic
        └─ /events       →  Event Outbox (→ Kafka in production)
              │
              └─► MariaDB (Connection Pool × 10)
                    ├─ users     [HASH(id) × 4 partitions]
                    ├─ orders    [RANGE(created_ts) by quarter]
                    ├─ restaurants
                    ├─ menu_items
                    ├─ order_items
                    └─ events    (Outbox table)
```

---

## Database Partitioning

### HASH Partition — `users` table
```sql
PARTITION BY HASH(id) PARTITIONS 4
```
- Rows phân phối đều theo `id % 4`
- Tốt cho: bảng write nhiều, tránh hot-partition
- Query `WHERE id = ?` → MariaDB tự prune xuống 1 partition

### RANGE Partition — `orders` table
```sql
PARTITION BY RANGE (created_ts) (
  PARTITION p_2024_q1 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01')),
  PARTITION p_2024_q2 VALUES LESS THAN (UNIX_TIMESTAMP('2024-07-01')),
  ...
  PARTITION p_future  VALUES LESS THAN MAXVALUE
)
```
- Partition theo quarter (3 tháng)
- **Partition Pruning**: `WHERE created_ts >= X AND created_ts < Y`
  → chỉ scan partition liên quan, bỏ qua phần còn lại
- Tốt cho: dữ liệu time-series, archiving cũ

---

## Async Pattern — Outbox

```
POST /orders
  └─► BEGIN TRANSACTION
        ├─ INSERT orders
        ├─ INSERT order_items  
        └─ INSERT events (topic='order.created')  ← same txn!
      COMMIT

Outbox Processor (cron/worker):
  └─► SELECT * FROM events WHERE status='pending'
        └─► Publish to Kafka → UPDATE status='published'
```

Đảm bảo **at-least-once delivery** mà không bị mất event khi server crash.

---

## Cài đặt & Chạy

```bash
# 1. Install dependencies
npm install

# 2. Copy và chỉnh sửa config
cp .env.example .env
# Điền DB_HOST, DB_USER, DB_PASSWORD

# 3. Tạo schema + partitions
npm run setup-db

# 4. Insert demo data  
npm run seed

# 5. Start server
npm start
# hoặc dev mode với hot-reload:
npm run dev
```

---

## API Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/` | Architecture info |
| GET | `/health` | Health check |
| GET | `/restaurants` | Danh sách nhà hàng (`?category=Vietnamese`) |
| GET | `/restaurants/:id/menu` | Menu của nhà hàng |
| GET | `/users` | Danh sách users (HASH partitioned) |
| POST | `/users` | Tạo user mới |
| GET | `/users/:id` | Xem user (auto partition prune) |
| GET | `/orders` | Danh sách orders (`?from=2025-01-01&to=2025-04-01`) |
| GET | `/orders/:id` | Chi tiết order + items |
| POST | `/orders` | Tạo order (+ outbox event) |
| PATCH | `/orders/:id/status` | Cập nhật status |
| GET | `/events` | Pending outbox events |
| POST | `/events/:id/publish` | Simulate Kafka publish |
| GET | `/events/partition-info` | Xem partition metadata từ DB |

---

## Demo Requests

```bash
# Xem tất cả nhà hàng
curl http://localhost:3000/restaurants

# Xem menu
curl http://localhost:3000/restaurants/1/menu

# Tạo order (sẽ tạo event trong outbox)
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"restaurant_id":1,"items":[{"menu_item_id":1,"quantity":2}]}'

# Orders với partition pruning (chỉ scan p_2025_q1)
curl "http://localhost:3000/orders?from=2025-01-01&to=2025-04-01"

# Xem partition metadata
curl http://localhost:3000/events/partition-info

# Simulate publish event to Kafka
curl -X POST http://localhost:3000/events/1/publish
```

---

## Migration Path → Microservices

Khi cần scale, tách từng route thành service độc lập:

| Service | Port | DB |
|---------|------|----|
| User Service | 3001 | users_db |
| Order Service | 3002 | orders_db |
| Restaurant Service | 3003 | restaurant_db |
| Payment Service | 3004 | payment_db |

Thêm API Gateway (nginx/Kong) + Kafka cho async events.
