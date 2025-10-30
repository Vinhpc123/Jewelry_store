//crud sản phẩm
import Jewelry from "../models/jewelry.js"; 


//lấy danh sách sản phẩm
export const getAllJewelry = async (req, res) => {
  try {
    const jewelry = await Jewelry.find().sort({ createdAt: -1 });
    res.status(200).json(jewelry);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//tạo sản phẩm
export const createJewelry = async(req, res) => {
  try{
    const { title, category, description, price, image, status, completedAt } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "Tên sản phẩm không hợp lệ!" });
    }

    const normalizedPrice = Number(price);
    if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
      return res.status(400).json({ message: "Giá sản phẩm không hợp lệ!" });
    }

    const jewelry = new Jewelry({
      title: title.trim(),
      category,
      description,
      price: normalizedPrice,
      image,
      status,
      completedAt,
    });
    
    const newJewelry = await jewelry.save();
    res.status(201).json(newJewelry);


  } catch (error) {
    console.error("Lỗi khi gọi createJewelry:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//cập nhật sản phẩm
export const updateJewelry = async (req, res) => {
  try {
    const { title, category, description, price, image, status, completedAt } = req.body;

    const updatePayload = {};
    if (typeof title === "string") updatePayload.title = title.trim();
    if (typeof category === "string") updatePayload.category = category;
    if (typeof description === "string") updatePayload.description = description;
    if (typeof image === "string") updatePayload.image = image;
    if (typeof status === "string") updatePayload.status = status;
    if (completedAt !== undefined) updatePayload.completedAt = completedAt;

    if (price !== undefined) {
      const normalizedPrice = Number(price);
      if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
        return res.status(400).json({ message: "GiA? s?n ph?m khA'ng h?p l?" });
      }
      updatePayload.price = normalizedPrice;
    }

    const updateJewelry = await Jewelry.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true }
    );
    if (!updateJewelry) {
      return res.status(404).json({ message: "không tồn tại" });
    }
    res.status(200).json(updateJewelry);
  } catch (error) {
    console.error("Lỗi khi updateJewelry:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

//xóa sản phẩm
export const deleteJewelry = async(req, res) => {
  try {
    const deleteJewelry = await Jewelry.findByIdAndDelete(req.params.id);
    if (!deleteJewelry) {
      return res.status(404).json({ message: "không tồn tại" });
    }
    res.status(200).json(deleteJewelry);
  } catch (error) {
    console.error("Lỗi khi gọi deleteJewelry:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }  
}
