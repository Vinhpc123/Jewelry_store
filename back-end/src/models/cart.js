import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Jewelry", required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
    material: { type: String },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// update updatedAt before save
cartSchema.pre("save", function updateTimestamp(next) {
  this.updatedAt = new Date();
  next();
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
