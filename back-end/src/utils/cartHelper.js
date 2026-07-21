export const calculateSubtotal = (items) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
};

export const calculateTotal = (subtotal, shippingFee = 0, discount = 0) => {
  const s = Number(subtotal) || 0;
  const f = Number(shippingFee) || 0;
  const d = Number(discount) || 0;
  return Math.max(0, s + f - d);
};
