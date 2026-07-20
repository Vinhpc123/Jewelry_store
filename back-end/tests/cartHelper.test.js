import { calculateSubtotal, calculateTotal } from "../src/utils/cartHelper.js";

describe("Cart Calculations", () => {
  describe("calculateSubtotal", () => {
    test("should return 0 for non-array input or empty array", () => {
      expect(calculateSubtotal(null)).toBe(0);
      expect(calculateSubtotal(undefined)).toBe(0);
      expect(calculateSubtotal({})).toBe(0);
      expect(calculateSubtotal([])).toBe(0);
    });

    test("should correctly calculate subtotal for valid items", () => {
      const items = [
        { price: 100000, quantity: 2 },
        { price: 250000, quantity: 1 },
      ];
      expect(calculateSubtotal(items)).toBe(450000);
    });

    test("should handle missing or invalid price/quantity by treating as 0", () => {
      const items = [
        { price: "invalid", quantity: 2 },
        { price: 200000, quantity: "invalid" },
        { price: 150000, quantity: 3 },
      ];
      expect(calculateSubtotal(items)).toBe(450000);
    });

    test("should handle float prices or quantity values correctly", () => {
      const items = [
        { price: 10.5, quantity: 2 },
        { price: 5, quantity: 1.5 },
      ];
      expect(calculateSubtotal(items)).toBe(28.5);
    });
  });

  describe("calculateTotal", () => {
    test("should return subtotal + shippingFee - discount", () => {
      expect(calculateTotal(500000, 30000, 50000)).toBe(480000);
    });

    test("should return 0 if total calculations result in negative values", () => {
      expect(calculateTotal(10000, 5000, 30000)).toBe(0);
    });

    test("should fallback to default parameters when missing", () => {
      expect(calculateTotal(500000)).toBe(500000);
    });
  });
});
