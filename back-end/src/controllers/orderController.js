import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Jewelry from "../models/jewelry.js";

export const createOrder = async (req, res) => {
  try {
    const { shipping, paymentMethod = "cod" } = req.body;

    if (!shipping?.fullName || !shipping?.phone || !shipping?.address) {
      return res.status(400).json({ message: "Thiếu thông tin giao hàng" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    // làm mới thông tin sản phẩm/tính giá
    const refreshedItems = [];
    for (const it of cart.items) {
      const product = await Jewelry.findById(it.productId);
      if (!product) continue;
      refreshedItems.push({
        productId: product._id,
        name: product.title || product.name || "Sản phẩm",
        price: Number(product.price) || 0,
        quantity: it.quantity,
        image: product.image,
        material: product.material,
      });
    }

    if (refreshedItems.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng không hợp lệ" });
    }

    const subtotal = refreshedItems.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
      0
    );
    const shippingFee = Number(req.body.shippingFee) || 0;
    const total = subtotal + shippingFee;

    const order = await Order.create({
      user: req.user._id,
      items: refreshedItems,
      shipping,
      paymentMethod,
      subtotal,
      shippingFee,
      total,
    });

    // clear cart sau khi đặt
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    console.error("Lỗi createOrder:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi getMyOrders:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getAllOrders = async (_req, res) => {
  try {
    const filter = {};
    const { status, user } = _req.query || {};
    if (status) filter.status = status;
    if (user) filter.user = user;

    const orders = await Order.find(filter)
      .populate({ path: "user", select: "name email phone" })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Loi getAllOrders:", error);
    res.status(500).json({ message: "Loi he thong" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    // chỉ chủ đơn hoặc admin
    if (String(order.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền xem đơn này" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Lỗi getOrderById:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "paid", "shipped", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Trạng thái không hợp lệ" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    order.status = status;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error("Lỗi updateStatus:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
