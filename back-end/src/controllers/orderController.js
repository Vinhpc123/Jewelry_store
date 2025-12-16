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
      return res.status(400).json({ message: "Thiếu thông tin giao hàng" });
    }

    const normalizedMethod = String(paymentMethod || "").toLowerCase();
    if (!["cod", "online"].includes(normalizedMethod)) {
      return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    // Lam moi thong tin san pham/tinh gia va kiem tra ton kho
    const refreshedItems = [];
    const productsToUpdate = [];
    for (const it of cart.items) {
      const product = await Jewelry.findById(it.productId);
      if (!product) {
        return res.status(400).json({ message: "Sản phẩm trong giỏ hàng không còn tồn tại." });
      }

      const requestedQty = Number(it.quantity) || 0;
      if (requestedQty <= 0) {
        return res.status(400).json({ message: "Số lượng sản phẩm không hợp lệ." });
      }

      if (product.quantity < requestedQty) {
        return res.status(400).json({
          message: `Sản phẩm "${product.title || product.name || "không xác định"}" chỉ còn ${product.quantity} trong kho.`,
        });
      }

      productsToUpdate.push({
        product,
        newQty: Math.max(0, product.quantity - requestedQty),
      });

      refreshedItems.push({
        productId: product._id,
        name: product.title || product.name || "Sản phẩm",
        price: Number(product.price) || 0,
        quantity: requestedQty,
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
    let discount = 0;
    let couponCode = "";

    if (rawCouponCode) {
      const code = String(rawCouponCode || "").trim().toUpperCase();
      const coupon = await Coupon.findOne({ code });
      if (!coupon) return res.status(400).json({ message: "Mã giảm giá không tồn tại" });
      const now = new Date();
      if (!coupon.active) return res.status(400).json({ message: "Mã giảm giá đã bị khóa" });
      if (coupon.startDate && now < coupon.startDate)
        return res.status(400).json({ message: "Mã giảm giá chưa đến ngày áp dụng" });
      if (coupon.endDate && now > coupon.endDate) return res.status(400).json({ message: "Mã giảm giá đã hết hạn" });
      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng" });
      }
      if (subtotal < (coupon.minOrder || 0)) {
        return res
          .status(400)
          .json({ message: `Đơn hàng cần tối thiểu ${(coupon.minOrder || 0).toLocaleString("vi-VN")} VND` });
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
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Loi getMyOrders:", error);
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
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    // chi chu don hoac admin
    if (String(order.user) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền xem đơn này" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Loi getOrderById:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const isOwner = String(order.user) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Không có quyền hủy đơn này" });
    const cancellableStatuses = ["processing", "pending"];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ message: "Chỉ hủy được đơn đang xử lý" });
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
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const normalizedStatus = status === "pending" ? "processing" : status;
    const allowed = ["processing", "pending", "paid", "shipped", "completed", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Trạng thái không hợp lệ" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const prevStatus = order.status === "pending" ? "processing" : order.status;
    if (prevStatus === normalizedStatus) return res.status(200).json(order);

    if (normalizedStatus === "cancelled") {
      if (prevStatus === "shipped" || prevStatus === "completed") {
        return res.status(400).json({ message: "Không thể hủy đơn đã giao hoặc hoàn tất" });
      }
      await restockItems(order);
    }

    order.status = normalizedStatus;
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error("Loi updateStatus:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Tạo đơn tại quầy (POS) dành cho admin/staff, không dùng giỏ hàng
export const createPosOrder = async (req, res) => {
  try {
    const { items = [], shipping = {}, paymentMethod = "cod", shippingFee = 0 } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Chưa có sản phẩm trong đơn" });
    }
    const fullName = shipping.fullName?.trim() || "Khách tại quầy";
    const phone = shipping.phone?.trim() || "N/A";
    const address = shipping.address?.trim() || "Tại cửa hàng";
    if (!fullName || !phone || !address) {
      return res.status(400).json({ message: "Thông tin giao hàng không hợp lệ" });
    }

    const normalizedMethod = String(paymentMethod || "cod").toLowerCase();
    if (!["cod", "online"].includes(normalizedMethod)) {
      return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
    }

    const refreshedItems = [];
    const productsToUpdate = [];
    for (const it of items) {
      const pid = it.productId || it._id;
      const product = await Jewelry.findById(pid);
      if (!product) return res.status(400).json({ message: "Sản phẩm không tồn tại" });

      const requestedQty = Number(it.quantity) || 0;
      if (requestedQty <= 0) return res.status(400).json({ message: "Số lượng không hợp lệ" });
      if (product.quantity < requestedQty) {
        return res.status(400).json({
          message: `Sản phẩm "${product.title || product.name || "không xác định"}" chỉ còn ${product.quantity} trong kho.`,
        });
      }

      productsToUpdate.push({ product, newQty: Math.max(0, product.quantity - requestedQty) });
      refreshedItems.push({
        productId: product._id,
        name: product.title || product.name || "Sản phẩm",
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
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
