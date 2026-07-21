# 📑 TÀI LIỆU KỸ THUẬT VÀ QUY TRÌNH VẬN HÀNH HỆ THỐNG DỰ ÁN

## JEWELRY STORE - PREMIUM E-COMMERCE & REALTIME MANAGEMENT SYSTEM

_Tài liệu chuẩn hóa kiến trúc phần mềm, bảo mật, API specs và cẩm nang vận hành dành cho đội ngũ phát triển và bảo trì._

---

## 📋 MỤC LỤC TÀI LIỆU

1. [Tổng Quan Dự Án & Mục Tiêu Kỹ Thuật](#1-tổng-quan-dự-án--mục-tiêu-kỹ-thuật)
2. [Yêu Cầu Nghiệp Vụ & Phân Quyền Hàng Rào Bảo Vệ (RBAC)](#2-yêu-cầu-nghiệp-vụ--phân-quyền-hàng-rào-bảo-vệ-rbac)
3. [Sơ Đồ Kiến Trúc Hệ Thống & Luồng Dữ Liệu (Architecture & Data Flow)](#3-sơ-đồ-kiến-trúc-hệ-thống--luồng-dữ-liệu-architecture--data-flow)
4. [Mô Hình Dữ Liệu Chi Tiết (Database Schema & Indexing)](#4-mô-hình-dữ-liệu-chi-tiết-database-schema--indexing)
5. [Chi Tiết Danh Sách API Specs (API Endpoints Specification)](#5-chi-tiết-danh-sách-api-specs-api-endpoints-specification)
6. [Giao Thức Socket.IO Realtime Messenger (WebSocket Specs)](#6-giao-thức-socketio-realtime-messenger-websocket-specs)
7. [Các Cơ Chế Bảo Mật & Tối Ưu Hiệu Năng (Security & Caching)](#7-các-cơ-chế-bảo-mật--tối-ưu-hiệu-năng-security--caching)
8. [Bộ Kiểm Thử Tự Động & Quy Trình CI/CD Pipeline](#8-bộ-kiểm-thử-tự-động--quy-trình-cicd-pipeline)
9. [Cẩm Nang Vận Hành, Bàn Giao & Xử Lý Sự Cố (Operations & Disaster Recovery)](#9-cẩm-nang-vận-hành-bàn-giao--xử-lý-sự-cố-operations--disaster-recovery)

---

## 1. TỔNG QUAN DỰ ÁN & MỤC TIÊU KỸ THUẬT

Dự án **Jewelry Store** là hệ thống thương mại điện tử chuyên nghiệp cung cấp giải pháp mua sắm trang sức cao cấp trực tuyến và quản lý cửa hàng tập trung:

- **Mô hình triển khai:** Monorepo MERN Stack (MongoDB Atlas, Express.js, React 19, Node.js v18).
- **Trải nghiệm Đa nền tảng:** Hỗ trợ giao diện mua sắm cho Khách hàng, Bàn làm việc Quản trị cho Admin, và Mô-đun POS bán hàng tại quầy cho Nhân viên.
- **Tích hợp Nâng cao:** Cổng thanh toán VNPAY, Trò chuyện trực tuyến Socket.IO, Đặt lại mật khẩu tự động qua Email Nodemailer, Hệ thống Caching giảm độ trễ truy vấn xuống < 5ms.

---

## 2. YÊU CẦU NGHIỆP VỤ & PHÂN QUYỀN HÀNG RÀO BẢO VỆ (RBAC)

Hệ thống phân chia 3 cấp độ truy cập dựa trên JWT Payload (`role` & `isActive`):

### 2.1 Khách Hàng (Customer Portal)

- Xem danh mục sản phẩm, tìm kiếm từ khóa, lọc theo mức giá.
- Thêm/sửa/xóa giỏ hàng cá nhân, áp dụng mã giảm giá (Coupon).
- Đặt hàng COD hoặc thanh toán trực tuyến bảo mật VNPAY QR/ATM.
- Gửi tin nhắn tư vấn Realtime tới Nhân viên hỗ trợ.
- Khôi phục mật khẩu quên qua token email có thời hạn 1 giờ.

### 2.2 Nhân Viên (Staff Portal)

- Đăng nhập tài khoản Nhân viên được cấp.
- Sử dụng mô-đun **POS (Point of Sale)** tạo hóa đơn bán tại quầy cho khách mua trực tiếp.
- Giao diện **Messenger Console** tiếp nhận và trả lời tin nhắn trực tiếp từ Khách hàng.

### 2.3 Quản Trị Viên (Admin Dashboard)

- Toàn quyền Quản lý Sản phẩm (CRUD, cập nhật tồn kho, upload hình ảnh).
- Quản lý Đơn hàng (Duyệt đơn, Đã giao, Hủy đơn).
- Quản lý Mã giảm giá (Tạo coupon cố định hoặc theo %, giới hạn mức giảm tối đa).
- Thống kê doanh thu tổng quan và quản lý trạng thái kích hoạt tài khoản (`isActive`).

---

## 3. SƠ ĐỒ KIẾN TRÚC HỆ THỐNG & LUỒNG DỮ LIỆU (ARCHITECTURE & DATA FLOW)

### 3.1 Sơ đồ Tương tác Thành phần (System Architecture Diagram)

```text
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|                                                                                   |
|  React 19 (Vite SPA) + TailwindCSS + React Router v7                              |
|  Host: Vercel CDN (https://jewelry-store-wine-five.vercel.app)                     |
+-----------------------------------------------------------------------------------+
             |                                              ^
             | HTTP Rest API (Axios)                        | Socket.io WebSocket
             v                                              v
+-----------------------------------------------------------------------------------+
|                                 SERVER LAYER                                      |
|                                                                                   |
|  Node.js v18 + Express.js Server Instance                                         |
|  Host: Render PaaS (https://jewelry-store-r4uj.onrender.com)                       |
|                                                                                   |
|  [ Middlewares Ingress Pipeline ]                                                 |
|    ├── Helmet.js (HTTP Security Headers)                                          |
|    ├── Mongo-Sanitize (Strip $ and . for NoSQL Injection Protection)              |
|    ├── Rate-Limiter (Global 200 req/15m, Auth 15 req/15m)                         |
|    └── CORS Policy (Allowing *.vercel.app origins)                                |
|                                                                                   |
|  [ Performance Caching ]                                                          |
|    └── Node-Cache Layer (TTL 60s for Product Catalog Reads)                       |
+-----------------------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------------------+
|                                DATABASE LAYER                                     |
|                                                                                   |
|  MongoDB Atlas Cloud Cluster M0 (Managed Service)                                 |
|  Collections: Users, Jewelries, Orders, Carts, Coupons, Conversations, Messages   |
+-----------------------------------------------------------------------------------+
```

---

## 4. MÔ HÌNH DỮ LIỆU CHI TIẾT (DATABASE SCHEMA & INDEXING)

### 4.1 `users` Collection

| Field                  | Type     | Options / Constraints                  | Description            |
| :--------------------- | :------- | :------------------------------------- | :--------------------- |
| `_id`                  | ObjectId | Auto-generated Primary Key             | Độc nhất               |
| `name`                 | String   | Required, Trimmed                      | Họ và tên              |
| `email`                | String   | Required, Unique, Lowercase            | Email đăng nhập        |
| `password`             | String   | Required, Min length: 6                | Mật khẩu hash BcryptJS |
| `role`                 | String   | Enum: `["admin", "staff", "customer"]` | Phân quyền vai trò     |
| `isActive`             | Boolean  | Default: `true`                        | Trạng thái tài khoản   |
| `resetPasswordToken`   | String   | Default: `null`                        | Token quên mật khẩu    |
| `resetPasswordExpires` | Date     | Default: `null`                        | Hạn token (1 giờ)      |

### 4.2 `jewelries` Collection

| Field         | Type   | Options / Constraints               | Description            |
| :------------ | :----- | :---------------------------------- | :--------------------- |
| `title`       | String | Required, Trimmed                   | Tên sản phẩm trang sức |
| `category`    | String | Trimmed (e.g. "Nhẫn", "Dây chuyền") | Danh mục               |
| `description` | String | Trimmed                             | Mô tả chi tiết         |
| `price`       | Number | Required, Min: 0                    | Giá niêm yết (VNĐ)     |
| `quantity`    | Number | Min: 0, Default: 0                  | Tồn kho                |
| `image`       | String | Trimmed URL/Path                    | Ảnh sản phẩm           |
| `status`      | String | Enum: `["active", "completed"]`     | Trạng thái kinh doanh  |

**Indexes được tối ưu:**

- Single / Compound Index: `{ title: 1, category: 1, createdAt: -1 }`
- Text Search Index: `{ title: "text", description: "text", category: "text" }`

### 4.3 `coupons` Collection

| Field            | Type   | Options / Constraints           | Description             |
| :--------------- | :----- | :------------------------------ | :---------------------- |
| `code`           | String | Required, Unique, Uppercase     | Mã giảm giá             |
| `discountType`   | String | Enum: `["fixed", "percentage"]` | Phân loại giảm          |
| `discountValue`  | Number | Required, Min: 0                | Giá trị giảm            |
| `maxDiscount`    | Number | Default: `0`                    | Giảm tối đa (đối với %) |
| `minOrderValue`  | Number | Default: `0`                    | Đơn tối thiểu           |
| `expirationDate` | Date   | Required                        | Hạn sử dụng             |

---

## 5. CHI TIẾT DANH SÁCH API SPECS (API ENDPOINTS SPECIFICATION)

### 5.1 Auth Endpoints (`/api/auth`)

- **`POST /api/auth/signup`**: Đăng ký tài khoản khách hàng. (Payload: `name`, `email`, `password`).
- **`POST /api/auth/login`**: Đăng nhập (Strict Rate Limiting: 15 req/15 min). Trả về JWT Access Token.
- **`POST /api/auth/forgot`**: Nhập email nhận link khôi phục mật khẩu.
- **`POST /api/auth/reset`**: Nhập token và mật khẩu mới để reset.

### 5.2 Product Endpoints (`/api/jewelry`)

- **`GET /api/jewelry`**: Lấy danh sách sản phẩm. Tự động kiểm tra **Node-Cache**.
- **`GET /api/jewelry/:id`**: Lấy chi tiết 1 sản phẩm.
- **`POST /api/jewelry`**: [Admin Protect] Tạo mới sản phẩm. Tự động gọi `clearProductCache()`.
- **`PUT /api/jewelry/:id`**: [Admin Protect] Cập nhật sản phẩm. Tự động xóa cache.
- **`DELETE /api/jewelry/:id`**: [Admin Protect] Xóa sản phẩm. Tự động xóa cache.

### 5.3 Payment Endpoints (`/api/payment`)

- **`POST /api/payment/create_payment_url`**: Tạo URL thanh toán VNPAY chứa chữ ký HmacSHA512.
- **`GET /api/payment/vnpay_return`**: Callback URL VNPAY phản hồi sau khi khách hoàn tất thanh toán.

---

## 6. GIAO THỨC SOCKET.IO REALTIME MESSENGER (WEBSOCKET SPECS)

Hệ thống nhắn tin sử dụng thư viện **Socket.IO v4**:

- **Authentication:** Khách hàng hoặc Nhân viên truyền JWT Token trong tham số kết nối.
- **Events:**
  - `join_conversation`: Client gia nhập room nhắn tin riêng.
  - `send_message`: Khách hàng/Staff gửi tin nhắn -> Server lưu DB `messages` -> Emit `new_message` tới room.
  - `typing_start` / `typing_stop`: Hiệu ứng hiển thị chỉ báo đối phương đang gõ tin nhắn.

---

## 7. CÁC CƠ CHẾ BẢO MẬT & TỐI ƯU HIỆU NĂNG (SECURITY & CACHING)

### 7.1 Bảo vệ Đầu vào & Header (Helmet & Mongo Sanitize)

- **`helmet`**: Loại bỏ thông tin nhận diện server `X-Powered-By`, bật HSTS, Content Security Policy, X-Frame-Options chống Clickjacking.
- **`express-mongo-sanitize`**: Lọc tự động các toán tử truy vấn MongoDB nguy hại (`$gt`, `$ne`, `$where`) khỏi request body/query để ngăn chặn tấn công NoSQL Injection.

### 7.2 Giới hạn Tần suất Truy cập (Rate Limiting)

- **Global Limiter:** Giới hạn 200 requests/15 phút trên toàn bộ đường dẫn `/api/`.
- **Auth Limiter:** Khóa 15 phút nếu thử vượt quá 15 lần trên `/api/auth/login` và `/api/auth/signup`.

### 7.3 Tối ưu Caching (Node-Cache Layer)

- Sử dụng **`node-cache`** lưu trữ tạm kết quả của API sản phẩm trong 60 giây.
- Giúp giảm độ trễ phản hồi API từ 150ms xuống **dưới 5ms**, giải phóng công suất xử lý cho MongoDB Atlas.

---

## 8. BỘ KIỂM THỬ TỰ ĐỘNG & QUY TRÌNH CI/CD PIPELINE

### 8.1 Thống kê Bộ Test Tự động (22/22 Passed)

1. `tests/vnpayPayment.test.js`: Kiểm tra thuật toán HmacSHA512 & từ chối chữ ký giả mạo.
2. `tests/cartHelper.test.js`: Thử nghiệm thuật toán tính tổng tiền giỏ hàng & ship.
3. `tests/authApi.test.js`: Kiểm thử tích hợp Integration Test cho Signup/Login API.
4. `tests/couponController.test.js`: Kiểm tra logic giảm giá %, áp dụng mức giảm tối đa.
5. `tests/authMiddleware.test.js`: Thử nghiệm 6 kịch bản từ chối Token hết hạn / tài khoản bị vô hiệu hóa.

### 8.2 GitHub Actions Workflows (`.github/workflows/ci-cd.yml`)

Mỗi khi push code lên GitHub:

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [master]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18 }
      - run: npm ci && cd back-end && npm ci && cd ../front-end && npm ci
      - run: npm run lint
      - run: npm test
```

---

## 9. CẨM NANG VẬN HÀNH, BÀN GIAO & XỬ LÝ SỰ CỐ (OPERATIONS & DISASTER RECOVERY)

### 9.1 Khởi tạo Tài khoản & Dữ liệu Mẫu Ban Đầu

- **Khôi phục tài khoản Admin:** `node back-end/scripts/seedAdmin.js`
  - Email: `admin@jewelry.com` | Password: `AdminPassword123@`
- **Khởi tạo danh sách 8 sản phẩm mẫu:** `node back-end/scripts/seedProducts.js`
- **Sao chép dữ liệu từ máy local lên Cloud:** `node back-end/scripts/migrateData.js`

### 9.2 Quy trình Xử lý Sự cố (Troubleshooting Guide)

1. **Lỗi CORS / Network Error:**
   - Kiểm tra `server.js` xem domain Vercel hiện tại đã được cấu hình trong `allowedOrigins` hoặc `origin.endsWith(".vercel.app")` chưa.
2. **Lỗi 404 Route khi Refresh trên Vercel:**
   - Đảm bảo file `front-end/vercel.json` có cấu hình rewrite SPA: `{"routes": [{"src": "/(.*)", "dest": "/index.html"}]}`.
3. **Lỗi Build Root Directory:**
   - Trên **Vercel Settings**, kiểm tra Root Directory = `front-end`.
   - Trên **Render Settings**, kiểm tra Root Directory = `back-end`.
