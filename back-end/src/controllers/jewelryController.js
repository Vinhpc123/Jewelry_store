// CRUD san pham
import Jewelry from "../models/jewelry.js";

// Lay danh sach san pham
export const getAllJewelry = async (req, res) => {
  try {
    const { q, category } = req.query;

    const query = {};

    if (q?.trim()) {
      const keyword = q.trim();
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
      ];
    }

    if (category?.trim()) {
      query.category = { $regex: category.trim(), $options: "i" };
    }

    const jewelry = await Jewelry.find(query).sort({ createdAt: -1 });
    res.status(200).json(jewelry);
  } catch (error) {
    console.error("Loi khi lay san pham:", error);
    res.status(500).json({ message: "Loi he thong" });
  }
};

// Tao san pham
export const createJewelry = async (req, res) => {
  try {
    const { title, category, description, price, image, status, completedAt } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "Ten san pham khong hop le!" });
    }

    const normalizedPrice = Number(price);
    if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
      return res.status(400).json({ message: "Gia san pham khong hop le!" });
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
    console.error("Loi khi goi createJewelry:", error);
    res.status(500).json({ message: "Loi he thong" });
  }
};

// Cap nhat san pham
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
        return res.status(400).json({ message: "Gia san pham khong hop le" });
      }
      updatePayload.price = normalizedPrice;
    }

    const updateJewelry = await Jewelry.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
    });
    if (!updateJewelry) {
      return res.status(404).json({ message: "Khong ton tai" });
    }
    res.status(200).json(updateJewelry);
  } catch (error) {
    console.error("Loi khi updateJewelry:", error);
    res.status(500).json({ message: "Loi he thong" });
  }
};

// Xoa san pham
export const deleteJewelry = async (req, res) => {
  try {
    const deleteJewelry = await Jewelry.findByIdAndDelete(req.params.id);
    if (!deleteJewelry) {
      return res.status(404).json({ message: "Khong ton tai" });
    }
    res.status(200).json(deleteJewelry);
  } catch (error) {
    console.error("Loi khi goi deleteJewelry:", error);
    res.status(500).json({ message: "Loi he thong" });
  }
};
