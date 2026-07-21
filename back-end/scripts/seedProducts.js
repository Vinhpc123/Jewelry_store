import mongoose from "mongoose";
import Jewelry from "../src/models/jewelry.js";

const ATLAS_URI =
  "mongodb+srv://vinh7085_db_user:Vinh1104@cluster0.prbr8p4.mongodb.net/jewelry_store?appName=Cluster0";

const sampleProducts = [
  {
    title: "Nhẫn Kim Cương Vàng Trắng 18K Heritage",
    category: "Nhẫn",
    description: "Nhẫn chế tác thủ công với viên kim cương tự nhiên 0.5ct cắt giác tinh xảo.",
    price: 15500000,
    quantity: 15,
    image: "/nhẫn.jpg",
    status: "active",
  },
  {
    title: "Dây Chuyền Ngọc Trai Biển South Sea",
    category: "Dây chuyền",
    description: "Dây chuyền ngọc trai biển ánh vàng tự nhiên 12mm kết hợp móc khóa vàng 18k.",
    price: 18900000,
    quantity: 10,
    image: "/daychuyen.webp",
    status: "active",
  },
  {
    title: "Vòng Tay Bạc S925 Đính Đá Zirconia",
    category: "Vòng tay",
    description: "Vòng tay thiết kế thanh lịch sang trọng phù hợp đeo hàng ngày và dự tiệc.",
    price: 3200000,
    quantity: 25,
    image: "/vongtay.jpeg",
    status: "active",
  },
  {
    title: "Bông Tai Vàng Hồng 14K Đính Đá Sapphire",
    category: "Bông tai",
    description: "Bông tai nụ đá sapphire xanh thẫm hoàng gia bọc viền đá lấp lánh.",
    price: 8500000,
    quantity: 8,
    image: "/bongtai.webp",
    status: "active",
  },
  {
    title: "Nhẫn Cặp Vàng Ý 750 Khắc Tên",
    category: "Nhẫn",
    description: "Nhẫn cưới thiết kế tối giản tinh tế mang ý nghĩa gắn kết bền lâu.",
    price: 9800000,
    quantity: 20,
    image: "/nhẫn.jpg",
    status: "active",
  },
  {
    title: "Dây Chuyền Vàng 24K Mặt Chữ Phúc",
    category: "Dây chuyền",
    description: "Dây chuyền vàng nguyên chất chạm khắc hoa văn thủ công may mắn.",
    price: 24500000,
    quantity: 5,
    image: "/daychuyen.webp",
    status: "active",
  },
  {
    title: "Lắc Tay Vàng Trắng 18K Đính Kim Cương Hàng",
    category: "Vòng tay",
    description: "Lắc tay dáng tennis đính kết 45 viên kim cương tự nhiên nước F VVS.",
    price: 36000000,
    quantity: 4,
    image: "/vongtay.jpeg",
    status: "active",
  },
  {
    title: "Bông Tai Ngọc Trai Freshwater Dáng Dài",
    category: "Bông tai",
    description: "Bông tai dáng thả quyến rũ đính ngọc trai nước ngọt tự nhiên.",
    price: 2800000,
    quantity: 18,
    image: "/bongtai.webp",
    status: "active",
  },
];

async function seed() {
  console.log("🚀 Đang kết nối tới MongoDB Atlas để bơm sản phẩm mẫu...");
  await mongoose.connect(ATLAS_URI);
  console.log("✅ Đã kết nối thành công!");

  console.log("🧹 Đang dọn dẹp danh sách cũ...");
  await Jewelry.deleteMany({});

  console.log("💎 Đang tạo mới danh sách sản phẩm trang sức...");
  const created = await Jewelry.insertMany(sampleProducts);

  console.log(`🎉 ĐÃ BƠM THÀNH CÔNG ${created.length} SẢN PHẨM MẪU LÊN CLOUD ATLAS!`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Lỗi khi seed dữ liệu:", err);
  process.exit(1);
});
