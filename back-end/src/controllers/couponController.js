import Coupon from "../models/coupon.js";

const normalizePayload = (body = {}) => {
  const toNumber = (v, def = 0) => {
    const n = Number(v);
    return Number.isNaN(n) ? def : n;
  };

  return {
    code: String(body.code || "").trim().toUpperCase(),
    type: ["percent", "fixed"].includes(body.type) ? body.type : "percent",
    value: toNumber(body.value, 0),
    startDate: body.startDate ? new Date(body.startDate) : undefined,
    endDate: body.endDate ? new Date(body.endDate) : undefined,
    minOrder: toNumber(body.minOrder, 0),
    maxDiscount: toNumber(body.maxDiscount, 0),
    usageLimit: toNumber(body.usageLimit, 0),
    active: Boolean(body.active !== false),
  };
};

const computeDiscount = (coupon, subtotal) => {
  if (!coupon || !subtotal || subtotal <= 0) return 0;
  const base =
    coupon.type === "fixed"
      ? Number(coupon.value) || 0
      : ((Number(coupon.value) || 0) / 100) * subtotal;
  const capped = coupon.maxDiscount && coupon.maxDiscount > 0 ? Math.min(base, coupon.maxDiscount) : base;
  return Math.max(0, Math.min(capped, subtotal));
};

export const validateCoupon = async (req, res) => {
  try {
    const code = String(req.body.code || "").trim().toUpperCase();
    const subtotal = Number(req.body.subtotal) || 0;
    if (!code) {
      return res.status(400).json({ message: "Vui long nhap ma giam gia" });
    }
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res.status(404).json({ message: "Ma giam gia khong ton tai" });
    }
    const now = new Date();
    if (!coupon.active) return res.status(400).json({ message: "Ma da bi khoa" });
    if (coupon.startDate && now < coupon.startDate) return res.status(400).json({ message: "Ma chua den ngay ap dung" });
    if (coupon.endDate && now > coupon.endDate) return res.status(400).json({ message: "Ma da het han" });
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Ma da het luot su dung" });
    }
    if (subtotal < (coupon.minOrder || 0)) {
      return res.status(400).json({ message: `Don hang can toi thieu ${(coupon.minOrder || 0)} VND` });
    }

    const discount = computeDiscount(coupon, subtotal);
    return res.status(200).json({
      coupon,
      discount,
      finalTotal: Math.max(0, subtotal - discount),
    });
  } catch (error) {
    res.status(500).json({ message: "Khong the kiem tra ma giam gia", error: error.message });
  }
};

export const listCoupons = async (_req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Khong the lay danh sach ma giam gia", error: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    if (!payload.code) {
      return res.status(400).json({ message: "Ma giam gia khong duoc de trong" });
    }

    const exists = await Coupon.findOne({ code: payload.code });
    if (exists) {
      return res.status(400).json({ message: "Ma giam gia da ton tai" });
    }

    const coupon = await Coupon.create({ ...payload, usedCount: 0 });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Khong the tao ma giam gia", error: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    if (!payload.code) {
      return res.status(400).json({ message: "Ma giam gia khong duoc de trong" });
    }

    const dup = await Coupon.findOne({ code: payload.code, _id: { $ne: req.params.id } });
    if (dup) {
      return res.status(400).json({ message: "Ma giam gia da ton tai" });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: "Khong tim thay ma giam gia" });
    }

    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Khong the cap nhat ma giam gia", error: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Khong tim thay ma giam gia" });
    }
    res.status(200).json({ message: "Da xoa ma giam gia" });
  } catch (error) {
    res.status(500).json({ message: "Khong the xoa ma giam gia", error: error.message });
  }
};

export const computeCouponDiscount = computeDiscount;
