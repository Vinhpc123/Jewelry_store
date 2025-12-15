import crypto from "crypto";
import Order from "../models/order.js";

const formatVnpDate = (date) => {
  const pad = (n) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(
    date.getMinutes()
  )}${pad(date.getSeconds())}`;
};

const buildIpAddress = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "127.0.0.1";
};

const sortAndEncodeParams = (params) => {
  const sortedKeys = Object.keys(params).sort();
  const encoded = {};
  for (const key of sortedKeys) {
    const value = params[key];
    if (value === undefined || value === null || value === "") continue;
    encoded[key] = encodeURIComponent(value).replace(/%20/g, "+");
  }
  return encoded;
};

const buildSignedQuery = (params, secretKey) => {
  const encoded = sortAndEncodeParams(params);
  const signData = Object.keys(encoded)
    .map((key) => `${key}=${encoded[key]}`)
    .join("&");
  const secureHash = crypto.createHmac("sha512", secretKey).update(Buffer.from(signData, "utf-8")).digest("hex");
  return { secureHash, encoded };
};

export const createVnpPayment = async (req, res) => {
  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ message: "Thieu ma don hang" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Khong tim thay don hang" });
    const isOwner = String(order.user) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Khong co quyen thanh toan don nay" });

    if (order.status === "paid") {
      return res.status(400).json({ message: "Don hang da duoc thanh toan" });
    }
    if (order.status === "shipped" || order.status === "cancelled") {
      return res.status(400).json({ message: "Khong the thanh toan don da hoan thanh/da huy" });
    }

    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl =
      process.env.VNP_RETURN_URL || `${req.protocol}://${req.get("host")}/api/payments/vnpay/return`;

    if (!tmnCode || !secretKey) {
      return res.status(500).json({ message: "Chua cau hinh thong tin VNPAY" });
    }

    const createDate = new Date();
    const expireDate = new Date(createDate.getTime() + 15 * 60 * 1000);
    const txnRef = `${order._id}-${createDate.getTime()}`;
    const amount = Math.round((Number(order.total) || 0) * 100);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Tong tien khong hop le" });
    }

    order.paymentMethod = "online";
    order.paymentInfo = {
      ...order.paymentInfo,
      provider: "vnpay",
      txnRef,
      amount: order.total,
      orderInfo: `Thanh toan don ${order._id}`,
    };
    await order.save();

    const vnpParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don ${order._id}`,
      vnp_OrderType: "other",
      vnp_Amount: amount,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: buildIpAddress(req),
      vnp_CreateDate: formatVnpDate(createDate),
      vnp_ExpireDate: formatVnpDate(expireDate),
    };

    const { secureHash, encoded } = buildSignedQuery(vnpParams, secretKey);
    encoded.vnp_SecureHash = secureHash;
    const paymentUrl =
      vnpUrl +
      "?" +
      Object.keys(encoded)
        .map((key) => `${key}=${encoded[key]}`)
        .join("&");

    res.status(200).json({ paymentUrl });
  } catch (error) {
    console.error("Loi createVnpPayment:", error);
    res.status(500).json({ message: "Loi he thong" });
  }
};

export const handleVnpReturn = async (req, res) => {
  try {
    const secureHash = req.query.vnp_SecureHash;
    const vnpParams = { ...req.query };
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const secretKey = process.env.VNP_HASH_SECRET;
    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
    if (!secretKey) {
      return res.status(500).json({ message: "Chua cau hinh khoa VNPAY" });
    }

    const { secureHash: calculatedHash } = buildSignedQuery(vnpParams, secretKey);
    const isValid = secureHash && secureHash === calculatedHash;

    const txnRef = vnpParams.vnp_TxnRef || "";
    const orderId = txnRef.split("-")[0];
    const order = orderId ? await Order.findById(orderId) : null;
    const responseCode = vnpParams.vnp_ResponseCode;
    const isSuccess = isValid && responseCode === "00";

    if (order) {
      order.paymentMethod = "online";
      order.paymentInfo = {
        provider: "vnpay",
        txnRef,
        transactionNo: vnpParams.vnp_TransactionNo || "",
        bankCode: vnpParams.vnp_BankCode || "",
        cardType: vnpParams.vnp_CardType || "",
        amount: (Number(vnpParams.vnp_Amount) || 0) / 100,
        responseCode,
        orderInfo: vnpParams.vnp_OrderInfo || "",
        raw: vnpParams,
      };

      if (isSuccess) {
        order.status = "paid";
        order.paidAt = new Date();
      }
      await order.save();
    }

    const payStatus = isSuccess ? "success" : "fail";
    const redirectUrl = `${frontendBase.replace(/\/$/, "")}/orders/${order?._id || orderId || ""}?payStatus=${payStatus}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Loi handleVnpReturn:", error);
    return res.redirect((process.env.FRONTEND_URL || "http://localhost:5173") + "/orders?payStatus=fail");
  }
};
