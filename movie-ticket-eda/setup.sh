#!/bin/bash
# setup.sh — Cài dependencies cho toàn bộ project

set -e

echo ""
echo "🎬 Movie Ticket System — Event-Driven Architecture"
echo "=================================================="
echo ""

# Check RabbitMQ
echo "📋 Kiểm tra RabbitMQ..."
if ! command -v docker &> /dev/null; then
  echo "⚠️  Docker chưa được cài. Hãy cài RabbitMQ thủ công:"
  echo "    hoặc chạy: docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management"
else
  if ! docker ps | grep -q rabbitmq; then
    echo "🐰 Đang khởi động RabbitMQ..."
    docker run -d --name rabbitmq \
      -p 5672:5672 -p 15672:15672 \
      rabbitmq:3-management 2>/dev/null || \
    docker start rabbitmq 2>/dev/null || \
    echo "⚠️  Không thể khởi động RabbitMQ tự động. Hãy chạy thủ công."
    echo "✅ RabbitMQ đang chạy tại localhost:5672"
    echo "   Management UI: http://localhost:15672 (guest/guest)"
  else
    echo "✅ RabbitMQ đã chạy"
  fi
fi

echo ""
echo "📦 Cài dependencies cho các services..."

SERVICES=("user-service" "movie-service" "booking-service" "payment-notification-service")
for s in "${SERVICES[@]}"; do
  echo "  → $s"
  (cd "services/$s" && npm install --silent) &
done
wait

echo "  → frontend"
(cd frontend && npm install --silent)

echo ""
echo "✅ Hoàn tất! Cách chạy hệ thống:"
echo ""
echo "  Terminal 1: cd services/user-service                && npm run dev"
echo "  Terminal 2: cd services/movie-service               && npm run dev"
echo "  Terminal 3: cd services/booking-service             && npm run dev"
echo "  Terminal 4: cd services/payment-notification-service && npm run dev"
echo "  Terminal 5: cd frontend                             && npm run dev"
echo ""
echo "🌐 Frontend:  http://localhost:5173"
echo "📡 Services:  :3001 (user) | :3002 (movie) | :3003 (booking) | :3004 (payment+notif)"
echo "🐰 RabbitMQ:  http://localhost:15672"
echo ""
