import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.mongodb_connection_string;
    await mongoose.connect(mongoUri);

    console.log("liên kết cơ sở dữ liệu thành công");
  } catch (error) {
    console.error("lỗi kết nối:", error);
    process.exit(1); // thoát ứng dụng khi kết nối thất bại
  }
};
