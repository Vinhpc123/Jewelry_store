import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.mongodb_connection_string,
    );

    console.log("lien ket csdl thanh cong");
  } catch (error) {
    console.error("loi ket noi csdl:", error);
    process.exit(1); // thoat ung dung khi ket noi that bai
  }
};
