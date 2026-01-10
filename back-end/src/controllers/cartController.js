import Cart from "../models/cart.js";
import Jewelry from "../models/jewelry.js";

const ensureCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }
  return cart;
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    res.status(200).json(cart || { user: req.user._id, items: [] });
  } catch (error) {
    console.error("Loi getCart:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const addOrUpdateItem = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: "Thiếu productId" });
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) return res.status(400).json({ message: "Số lượng không hợp lệ" });

    const product = await Jewelry.findById(productId);
    if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const cart = await ensureCart(req.user._id);
    const idx = cart.items.findIndex((it) => String(it.productId) === String(productId));
    const itemPayload = {
      productId: product._id,
      name: product.title || product.name || "Sản phẩm",
      price: Number(product.price) || 0,
      image: product.image,
      material: product.material,
      quantity: qty,
    };

    if (idx >= 0) {
      cart.items[idx] = { ...cart.items[idx].toObject(), ...itemPayload };
    } else {
      cart.items.push(itemPayload);
    }
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Loi addOrUpdateItem:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(200).json({ user: req.user._id, items: [] });

    cart.items = cart.items.filter((it) => String(it.productId) !== String(productId));
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Loi removeItem:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
      return res.status(200).json(cart);
    }
    return res.status(200).json({ user: req.user._id, items: [] });
  } catch (error) {
    console.error("Loi clearCart:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
