import { jest } from '@jest/globals';
import { computeCouponDiscount } from "../src/controllers/couponController.js";

// Mock the Coupon model to prevent mongoose errors/connections during testing
jest.mock("../src/models/coupon.js", () => {
  return {};
});

describe("Coupon Discount Logic", () => {
  test("should return 0 if coupon or subtotal is invalid/missing", () => {
    expect(computeCouponDiscount(null, 100000)).toBe(0);
    expect(computeCouponDiscount({ type: "fixed", value: 10000 }, 0)).toBe(0);
    expect(computeCouponDiscount({ type: "fixed", value: 10000 }, -50000)).toBe(0);
  });

  test("should correctly compute fixed discount", () => {
    const coupon = { type: "fixed", value: 50000 };
    expect(computeCouponDiscount(coupon, 200000)).toBe(50000);
  });

  test("should correctly compute percentage discount", () => {
    const coupon = { type: "percent", value: 10 }; // 10%
    expect(computeCouponDiscount(coupon, 150000)).toBe(15000);
  });

  test("should apply maxDiscount capping for percentage discount", () => {
    const coupon = { type: "percent", value: 10, maxDiscount: 20000 }; // 10%, max 20,000
    // 10% of 300,000 is 30,000, but capped at 20,000
    expect(computeCouponDiscount(coupon, 300000)).toBe(20000);
    // 10% of 150,000 is 15,000, which is below cap
    expect(computeCouponDiscount(coupon, 150000)).toBe(15000);
  });

  test("should not exceed subtotal (discount cannot make final total negative)", () => {
    const coupon = { type: "fixed", value: 100000 };
    expect(computeCouponDiscount(coupon, 80000)).toBe(80000);
  });
});
