# 📑 TÀI LIỆU KỸ THUẬT VÀ QUY TRÌNH VẬN HÀNH HỆ THỐNG

## JEWELRY STORE - PREMIUM E-COMMERCE & REALTIME PLATFORM

---

## 📋 THÔNG TIN DỰ ÁN (PROJECT OVERVIEW)

- **Tên dự án:** Jewelry Store E-Commerce & Realtime Management System
- **Kiến trúc:** Monorepo MERN Stack (MongoDB, Express.js, React, Node.js)
- **Phiên bản:** v1.0.0 Enterprise Production-Ready
- **Tác giả / Phụ trách:** Full-Stack Lead Engineer
- **Hạ tầng Cloud:** Vercel (Frontend), Render (Backend), MongoDB Atlas (Cloud Database)

---

## 📌 1. YÊU CẦU NGHIỆP VỤ & PHÂN QUYỀN HỆ THỐNG

### 1.1 Phân quyền Người dùng (Role-Based Access Control - RBAC)

1. **Khách hàng (Customer):**
   - Xem catalog sản phẩm, tìm kiếm, lọc theo giá và danh mục.
   - Quản lý giỏ hàng, áp dụng coupon giảm giá.
   - Đặt hàng & thanh toán trực tuyến qua cổng VNPAY.
   - Nhắn tin hỗ trợ trực tiếp với cửa hàng thời gian thực (Socket.IO Chat).
   - Đăng ký, Đăng nhập (Google OAuth / Local JWT), Đổi mật khẩu qua Email.
2. **Nhân viên (Staff):**
   - Đăng nhập giao diện Quản trị.
   - Tạo đơn bán hàng trực tiếp tại quầy (Hệ thống POS).
   - Chat trả lời tin nhắn trực tiếp với khách hàng thời gian thực.
3. **Quản trị viên (Admin):**
   - Tất cả quyền của Staff.
   - Toàn quyền CRUD Sản phẩm, Danh mục, Đơn hàng, Mã giảm giá (Coupons).
   - Thống kê doanh thu, tổng quan đơn hàng và số lượng người dùng.

---

## 🏗️ 2. KIẾN TRÚC KỸ THUẬT & SƠ ĐỒ KẾT NỐI (ARCHITECTURE)

### 2.1 Sơ đồ Kiến trúc Tổng thể

```text
[ CLIENT SIDE ]                             [ SERVER SIDE ]                      [ DATABASE / CLOUD ]
+-------------------+                      +-----------------------+            +-----------------------+
|  React 19 (Vite)  | --- HTTP Axios --->  |  Express API Server   | ---------> | MongoDB Atlas Cluster |
|  Tailwind CSS     |                      |  (Node.js v18)        |            | (Collections: Users,  |
|  Socket.io Client | <== WebSocket ==>    |  Socket.IO Server     |            |  Jewelries, Orders,   |
+-------------------+                      +-----------------------+            |  Carts, Coupons, Chat)|
  (Host: Vercel)                             - Helmet Security                  +-----------------------+
                                             - Rate-Limiter (Auth/API)                      ^
                                             - Mongo-Sanitize                           |
                                             - Node-Cache (TTL 60s) --------------------+
                                             (Host: Render.com)
```

### 2.2 Luồng Dữ liệu & Xử lý Bảo mật (Data Flow)

1. **Request Ingress:** Mọi HTTP request được lọc qua **Helmet** (chống XSS/Clickjacking), **Mongo-Sanitize** (chống NoSQL Injection) và **Rate Limiter** (chống DDoS/Brute-force).
2. **Authentication Middleware:** JWT Bearer Token được xác thực qua middleware `protect` và kiểm tra quyền qua `authorize("admin")`.
3. **Caching Layer:** API `GET /api/jewelry` kiểm tra dữ liệu từ **Node-Cache** trước khi truy vấn MongoDB, giảm thời gian phản hồi xuống dưới 5ms.

---

## 🗄️ 3. MÔ HÌNH DỮ LIỆU (DATABASE SCHEMA / ERD)

### 3.1 `users` Collection

- `name` (String, required): Tên người dùng.
- `email` (String, unique, required): Email đăng nhập.
- `password` (String, required): Mật khẩu đã mã hóa BcryptJS.
- `role` (String, enum: `["admin", "staff", "customer"]`, default: `"customer"`).
- `isActive` (Boolean, default: `true`).

### 3.2 `jewelries` Collection

- `title` (String, required, trimmed): Tên sản phẩm.
- `category` (String, trimmed): Danh mục sản phẩm (Nhẫn, Dây chuyền, Vòng tay, Bông tai).
- `price` (Number, required, min: 0): Giá bán sản phẩm (VNĐ).
- `quantity` (Number, min: 0): Số lượng tồn kho.
- `image` (String): Đường dẫn ảnh sản phẩm.
- `status` (String, enum: `["active", "completed"]`, default: `"active"`).
- Indexes: Text index trên `{ title, description, category }`.

### 3.3 `orders` Collection

- `user` (ObjectId, ref: `User`): Khách hàng đặt hàng.
- `orderItems` (Array): Danh sách các sản phẩm và số lượng.
- `totalAmount` (Number): Tổng chi phí hóa đơn.
- `paymentMethod` (String, enum: `["COD", "VNPAY"]`).
- `isPaid` (Boolean), `paidAt` (Date).
- `status` (String, enum: `["pending", "processing", "shipped", "delivered", "cancelled"]`).

---

## 🔌 4. DANH SÁCH API ENDPOINTS CHÍNH (API SPECS)

### Authentication API

- `POST /api/auth/signup`: Đăng ký tài khoản khách hàng mới.
- `POST /api/auth/login`: Đăng nhập lấy JWT Access Token (bị Rate-limit 15 req/15 min).
- `POST /api/auth/forgot`: Gửi email khôi phục mật khẩu qua Nodemailer.

### Products API

- `GET /api/jewelry`: Lấy danh sách sản phẩm (có Cache In-Memory & Phân trang).
- `POST /api/jewelry`: [Admin] Tạo mới sản phẩm (Tự động xóa Cache).
- `PUT /api/jewelry/:id`: [Admin] Cập nhật thông tin sản phẩm (Tự động xóa Cache).
- `DELETE /api/jewelry/:id`: [Admin] Xóa sản phẩm (Tự động xóa Cache).

### Payment & Orders API

- `POST /api/payment/create_payment_url`: Tạo đường dẫn thanh toán VNPAY chứa chữ ký HmacSHA512.
- `GET /api/payment/vnpay_return`: Callback nhận kết quả thanh toán từ VNPAY.

---

## 🛡️ 5. QUY TRÌNH KIỂM THỬ VÀ CI/CD AUTOMATION

### 5.1 Kiểm thử Tự động (Automated Test Suite)

- **Công cụ:** Jest v30 + Supertest.
- **Thực thi:** `npm test` tại thư mục gốc.
- **Phạm vi kiểm thử (22 Test Cases):**
  - Validation chữ ký bảo mật VNPAY HmacSHA512 (`tests/vnpayPayment.test.js`).
  - Logic tính giá tiền giỏ hàng, giảm giá coupon (`tests/cartHelper.test.js`, `tests/couponController.test.js`).
  - Integration Test API Auth Register & Login (`tests/authApi.test.js`).
  - Middleware xác thực Token & phân quyền Admin (`tests/authMiddleware.test.js`).

### 5.2 Quy trình CI/CD (Continuous Integration / Continuous Deployment)

- **File cấu hình:** `.github/workflows/ci-cd.yml`.
- **Luồng hoạt động:**
  1. Mỗi khi Developer thực hiện `git push` lên nhánh `master`.
  2. GitHub Actions khởi tạo môi trường Node.js 18.
  3. Chạy `npm run lint` để kiểm tra chuẩn format code.
  4. Chạy `npm test` thực thi 22 test cases.
  5. Nếu tất cả kiểm thử PASSED $\rightarrow$ Vercel và Render tự động lấy code mới để deploy zero-downtime.

---

## 🛠️ 6. HƯỚNG DẪN BÀN GIAO & QUY TRÌNH BẢO TRÌ (OPERATIONS MANUAL)

### 6.1 Môi trường Cần thiết

- Node.js >= 18.x
- MongoDB (Local hoặc Cloud Atlas)
- NTM Manager hoặc Git

### 6.2 Khởi động Hệ thống ở Máy Local

```bash
# 1. Clone repository
git clone https://github.com/Vinhpc123/Jewelry_store.git
cd Jewelry_store/jewelry-project

# 3. Chạy hệ thống (Frontend + Backend đồng thời)
npm start
```

### 6.3 Các Lệnh Khai Thác & Khôi Phục Dữ Liệu Ban Đầu

- **Tạo tài khoản Admin mặc định:** `node back-end/scripts/seedAdmin.js`
  - _Email:_ `admin@jewelry.com`
  - _Password:_ `AdminPassword123@`
- **Khởi tạo dữ liệu sản phẩm mẫu:** `node back-end/scripts/seedProducts.js`
- **Sao chép dữ liệu từ Local lên Cloud:** `node back-end/scripts/migrateData.js`

### 6.4 Xử lý Lỗi Thường Gặp (Troubleshooting)

1. **Lỗi CORS / Network Error:** Kiểm tra danh sách domain cho phép trong `back-end/src/server.js` (`allowedOrigins`).
2. **Lỗi Vercel Build:** Đảm bảo `Root Directory` trên Vercel cài đặt là `front-end`.
3. **Lỗi Render Build:** Đảm bảo `Root Directory` trên Render cài đặt là `back-end`.
