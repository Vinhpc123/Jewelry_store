import mongoose from "mongoose";

const jewelrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    image: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["active", "completed"], default: "active" },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // createdAt, updatedAt se tu them
  }
);

const Jewelry = mongoose.model("Jewelry", jewelrySchema);
export default Jewelry;
