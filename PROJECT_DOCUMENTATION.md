# 📑 BỘ TÀI LIỆU DỰ ÁN PHẦN MỀM CHUYÊN NGHIỆP VÀ TOÀN DIỆN

## DỰ ÁN: JEWELRY STORE - PREMIUM E-COMMERCE & REALTIME MANAGEMENT SYSTEM

_Tài liệu kỹ thuật hệ thống, đặc tả yêu cầu nghiệp vụ, API specs và cẩm nang vận hành bàn giao chuẩn Doanh nghiệp (Enterprise Standards)._

---

# 🏛️ PHẦN 1: TÀI LIỆU QUẢN LÝ DỰ ÁN (PROJECT DOCS)

## 1.1 Tài liệu Đặc tả Yêu cầu Nghiệp vụ (BRD / PRD - Business & Product Requirements)

### A. Bối cảnh & Bài toán Kinh doanh (Business Context & Motivation)

Ngành kinh doanh trang sức cao cấp yêu cầu sự kết hợp chặt chẽ giữa trải nghiệm mua sắm trực tuyến (Online E-Commerce) và bán hàng trực tiếp tại cửa hàng (In-Store POS). Dự án **Jewelry Store** được xây dựng nhằm giải quyết các mục tiêu cốt lõi:

- **Tối ưu hóa hành trình mua hàng B2C:** Cung cấp giao diện hiện đại, tìm kiếm đa tiêu chí, thanh toán trực tuyến an toàn và hỗ trợ tư vấn khách hàng thời gian thực qua Chat.
- **Tự động hóa quản lý tại quầy (POS):** Giúp nhân viên lập hóa đơn cho khách mua trực tiếp, tự động trừ tồn kho và đồng bộ với dữ liệu online.
- **Tập trung hóa công tác quản trị:** Giúp chủ doanh nghiệp theo dõi đơn hàng, thống kê doanh thu, quản lý chương trình khuyến mãi (Coupon) và phân quyền tài khoản chặt chẽ.

### B. Chân dung Người dùng (User Personas & Scenarios)

1. **Khách hàng (Customer):** Người tìm mua trang sức cao cấp, cần xem chi tiết hình ảnh, giá cả, tư vấn trực tiếp với nhân viên qua khung Chat và thanh toán VNPAY/COD.
2. **Nhân viên Cửa hàng (Staff):** Người trực tiếp tư vấn khách hàng qua Chat thời gian thực và thao tác trên giao diện POS để thanh toán cho khách mua trực tiếp tại quầy.
3. **Quản trị viên (Admin):** Người quản lý toàn bộ danh mục sản phẩm, theo dõi trạng thái đơn hàng, tạo mã giảm giá và quản lý nhân sự.

### C. Ma trận Phân quyền Chi tiết (RBAC Authorization Matrix)

| Chức năng / Hành động                     | Khách hàng (Customer) | Nhân viên (Staff) | Quản trị viên (Admin) |
| :---------------------------------------- | :-------------------: | :---------------: | :-------------------: |
| Xem danh sách & tìm kiếm sản phẩm         |          ✅           |        ✅         |          ✅           |
| Thêm giỏ hàng & đặt hàng (COD/VNPAY)      |          ✅           |        ✅         |          ✅           |
| Nhắn tin hỗ trợ Realtime (Chat)           |       ✅ (Gửi)        |   ✅ (Trả lời)    |     ✅ (Trả lời)      |
| Sử dụng Mô-đun POS bán tại quầy           |          ❌           |        ✅         |          ✅           |
| Tạo mới / Chỉnh sửa / Xóa sản phẩm        |          ❌           |        ❌         |          ✅           |
| Quản lý Mã giảm giá (Coupons)             |          ❌           |        ❌         |          ✅           |
| Cập nhật trạng thái Đơn hàng              |          ❌           |        ❌         |          ✅           |
| Quản lý Trạng thái Tài khoản (`isActive`) |          ❌           |        ❌         |          ✅           |

### D. Yêu cầu Phi chức năng Chi tiết (Non-Functional Requirements - NFR)

- **Độ sẵn sàng (SLA & Availability):** Hệ thống đạt độ sẵn sàng **99.9%** trên môi trường Cloud (Vercel CDN & Render PaaS).
- **Độ trễ Phản hồi API (API Latency):** API lấy danh sách sản phẩm đạt thời gian phản hồi **< 5ms** nhờ lớp In-Memory Cache (`node-cache`).
- **Độ trễ Tin nhắn Realtime (WebSocket Latency):** Truyền nhận tin nhắn 1-1 qua Socket.IO đạt độ trễ **< 100ms**.
- **Tính An toàn Bảo mật (Security Enforcement):**
  - Chống Brute-force: Khóa 15 phút nếu nhập sai quá 15 lần ở `/api/auth/login`.
  - Chống NoSQL Injection: Tự động loại bỏ toán tử `$`, `.` trong tham số request.
  - Security Headers: Sử dụng Helmet thiết lập 11 chuẩn bảo mật HTTP.
- **Tính Tương thích (Compatibility):** Giao diện Responsive hiển thị tối ưu trên Desktop, Tablet và Mobile.

---

## 1.2 Kế hoạch Dự án & Bảng Mốc Tiến độ (Project Plan & WBS Milestones)

```text
[ GIAI ĐOẠN 1: CODE QUALITY ] ──► [ GIAI ĐOẠN 2: TESTING ] ──► [ GIAI ĐOẠN 3: CLOUD DEPLOY ]
  • Prettier & ESLint v9 Flat       • 5 Test Suites             • MongoDB Atlas Cloud
  • Husky & lint-staged             • 22 Test Cases Pass        • Render & Vercel PaaS
                                                                • GitHub Actions CI/CD
                                                                         │
[ GIAI ĐOẠN 5: DOCUMENTATION ] ◄── [ GIAI ĐOẠN 4: SECURITY & CACHING ] ◄┘
  • System Architecture Specs       • Helmet & Mongo-Sanitize
  • Operations Playbook             • Express Rate Limiter
  • Axon Interview Guide            • Node-Cache (Sub-5ms)
```

---

# ⚙️ PHẦN 2: TÀI LIỆU ĐẶC TẢ KỸ THUẬT (TECHNICAL SPECS - FSD & API)

## 2.1 Kiến trúc Hệ thống & Sơ đồ Khối (System Architecture & Flowcharts)

### A. Sơ đồ Kiến trúc Tổng thể (Full Architecture Diagram)

```text
+---------------------------------------------------------------------------------------+
|                                CLIENT LAYER (FRONTEND)                                |
|                                                                                       |
|  React 19 SPA (Vite Engine) + TailwindCSS UI + React Router v7                        |
|  Hosted on: Vercel Global Edge Network (https://jewelry-store-wine-five.vercel.app)    |
|                                                                                       |
|  • Context API (CartContext)         • Axios API Interceptor (Bearer Token Header)   |
|  • Socket.io-client Connection       • Lucide React Components                       |
+---------------------------------------------------------------------------------------+
                                    │                           ▲
                                    │ HTTP / REST API           │ Socket.IO WebSockets
                                    ▼                           │
+---------------------------------------------------------------------------------------+
|                                SERVER LAYER (BACKEND)                                 |
|                                                                                       |
|  Node.js v18 LTS + Express.js API Server Instance                                     |
|  Hosted on: Render Cloud Services (https://jewelry-store-r4uj.onrender.com)           |
|                                                                                       |
|  [ Ingress Security & Pipeline Middlewares ]                                         |
|    ├── Helmet.js (HTTP Security Headers Protection)                                   |
|    ├── Mongo-Sanitize (Strip $ & . for NoSQL Injection Sanitization)                  |
|    ├── Rate-Limiter (Global API: 200 req/15m | Auth Routes: 15 req/15m)                  |
|    └── CORS Policy (Whitelist: *.vercel.app & localhost)                              |
|                                                                                       |
|  [ Business Logic & Caching ]                                                         |
|    ├── Auth Engine: JWT Sign & Verify + Bcrypt Password Hashing                       |
|    ├── Performance Cache: Node-Cache Layer (TTL 60s for Sub-5ms Reads)                |
|    └── Realtime Engine: Socket.IO WebSocket Server (Chat Broadcast)                   |
+---------------------------------------------------------------------------------------+
                                    │
                                    │ Mongoose ODM Connections
                                    ▼
+---------------------------------------------------------------------------------------+
|                               DATABASE LAYER (CLOUD DB)                               |
|                                                                                       |
|  MongoDB Atlas Cloud Cluster M0 (Managed Multi-Region DB)                             |
|  Collections: users, jewelries, orders, carts, coupons, conversations, messages       |
+---------------------------------------------------------------------------------------+
```

---

## 2.2 Đặc tả Mô hình Dữ liệu Chi tiết (Database ERD & Schema Specs)

### A. Collection `users` (Quản lý Tài khoản & Phân quyền)

- `_id` (ObjectId, Primary Key): ID độc nhất.
- `name` (String, Required, Trimmed): Họ tên người dùng.
- `email` (String, Required, Unique, Lowercase, Trimmed): Email cá nhân.
- `password` (String, Required): Mật khẩu hash BcryptJS (Salt round 10).
- `avatar` (String): URL ảnh đại diện.
- `phone` (String, Trimmed): Số điện thoại liên hệ.
- `address` (String, Trimmed): Địa chỉ giao hàng.
- `role` (String, Enum: `["admin", "staff", "customer"]`, Default: `"customer"`).
- `isActive` (Boolean, Default: `true`): Trạng thái kích hoạt tài khoản.
- `resetPasswordToken` (String, Default: `null`): Token khôi phục mật khẩu.
- `resetPasswordExpires` (Date, Default: `null`): Thời hạn hiệu lực token.

### B. Collection `jewelries` (Danh mục Trang sức)

- `_id` (ObjectId, Primary Key): ID sản phẩm.
- `title` (String, Required, Trimmed): Tên trang sức.
- `category` (String, Trimmed): Danh mục (Nhẫn, Dây chuyền, Vòng tay, Bông tai).
- `description` (String, Trimmed): Mô tả chi tiết sản phẩm.
- `price` (Number, Required, Min: 0): Giá bán niêm yết (VNĐ).
- `quantity` (Number, Min: 0, Default: 0): Số lượng tồn kho.
- `image` (String, Trimmed): Đường dẫn hình ảnh.
- `status` (String, Enum: `["active", "completed"]`, Default: `"active"`).
- _Indexes:_ Compound Index `{ title: 1, category: 1, createdAt: -1 }`, Text Search Index `{ title: "text", description: "text", category: "text" }`.

### C. Collection `coupons` (Mã giảm giá)

- `code` (String, Required, Unique, Uppercase): Mã Coupon.
- `discountType` (String, Enum: `["fixed", "percentage"]`): Hình thức giảm giá.
- `discountValue` (Number, Required, Min: 0): Số tiền hoặc % giảm.
- `maxDiscount` (Number, Default: 0): Số tiền giảm tối đa (áp dụng cho %).
- `minOrderValue` (Number, Default: 0): Giá trị đơn hàng tối thiểu.
- `expirationDate` (Date, Required): Ngày hết hạn.

### D. Collection `orders` (Quản lý Đơn hàng)

- `user` (ObjectId, Ref: `User`): ID khách hàng đặt đơn.
- `orderItems` (Array of Objects): Danh sách các sản phẩm (`jewelryId`, `quantity`, `price`).
- `shippingAddress` (Object): Địa chỉ nhận hàng (`address`, `phone`, `recipientName`).
- `totalAmount` (Number, Min: 0): Tổng số tiền hóa đơn.
- `paymentMethod` (String, Enum: `["COD", "VNPAY"]`).
- `isPaid` (Boolean, Default: `false`), `paidAt` (Date).
- `status` (String, Enum: `["pending", "processing", "shipped", "delivered", "cancelled"]`).

---

## 2.3 Đặc tả Chức năng Chi tiết (Functional Specification Document - FSD)

### A. Thuật toán Thanh toán VNPAY Online & Kiểm tra Chữ ký HmacSHA512

1. Khi khách hàng bấm "Thanh toán VNPAY", Client gửi request `POST /api/payment/create_payment_url`.
2. Backend thu thập các thông số chuẩn của VNPAY (`vnp_Amount`, `vnp_TxnRef`, `vnp_OrderInfo`, `vnp_CreateDate`,...).
3. Sắp xếp mảng tham số theo thứ tự Alphabet và khởi tạo chữ ký checksum bằng thuật toán **HmacSHA512** với Secret Key của VNPAY.
4. Trả về URL dẫn đến Cổng VNPAY.
5. Khi khách hàng thanh toán xong, VNPAY chuyển hướng về Callback `GET /api/payment/vnpay_return`.
6. Backend trích xuất chữ ký `vnp_SecureHash`, tái tạo lại chữ ký checksum từ các tham số nhận về và đối soát. Nếu chữ ký hợp lệ và `vnp_ResponseCode == "00"`, hệ thống ghi nhận đơn hàng thành công (`isPaid = true`).

### B. Cơ chế In-Memory Caching & Xóa Cache Tự Động (Cache Invalidation)

1. Request `GET /api/jewelry` gửi từ Client.
2. Controller tạo `cacheKey = products_${q}_${category}_${limit}_${page}`.
3. Kiểm tra trong `Node-Cache`: Nếu có dữ liệu trong bộ nhớ RAM, trả về lập tức (độ trễ < 5ms).
4. Nếu chưa có (Cache Miss), truy vấn MongoDB Atlas -> Lưu kết quả vào Cache với TTL 60s -> Trả về Client.
5. Ngay khi Admin gọi các hàm Mutation (`createJewelry`, `updateJewelry`, `deleteJewelry`), hàm `clearProductCache()` sẽ lập tức được kích hoạt để xóa sạch RAM Cache, đảm bảo dữ liệu mới nhất được phản hồi cho người dùng tiếp theo.

---

## 2.4 Tài liệu API Specs Đầy đủ (RESTful API Specifications)

### A. Quản lý Xác thực (`/api/auth`)

| Method | Endpoint            | Access                | Description                 | Request Body                |
| :----- | :------------------ | :-------------------- | :-------------------------- | :-------------------------- |
| `POST` | `/api/auth/signup`  | Public                | Đăng ký tài khoản mới       | `{ name, email, password }` |
| `POST` | `/api/auth/login`   | Public (Rate-Limited) | Đăng nhập hệ thống          | `{ email, password }`       |
| `POST` | `/api/auth/forgot`  | Public                | Yêu cầu reset mật khẩu      | `{ email }`                 |
| `POST` | `/api/auth/reset`   | Public                | Đặt lại mật khẩu mới        | `{ token, password }`       |
| `GET`  | `/api/auth/profile` | Protected             | Lấy thông tin user hiện tại | Header: `Bearer <token>`    |

### B. Quản lý Sản phẩm (`/api/jewelry`)

| Method   | Endpoint           | Access        | Description              | Query / Body                                  |
| :------- | :----------------- | :------------ | :----------------------- | :-------------------------------------------- |
| `GET`    | `/api/jewelry`     | Public        | Lấy danh sách (Có Cache) | `?q=nhan&category=Nhẫn&limit=10&page=1`       |
| `GET`    | `/api/jewelry/:id` | Public        | Lấy chi tiết sản phẩm    | Parameter: `id`                               |
| `POST`   | `/api/jewelry`     | Admin Protect | Tạo mới sản phẩm         | `{ title, category, price, quantity, image }` |
| `PUT`    | `/api/jewelry/:id` | Admin Protect | Cập nhật sản phẩm        | `{ title, price, quantity, status }`          |
| `DELETE` | `/api/jewelry/:id` | Admin Protect | Xóa sản phẩm             | Parameter: `id`                               |

---

# 📖 PHẦN 3: TÀI LIỆU DÀNH CHO NGƯỜI DÙNG & VẬN HÀNH (USER & SYSTEM DOCS)

## 3.1 Tài liệu Hướng dẫn Sử dụng (User Manual)

### A. Hướng dẫn Dành cho Khách hàng (Customer Experience)

1. **Khám phá Sản phẩm:** Mở trang web [jewelry-store-wine-five.vercel.app](https://jewelry-store-wine-five.vercel.app), sử dụng thanh tìm kiếm hoặc các nút lọc danh mục (Nhẫn, Dây chuyền, Vòng tay, Bông tai).
2. **Thêm vào Giỏ hàng & Áp Coupon:** Chọn sản phẩm, bấm **Thêm vào giỏ**. Mở giỏ hàng, gõ mã giảm giá (ví dụ: `SUMMER2026`) để nhận chiết khấu.
3. **Thanh toán VNPAY:** Chọn hình thức thanh toán VNPAY -> Hệ thống chuyển sang giao diện cổng thanh toán VNPAY -> Dùng ứng dụng Ngân hàng quét mã QR để hoàn tất.
4. **Chat Tư vấn Realtime:** Bấm vào biểu tượng hình bong bóng Chat ở góc phải dưới màn hình để kết nối và gửi tin nhắn trực tiếp cho nhân viên hỗ trợ.

### B. Hướng dẫn Dành cho Nhân viên & Admin (Admin Console & POS Manual)

1. **Đăng nhập Hệ thống:** Đăng nhập tại `/login` bằng tài khoản Admin:
   - **Email:** `admin@jewelry.com`
   - **Password:** `AdminPassword123@`
2. **Mô-đun POS (Bán tại quầy):** Nhân viên chọn sản phẩm khách mua tại quầy -> Bấm **Tạo đơn POS** -> Xuất hóa đơn và thanh toán trực tiếp.
3. **Quản lý Danh mục & Sản phẩm:** Vào tab Quản lý sản phẩm -> Bấm **Thêm mới** -> Điền tên, giá, số lượng tồn kho và đính kèm đường dẫn hình ảnh.
4. **Trả lời Chat Khách hàng:** Vào giao diện Chat Messenger -> Chọn cuộc hội thoại của khách hàng -> Nhập nội dung trả lời thời gian thực.

---

## 3.2 Tài liệu Triển khai & Cấu hình Vận hành (Deployment & Operations Manual)

### A. Cấu hình Biến Môi trường (`.env` Configuration)

Tạo file `.env` tại thư mục `jewelry-project/back-end/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://vinh7085_db_user:Vinh1104@cluster0.prbr8p4.mongodb.net/jewelry_store?appName=Cluster0
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9_jewelry_secret_key_2026
FRONTEND_URL=https://jewelry-store-wine-five.vercel.app
VNP_TMNCODE=YOUR_VNPAY_TMNCODE
VNP_HASHSECRET=YOUR_VNPAY_HASHSECRET
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURNURL=https://jewelry-store-r4uj.onrender.com/api/payment/vnpay_return
```

### B. Lệnh Khai Thác & Khai Tháo Dữ Liệu Mẫu (Management Scripts)

- **Tạo tài khoản Admin mặc định:** `node back-end/scripts/seedAdmin.js`
- **Nạp 8 sản phẩm mẫu chuẩn:** `node back-end/scripts/seedProducts.js`
- **Sao chép dữ liệu từ Local lên Cloud:** `node back-end/scripts/migrateData.js`

### C. Bảng Xử lý Sự cố Thường gặp (Troubleshooting Matrix)

| Hiện tượng lỗi                               | Nguyên nhân gây ra                | Cách xử lý (Resolution)                                                                                              |
| :------------------------------------------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **Lỗi `Network Error` trên Frontend**        | CORS bị chặn hoặc sai URL Backend | Kiểm tra `server.js` xem domain Vercel đã có trong whitelist chưa. Cập nhật `VITE_API_BASE_URL` trên Vercel.         |
| **Báo lỗi 404 khi Refresh trang Vercel**     | Thiếu file rewrite SPA Routing    | Kiểm tra file `front-end/vercel.json` xem có khối rule `{"routes": [{"src": "/(.*)", "dest": "/index.html"}]}` chưa. |
| **Lỗi Build trên Render (`does not exist`)** | Cấu hình sai Root Directory       | Vào Render Dashboard -> Settings -> Sửa **Root Directory** thành `back-end`.                                         |
| **Lỗi Build trên Vercel**                    | Cấu hình sai Root Directory       | Vào Vercel Dashboard -> Settings -> Sửa **Root Directory** thành `front-end`.                                        |
