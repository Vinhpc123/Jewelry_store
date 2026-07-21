# 💎 Jewelry Store - Premium Full-Stack E-Commerce & Realtime Support Platform

![CI/CD Pipeline](https://github.com/Vinhpc123/Jewelry_store/actions/workflows/ci-cd.yml/badge.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18.x-green.svg)
![React](https://img.shields.io/badge/React-v19.x-blue.svg)
![License](https://img.shields.io/badge/License-ISC-orange.svg)
![Tests](https://img.shields.io/badge/Jest%20Tests-22%20Passed-brightgreen.svg)

Hệ thống thương mại điện tử mua bán trang sức cao cấp Full-Stack MERN được xây dựng theo tiêu chuẩn **Enterprise Production-Ready**. Dự án tích hợp các công nghệ tiên tiến như **Realtime WebSocket Chat**, **VNPAY Payment Gateway**, **MongoDB Atlas Cloud**, **Automated Testing Suite (Jest/Supertest)**, **CI/CD Pipeline (GitHub Actions)** và **Hệ thống Bảo mật Enterprise (Helmet, Rate Limiting, NoSQL Sanitization, Node-Cache)**.

---

## 🌐 Live Demo & Production Credentials

- **Frontend Live (Vercel):** [https://jewelry-store-wine-five.vercel.app](https://jewelry-store-wine-five.vercel.app)
- **Backend API (Render):** [https://jewelry-store-r4uj.onrender.com](https://jewelry-store-r4uj.onrender.com)
- **Tài khoản Demo Admin:**
  - **Email:** `admin@jewelry.com`
  - **Password:** `AdminPassword123@`

---

## ⚡ Key Features

### 🛒 Khách hàng (Customer Experience)

- **Khám phá & Tìm kiếm:** Tìm kiếm sản phẩm thông minh theo từ khóa, lọc theo danh mục (Nhẫn, Dây chuyền, Vòng tay, Bông tai) và phân trang.
- **Giỏ hàng & Mã giảm giá:** Thêm/sửa/xóa sản phẩm trong giỏ hàng, áp dụng Coupon giảm giá theo số tiền cố định hoặc % có hạn mức tối đa.
- **Thanh toán VNPAY Online:** Tích hợp cổng thanh toán trực tuyến VNPAY mã hóa chữ ký HmacSHA512 an toàn tuyệt đối.
- **Realtime Chat Support:** Trò chuyện trực tiếp 1-1 với nhân viên tư vấn thông qua Socket.IO với độ trễ < 100ms.
- **Xác thực & Khôi phục Mật khẩu:** Đăng ký, Đăng nhập JWT, Đăng nhập Google và gửi email đặt lại mật khẩu qua Nodemailer.

### 🛡️ Quản trị viên (Admin & Staff Management)

- **Báo cáo Dashboard:** Thống kê doanh thu, số lượng đơn hàng, sản phẩm và tổng người dùng.
- **Quản lý Sản phẩm & Đơn hàng:** CRUD sản phẩm, cập nhật trạng thái đơn hàng (Đã thanh toán, Đã giao, Đã hủy).
- **Hệ thống POS tại quầy:** Hỗ trợ nhân viên tạo đơn hàng trực tiếp tại cửa hàng và thanh toán QR VNPAY.
- **Realtime Messenger Console:** Giao diện hỗ trợ tư vấn tin nhắn khách hàng thời gian thực.

---

## 🛠️ Architecture & Tech Stack

```text
+-------------------------------------------------------------------+
|                     FRONTEND (React 19 + Vite)                    |
|       TailwindCSS | React Router v7 | Axios | Socket.io-client    |
+-------------------------------------------------------------------+
                                  |
                           HTTP / WebSocket
                                  v
+-------------------------------------------------------------------+
|               BACKEND API (Node.js + Express.js)                  |
|     Security: Helmet | Rate-Limiter | Mongo-Sanitize | Node-Cache   |
|     Auth: JWT | Bcrypt | Realtime: Socket.io | Payment: VNPAY      |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                    DATABASE (MongoDB Atlas Cloud)                 |
|               Mongoose ODM | Indexed Collections                  |
+-------------------------------------------------------------------+
```

- **Frontend:** React 19, Vite, TailwindCSS, Lucide Icons, Socket.IO Client, Axios.
- **Backend:** Node.js, Express.js, Mongoose ODM, JWT, BcryptJS, Socket.IO, Nodemailer, Multer.
- **Database:** MongoDB Atlas (Cloud Cluster M0).
- **Bảo mật & Performance:** Helmet, Express-Rate-Limit, Express-Mongo-Sanitize, Node-Cache (TTL 60s).
- **Testing & Quality:** Jest, Supertest, Prettier, ESLint v9 Flat Config, Husky & lint-staged.
- **DevOps & Deployment:** GitHub Actions CI/CD, Vercel, Render.com.

---

## 🧪 Automated Testing Suite (22/22 Passed)

Dự án tích hợp bộ kiểm thử tự động toàn diện cho các API cốt lõi và nghiệp vụ quan trọng:

```bash
PASS tests/vnpayPayment.test.js     (Chữ ký HmacSHA512 VNPAY & Bảo mật Callback)
PASS tests/cartHelper.test.js       (Tính tổng Subtotal, Phí vận chuyển & Chiết khấu)
PASS tests/authApi.test.js          (Integration Test API Signup & Login với Supertest)
PASS tests/couponController.test.js  (Thuật toán giảm giá cố định & giảm % có Cap Max)
PASS tests/authMiddleware.test.js   (Xác thực JWT Token & Phân quyền Middleware)

Test Suites: 5 passed, 5 total
Tests:       22 passed, 22 total
```

---

## 📁 Project Structure

```text
jewelry-project/
├── .github/
│   └── workflows/
│       └── ci-cd.yml             # GitHub Actions CI/CD Pipeline
├── .husky/
│   └── pre-commit                # Git pre-commit hook (lint-staged)
├── back-end/
│   ├── src/
│   │   ├── config/               # Database connection config
│   │   ├── controllers/          # Business logic & API handlers
│   │   ├── middleware/           # Auth JWT & Role authorization
│   │   ├── models/               # Mongoose schemas (User, Jewelry, Order, Coupon, Cart, Chat)
│   │   ├── routes/               # API endpoint definitions
│   │   ├── socket/               # Socket.IO WebSocket handlers
│   │   ├── utils/                # Helper functions (cart, email, token)
│   │   └── server.js             # Express app entry point & security setups
│   ├── scripts/                  # Seed & Migration scripts (seedAdmin, seedProducts)
│   ├── tests/                    # Automated Jest & Supertest test suites
│   ├── eslint.config.js          # ESLint v9 Flat Config for Node.js
│   └── package.json
├── front-end/
│   ├── src/
│   │   ├── components/           # UI Components (Admin & Customer)
│   │   ├── context/              # React Context (CartContext)
│   │   ├── lib/                  # Axios API instance & Custom Hooks
│   │   └── pages/                # Page views (Shop, Detail, Cart, Chat, Admin POS/Dashboard)
│   ├── eslint.config.js          # ESLint v9 Flat Config for React
│   ├── vercel.json               # Vercel SPA routing rewrite config
│   └── package.json
├── .prettierrc                   # Prettier formatting rules
├── .prettierignore               # Prettier ignore paths
├── package.json                  # Root monorepo scripts & lint-staged config
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Requirements

- Node.js >= 18.x
- Git

### 2. Installation

Chạy lệnh cài đặt cho toàn bộ Monorepo từ thư mục gốc:

```bash
git clone https://github.com/Vinhpc123/Jewelry_store.git
cd Jewelry_store/jewelry-project
npm run prepare
```

### 3. Running Development Servers

Chạy đồng thời cả Frontend và Backend bằng một lệnh duy nhất:

```bash
npm start
```

- **Frontend App:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

### 4. Running Scripts

- **Chạy Automated Tests:** `npm test`
- **Chạy ESLint Linter:** `npm run lint`
- **Tự động Fix Format & Lint:** `npm run lint:fix` && `npm run format`

---

## 📄 License

Project is licensed under the **ISC License**.
