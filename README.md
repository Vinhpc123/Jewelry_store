# Jewelry Store

Ứng dụng full-stack bán trang sức kèm trang quản trị, hỗ trợ bán online và POS, thanh toán VNPAY, chat thời gian thực và khôi phục mật khẩu qua email.

## Tính năng nổi bật
- Khách hàng: duyệt danh mục (nhẫn, dây chuyền, vòng tay, bông tai), xem chi tiết sản phẩm, tìm kiếm/tìm nâng cao, giỏ hàng, áp mã giảm giá, đặt hàng COD/online, theo dõi đơn, hồ sơ cá nhân, blog, chat hỗ trợ.
- Quản trị/nhân viên: dashboard tổng quan, CRUD sản phẩm (kèm upload ảnh), quản lý tồn kho/trạng thái, quản lý người dùng (khóa/mở, phân quyền admin/staff/customer), đơn hàng (xử lý, hủy, hoàn kho), mã giảm giá (áp dụng/giới hạn), POS tại quầy, hộp thư hỗ trợ chat.
- Thanh toán & bảo mật: thanh toán VNPAY (sandbox), JWT auth kèm khóa tạm khi nhập sai nhiều lần, reset mật khẩu qua email, CORS cấu hình theo domain FE, upload file qua `/api/upload`.
- Thời gian thực: chat khách hàng - admin/staff và cập nhật qua `socket.io`.

## Kiến trúc & công nghệ
- Frontend: React 19 + Vite, Tailwind CSS, Radix UI, React Router, Axios, `socket.io-client`.
- Backend: Node.js, Express, MongoDB/Mongoose, JWT, Multer (upload), Nodemailer (SMTP), `socket.io`.
- Dev tooling: ESLint, concurrently (chạy FE/BE song song).

## Cấu trúc thư mục
- `front-end/`: mã nguồn React (pages cho khách, admin, auth; hooks; context; styles).
- `back-end/`: API Express, socket server, controllers/routes/models, upload lưu tại `back-end/uploads`.
- `package.json` gốc: script chạy đồng thời FE/BE với `concurrently`.

## Yêu cầu hệ thống
- Node.js >= 18
- MongoDB instance
- Tài khoản SMTP (gửi email reset)
- Thông tin sandbox VNPAY (TMN Code, Hash Secret)

## Thiết lập & chạy
1) Cài phụ thuộc:
```bash
npm install                    # cài concurrently + socket libs ở root
npm install --prefix back-end
npm install --prefix front-end
