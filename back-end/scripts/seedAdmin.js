import mongoose from "mongoose";
import User from "../src/models/user.js";

const ATLAS_URI =
  "mongodb+srv://vinh7085_db_user:Vinh1104@cluster0.prbr8p4.mongodb.net/jewelry_store?appName=Cluster0";

async function createAdmin() {
  console.log("🚀 Đang kết nối tới MongoDB Atlas để tạo tài khoản Admin...");
  await mongoose.connect(ATLAS_URI);
  console.log("✅ Đã kết nối thành công!");

  const adminEmail = "admin@jewelry.com";
  const adminPassword = "AdminPassword123@";

  // Xóa user admin cũ nếu có
  await User.deleteOne({ email: adminEmail });

  const adminUser = new User({
    name: "Quản Trị Viên",
    email: adminEmail,
    password: adminPassword,
    role: "admin",
    isActive: true,
    phone: "0901234567",
    address: "Hà Nội, Việt Nam",
  });

  await adminUser.save();

  console.log("--------------------------------------------------");
  console.log("🎉 TẠO TÀI KHOẢN ADMIN THÀNH CÔNG TRÊN CLOUD ATLAS!");
  console.log(`📧 Email đăng nhập:    ${adminEmail}`);
  console.log(`🔑 Mật khẩu:           ${adminPassword}`);
  console.log("--------------------------------------------------");

  await mongoose.disconnect();
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("❌ Lỗi khi tạo Admin:", err);
  process.exit(1);
});
