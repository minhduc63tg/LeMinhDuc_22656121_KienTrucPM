FROM postgres:15-alpine

# Copy file sql vào thư mục đặc biệt của Postgres
# Khi container khởi chạy lần đầu, Postgres sẽ tự động thực thi file này
COPY init.sql /docker-entrypoint-initdb.d/

# Cấu hình mật khẩu mặc định (có thể thay đổi khi run)
ENV POSTGRES_PASSWORD=123