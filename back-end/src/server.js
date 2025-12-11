import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import http from "http";
import { fileURLToPath } from "url";

import jewelryRouters from "./routes/jewelryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import { initSocket } from "./socket/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
const server = http.createServer(app);

app.use(express.json());

app.use(
  cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true })
);

app.use("/uploads", express.static(uploadsDir));

app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Khong co file tai len" });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({ url: fileUrl });
});

app.use("/api/auth", authRoutes);
app.use("/api/jewelry", jewelryRouters);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

const io = initSocket(server);
app.set("io", io);

connectDB().then(() => {
  server.listen(port, () => {
    console.log(`Server bat dau chay tren cong ${port}`);
  });
});
