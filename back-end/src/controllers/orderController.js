import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Jewelry from "../models/jewelry.js";
import Coupon from "../models/coupon.js";
import { computeCouponDiscount } from "./couponController.js";

const restockItems = async (order) => {
  for (const it of order.items) {
    const qty = Number(it.quantity) || 0;
    if (qty <= 0) continue;
    const product = await Jewelry.findById(it.productId);
    if (!product) continue;
    product.quantity = Math.max(0, Number(product.quantity) + qty);
    if (product.quantity > 0 && product.status === "completed") {
      product.status = "active";
    }
    await product.save();
  }
};

export const createOrder = async (req, res) => {
  try {
    const { shipping, paymentMethod = "cod", couponCode: rawCouponCode } = req.body;

    if (!shipping?.fullName || !shipping?.phone || !shipping?.address) {
      return res.status(400).json({ message: "Thieu thong tin giao hang" });
    }

    const normalizedMethod = String(paymentMethod || "").toLowerCase();
    if (!["cod", "online"].includes(normalizedMethod)) {
      return res.status(400).json({ message: "Phuong thuc thanh toan khong hop le" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Gio hang trong" });
    }

    // Lam moi thong tin san pham/tinh gia va kiem tra ton kho
    const refreshedItems = [];
    const productsToUpdate = [];
    for (const it of cart.items) {
      const product = await Jewelry.findById(it.productId);
      if (!product) {
        return res.status(400).json({ message: "San pham trong gio hang khong con ton tai." });
      }

      const requestedQty = Number(it.quantity) || 0;
      if (requestedQty <= 0) {
        return res.status(400).json({ message: "So luong san pham khong hop le." });
      }

      if (product.quantity < requestedQty) {
        return res.status(400).json({
          message: `San pham "${product.title || product.name || "khong xac dinh"}" chi con ${product.quantity} trong kho.`,
        });
      }

      productsToUpdate.push({
        product,
        newQty: Math.max(0, product.quantity - requestedQty),
      });

      refreshedItems.push({
        productId: product._id,
        name: product.title || product.name || "San pham",
        price: Number(product.price) || 0,
        quantity: requestedQty,
        image: product.image,
        material: product.material,
      });
    }

    if (refreshedItems.length === 0) {
      return res.status(400).json({ message: "Gio hang khong hop le" });
    }

    const subtotal = refreshedItems.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
      0
    );
    const shippingFee = Number(req.body.shippingFee) || 0;
    let discount = 0;
    let couponCode = "";

    if (rawCouponCode) {
      const code = String(rawCouponCode || "").trim().toUpperCase();
      const coupon = await Coupon.findOne({ code });
      if (!coupon) return res.status(400).json({ message: "Ma giam gia khong ton tai" });
      const now = new Date();
      if (!coupon.active) return res.status(400).json({ message: "Ma giam gia da bi khoa" });
      if (coupon.startDate && now < coupon.startDate)
        return res.status(400).json({ message: "Ma giam gia chua den ngay ap dung" });
      if (coupon.endDate && now > coupon.endDate) return res.status(400).json({ message: "Ma giam gia da het han" });
      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "Ma giam gia da het luot su dung" });
      }
      if (subtotal < (coupon.minOrder || 0)) {
        return res
          .status(400)
          .json({ message: `Don hang can toi thieu ${(coupon.minOrder || 0).toLocaleString("vi-VN")} VND` });
      }

      discount = computeCouponDiscount(coupon, subtotal);
      couponCode = coupon.code;
      if (discount > 0) {
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const total = Math.max(0, subtotal + shippingFee - discount);

    const order = await Order.create({
      user: req.user._id,
      items: refreshedItems,
      shipping,
      paymentMethod: normalizedMethod,
      couponCode,
      discount,
      subtotal,
      shippingFee,
      total,
      source: "online",
    });

    // Tru ton kho sau khi dat hang thanh cong
    for (const { product, newQty } of productsToUpdate) {
      product.quantity = newQty;
      if (newQty <= 0) {
        product.status = "completed";
      }
      await product.save();
    }

    // clear cart sau khi dat
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    console.error("Loi createOrder:", error);
    res.status(500).json({ message: "Loi he thong" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Loi getMyOrders:", error);
    res.status(500).json({ message: "Loi he thong" });
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
    if (!order) return res.status(404).json({ message: "Khong tim thay don hang" });
    // chi chu don hoac admin
    if (String(order.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Khong co quyen xem don nay" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Loi getOrderById:", error);
    res.status(500).json({ message: "Loi he thong" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Khong tim thay don hang" });

    const isOwner = String(order.user) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Khong co quyen huy don nay" });

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Chi huy duoc don dang xu ly" });
    }

    order.status = "cancelled";
    if (order.couponCode) {
      const coupon = await Coupon.findOne({ code: order.couponCode });
      if (coupon && coupon.usedCount > 0) {
        coupon.usedCount = Math.max(0, coupon.usedCount - 1);
        await coupon.save();
      }
    }
    await restockItems(order);
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error("Loi cancelOrder:", error);
    res.status(500).json({ message: "Loi he thong" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const normalizedStatus = status === "pending" ? "processing" : status;
    const allowed = ["processing", "pending", "paid", "shipped", "completed", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Trang thai khong hop le" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Khong tim thay don hang" });

    const prevStatus = order.status === "pending" ? "processing" : order.status;
    if (prevStatus === normalizedStatus) return res.status(200).json(order);

    if (normalizedStatus === "cancelled") {
      if (prevStatus === "shipped" || prevStatus === "completed") {
        return res.status(400).json({ message: "Khong the huy don da giao hoac hoan tat" });
      }
      await restockItems(order);
    }

    order.status = normalizedStatus;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error("Loi updateStatus:", error);
    res.status(500).json({ message: "Loi he thong" });
  }
};

// Tạo đơn tại quầy (POS) dành cho admin/staff, không dùng giỏ hàng
export const createPosOrder = async (req, res) => {
  try {
    const { items = [], shipping = {}, paymentMethod = "cod", shippingFee = 0 } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Chua co san pham trong don" });
    }
    const fullName = shipping.fullName?.trim() || "Khach tai quay";
    const phone = shipping.phone?.trim() || "N/A";
    const address = shipping.address?.trim() || "Tai cua hang";
    if (!fullName || !phone || !address) {
      return res.status(400).json({ message: "Thong tin giao hang khong hop le" });
    }

    const normalizedMethod = String(paymentMethod || "cod").toLowerCase();
    if (!["cod", "online"].includes(normalizedMethod)) {
      return res.status(400).json({ message: "Phuong thuc thanh toan khong hop le" });
    }

    const refreshedItems = [];
    const productsToUpdate = [];
    for (const it of items) {
      const pid = it.productId || it._id;
      const product = await Jewelry.findById(pid);
      if (!product) return res.status(400).json({ message: "San pham khong ton tai" });

      const requestedQty = Number(it.quantity) || 0;
      if (requestedQty <= 0) return res.status(400).json({ message: "So luong khong hop le" });
      if (product.quantity < requestedQty) {
        return res.status(400).json({
          message: `San pham "${product.title || product.name || "khong xac dinh"}" chi con ${product.quantity} trong kho.`,
        });
      }

      productsToUpdate.push({ product, newQty: Math.max(0, product.quantity - requestedQty) });
      refreshedItems.push({
        productId: product._id,
        name: product.title || product.name || "San pham",
        price: Number(product.price) || 0,
        quantity: requestedQty,
        image: product.image,
        material: product.material,
      });
    }

    const subtotal = refreshedItems.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
      0
    );
    const total = Math.max(0, subtotal + Number(shippingFee) || 0);

    const order = await Order.create({
      user: req.user._id,
      items: refreshedItems,
      shipping: { fullName, phone, address, note: shipping.note || "" },
      paymentMethod: normalizedMethod,
      subtotal,
      shippingFee: Number(shippingFee) || 0,
      total,
      source: "pos",
      status: normalizedMethod === "online" ? "processing" : "completed",
    });

    for (const { product, newQty } of productsToUpdate) {
      product.quantity = newQty;
      if (newQty <= 0) product.status = "completed";
      await product.save();
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Loi createPosOrder:", error);
    res.status(500).json({ message: "Loi he thong" });
  }
};
