# Mini Food Ordering System — Service-Based Architecture

## Cấu trúc dự án

```
mini-food-ordering/
├── services/
│   ├── user-service/      → Port 3001 (đăng ký / đăng nhập)
│   ├── food-service/      → Port 3002 (quản lý món ăn)
│   ├── order-service/     → Port 3003 (tạo / xem đơn hàng)
│   └── payment-service/   → Port 3004 (thanh toán + thông báo)
├── frontend/              → Port 5173  (ReactJS + TailwindCSS v4)
└── README.md
```

## Cách chạy

### 1. Chạy từng service (mở 4 terminal)

```bash
cd services/user-service && npm install && npm run dev
cd services/food-service && npm install && npm run dev
cd services/order-service && npm install && npm run dev
cd services/payment-service && npm install && npm run dev
```

### 2. Chạy frontend

```bash
cd frontend && npm install && npm run dev
```

### 3. Truy cập

- Frontend: http://localhost:5173
- User API: http://localhost:3001
- Food API: http://localhost:3002
- Order API: http://localhost:3003
- Payment API: http://localhost:3004

## Tài khoản mặc định (seed)

- Admin: `admin@food.com` / `admin123`
- User: `user@food.com` / `user123`

## Luồng demo

1. Đăng nhập → User Service
2. Xem danh sách món → Food Service
3. Thêm vào giỏ → lưu local
4. Tạo đơn hàng → Order Service (gọi Food + User Service)
5. Thanh toán → Payment Service → gửi thông báo
