# Sử dụng image Node.js chính thức
FROM node:18-alpine

# Đặt thư mục làm việc bên trong container
WORKDIR /usr/src/app

# Copy package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn của ứng dụng vào container
COPY . .

# Chạy lệnh prisma generate để khởi tạo Prisma Client
RUN npx prisma generate

# Build ứng dụng bằng NestJS CLI
RUN nest build

# Expose port mà ứng dụng sẽ chạy trên đó
EXPOSE 80

# Lệnh để chạy ứng dụng
CMD ["npm", "run", "start:prod"]
