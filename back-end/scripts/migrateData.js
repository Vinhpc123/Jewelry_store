import mongoose from "mongoose";

const LOCAL_URI = "mongodb://127.0.0.1:27017/jewelry_store";
const ATLAS_URI =
  "mongodb+srv://vinh7085_db_user:Vinh1104@cluster0.prbr8p4.mongodb.net/jewelry_store?appName=Cluster0";

async function migrate() {
  console.log("🚀 Bắt đầu quá trình sao chép dữ liệu từ Local lên Atlas Cloud...");

  // 1. Kết nối DB Local
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log("✅ Đã kết nối MongoDB Local thành công!");

  // 2. Kết nối DB Cloud Atlas
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log("✅ Đã kết nối MongoDB Atlas Cloud thành công!");

  // 3. Lấy danh sách tất cả các collections từ Local
  const collections = await localConn.db.listCollections().toArray();

  if (collections.length === 0) {
    console.log("⚠️ Không tìm thấy collection nào ở Local MongoDB.");
  }

  for (const col of collections) {
    const colName = col.name;
    console.log(`📦 Đang sao chép collection: [${colName}]...`);

    const localDocs = await localConn.db.collection(colName).find({}).toArray();
    if (localDocs.length > 0) {
      // Clear old docs in atlas before inserting
      await atlasConn.db.collection(colName).deleteMany({});
      await atlasConn.db.collection(colName).insertMany(localDocs);
      console.log(`  🎉 Đã chuyển ${localDocs.length} bản ghi của [${colName}] lên Cloud!`);
    } else {
      console.log(`  ℹ️ Collection [${colName}] rỗng, bỏ qua.`);
    }
  }

  console.log("✨ HOÀN TẤT SAO CHÉP DỮ LIỆU LÊN CLOUD ATLAS!");
  await localConn.close();
  await atlasConn.close();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Lỗi trong quá trình migrate:", err);
  process.exit(1);
});
