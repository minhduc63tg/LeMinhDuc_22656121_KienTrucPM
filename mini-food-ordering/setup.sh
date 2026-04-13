#!/bin/bash
# start-all.sh — Chạy toàn bộ hệ thống (cần có tmux hoặc chạy thủ công)
# Cách 1: chạy từng service trong terminal riêng
# Cách 2: dùng script này với tmux

echo "🚀 Mini Food Ordering System — Service-Based Architecture"
echo "========================================================"
echo ""
echo "Cài dependencies cho tất cả services..."

for service in user-service food-service order-service payment-service; do
  echo "📦 Installing $service..."
  (cd services/$service && npm install --silent) &
done
wait

echo "📦 Installing frontend..."
(cd frontend && npm install --silent)

echo ""
echo "✅ Hoàn tất! Để chạy hệ thống, mở 5 terminal và chạy:"
echo ""
echo "  Terminal 1: cd services/user-service    && npm run dev"
echo "  Terminal 2: cd services/food-service    && npm run dev"
echo "  Terminal 3: cd services/order-service   && npm run dev"
echo "  Terminal 4: cd services/payment-service && npm run dev"
echo "  Terminal 5: cd frontend                 && npm run dev"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "📡 Services: :3001 (user) | :3002 (food) | :3003 (order) | :3004 (payment)"
