import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Jewelry", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
    material: { type: String },
  },
  { _id: false }
);

const shippingSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    note: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    shipping: { type: shippingSchema, required: true },
    paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "cancelled"],
      default: "pending",
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
