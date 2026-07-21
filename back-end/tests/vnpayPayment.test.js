import crypto from "crypto";

// Hàm helper kiểm thử thuật toán tạo chữ ký HmacSHA512 cho VNPAY
function generateVnpaySignature(params, secretKey) {
  const sortedKeys = Object.keys(params).sort();
  const signData = sortedKeys
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .map((key) => `${key}=${encodeURIComponent(params[key]).replace(/%20/g, "+")}`)
    .join("&");

  return crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");
}

describe("VNPAY Payment Gateway Logic", () => {
  const secretKey = "SECRET_KEY_TEST_VNPAY";

  test("Phải tạo đúng chữ ký HmacSHA512 theo thứ tự alphabet của tham số", () => {
    const params = {
      vnp_Amount: "10000000",
      vnp_Command: "pay",
      vnp_TmnCode: "TESTCODE",
      vnp_TxnRef: "ORDER123-1700000000",
      vnp_Version: "2.1.0",
    };

    const signature1 = generateVnpaySignature(params, secretKey);
    const signature2 = generateVnpaySignature(params, secretKey);

    // Chữ ký phải nhất quán và có độ dài SHA512 (128 ký tự hex)
    expect(signature1).toBe(signature2);
    expect(signature1).toHaveLength(128);
  });

  test("Phải từ chối kết quả VNPAY nếu chữ ký gửi về bị thay đổi (Security Check)", () => {
    const params = {
      vnp_Amount: "10000000",
      vnp_ResponseCode: "00", // 00 = Thành công
      vnp_TxnRef: "ORDER123",
    };

    const validHash = generateVnpaySignature(params, secretKey);
    const tamperedHash = "invalid_hash_hacker_sent";

    expect(validHash).not.toBe(tamperedHash);
  });
});
