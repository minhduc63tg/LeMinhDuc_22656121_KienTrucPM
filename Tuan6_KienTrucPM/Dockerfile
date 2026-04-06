# GIAI ĐOẠN 1: BUILD (Môi trường để tạo ra thành phẩm)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Cài đặt mọi thứ (gồm cả công cụ build nếu có)
RUN npm install
COPY . .

# GIAI ĐOẠN 2: RUNTIME (Chỉ chứa thành phẩm để chạy)
FROM node:18-alpine
WORKDIR /app
# Chỉ lấy các file cần thiết từ giai đoạn builder qua
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/index.js ./
# Chỉ cài các thư viện cần cho Production (loại bỏ thư viện rác)
RUN npm install --only=production

EXPOSE 3000
CMD ["node", "index.js"]