# Jewelry Store

Ứng dụng full-stack bán trang sức, gồm giao diện khách hàng và hệ thống quản trị cho admin/staff. Dự án hỗ trợ mua hàng online, POS tại quầy, thanh toán VNPAY, chat realtime và khôi phục mật khẩu qua email.

## Công nghệ sử dụng

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO
- Khác: Multer, Nodemailer, VNPAY

## Tính năng chính

- Khách hàng: xem sản phẩm, thêm vào giỏ hàng, đặt hàng, áp mã giảm giá, theo dõi đơn hàng, cập nhật hồ sơ, chat hỗ trợ
- Admin/Staff: quản lý sản phẩm, người dùng, đơn hàng, coupon, POS và chat với khách hàng
- Hệ thống: đăng nhập, phân quyền, upload ảnh, thanh toán online, reset mật khẩu

## Cấu trúc thư mục

- `front-end/`: giao diện người dùng viết bằng React
- `back-end/`: API, xử lý nghiệp vụ và kết nối MongoDB
- `back-end/uploads/`: thư mục lưu ảnh upload trong lúc chạy
```text
jewelry-project/
|-- back-end/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- socket/
|   |   `-- utils/
|   |-- uploads/
|   `-- package.json
|-- front-end/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- data/
|   |   |-- lib/
|   |   `-- pages/
|   `-- package.json
|-- package.json
`-- README.md
```


## Cài đặt

Từ thư mục gốc của project, cài dependencies:

```bash
npm install
npm install --prefix back-end
npm install --prefix front-end
```

## Chạy dự án

Chạy đồng thời frontend và backend từ thư mục gốc:

```bash
npm start
```

Mặc định:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

