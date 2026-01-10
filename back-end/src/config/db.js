import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.mongodb_connection_string,
    );

    console.log("liên kết cơ sở dữ liệu thành công");
  } catch (error) {
    console.error("lỗi kết nối:", error);
    process.exit(1); // thoát ứng dụng khi kết nối thất bại
  }
};
