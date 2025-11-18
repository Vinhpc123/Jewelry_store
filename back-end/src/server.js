import express from "express";
import cors from "cors";
//xử lý file upload
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import jewelryRouters from "./routes/jewelryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";


dotenv.config();

//khai báo thư mục lưu trữ file upload
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

//nếu thư mục uploads chưa tồn tại thì tạo mới
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
//cấu hình multer để lưu file upload vào thư mục uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname || "");
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

const port = process.env.PORT || 5000;
const app = express();

///trung gian
app.use(express.json());

// CORS: cho phép frontend gọi API này
app.use(
  cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true })
);

// phục vụ tệp tĩnh từ thư mục uploads
app.use("/uploads", express.static(uploadsDir));

// API tải lên file
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file tải lên" });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({ url: fileUrl });
});

//truy cập auth
app.use("/api/auth", authRoutes);
//crud jewelry
app.use("/api/jewelry", jewelryRouters);
//gọi user routes
app.use("/api/users", userRoutes);
connectDB().then(() => {
  app.listen(port, () => {
  console.log(`Server bắt đầu chạy trên cổng ${port}`);
  });
});




