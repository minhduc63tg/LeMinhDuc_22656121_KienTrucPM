# Movie Ticket System — Event-Driven Architecture

## Kiến trúc

```
┌─────────────┐     REST      ┌──────────────────┐
│   Frontend  │ ──────────►  │   Booking Service │ ──► PUBLISH: BOOKING_CREATED
│  (React)    │              └──────────────────┘
│  Port 5173  │     REST      ┌──────────────────┐
│             │ ──────────►  │   User Service    │  (REST thuần)
│             │              └──────────────────┘
│             │     REST      ┌──────────────────┐
│             │ ──────────►  │   Movie Service   │  (REST thuần)
└─────────────┘              └──────────────────┘

                    RabbitMQ (Message Broker - Port 5672)
                         │
         ┌───────────────┴────────────────┐
         ▼                                ▼
┌─────────────────┐             ┌──────────────────────┐
│ Payment Service │             │ Notification Service  │
│ CONSUME:        │             │ CONSUME:             │
│  BOOKING_CREATED│             │  PAYMENT_COMPLETED   │
│ PUBLISH:        │             │  PAYMENT_FAILED      │
│  PAYMENT_       │             │ OUTPUT: Console log  │
│  COMPLETED /    │             └──────────────────────┘
│  FAILED         │
└─────────────────┘
```

## Events

| Event              | Publisher       | Consumer(s)                        |
|--------------------|-----------------|-------------------------------------|
| USER_REGISTERED    | User Service    | (log only)                          |
| BOOKING_CREATED    | Booking Service | Payment Service                     |
| PAYMENT_COMPLETED  | Payment Service | Notification Service                |
| PAYMENT_FAILED     | Payment Service | Notification Service                |

## Cấu trúc dự án

```
movie-ticket-eda/
├── shared/
│   └── rabbitmq.js          ← RabbitMQ helper dùng chung
├── services/
│   ├── user-service/        → Port 3001
│   ├── movie-service/       → Port 3002
│   ├── booking-service/     → Port 3003 (CORE - publish events)
│   └── payment-notification-service/ → Port 3004
└── frontend/                → Port 5173
```

## Yêu cầu hệ thống

- Node.js >= 18
- RabbitMQ (xem bên dưới)

## Cài RabbitMQ nhanh (Docker)

```bash
docker run -d --name rabbitmq \
  -p 5672:5672 -p 15672:15672 \
  rabbitmq:3-management
```

RabbitMQ Management UI: http://localhost:15672 (guest/guest)

## Cách chạy

### 1. Chạy RabbitMQ trước
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### 2. Cài dependencies
```bash
bash setup.sh
```

### 3. Mở 4 terminal cho các services
```bash
# Terminal 1
cd services/user-service && npm run dev

# Terminal 2
cd services/movie-service && npm run dev

# Terminal 3
cd services/booking-service && npm run dev

# Terminal 4
cd services/payment-notification-service && npm run dev

# Terminal 5
cd frontend && npm run dev
```

## Tài khoản demo
- Admin: `admin@cinema.com` / `admin123`
- User: `user@cinema.com` / `user123`

## Kịch bản demo
1. User đăng ký → log event USER_REGISTERED
2. Chọn phim → đặt vé → Booking Service publish BOOKING_CREATED
3. Payment Service consume → xử lý → publish PAYMENT_COMPLETED/FAILED
4. Notification Service consume → hiển thị kết quả
5. Xem event log real-time trên UI
