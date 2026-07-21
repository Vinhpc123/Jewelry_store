import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";

process.env.JWT_SECRET = "test_secret_key_123";

// Mock User Model để test cô lập không cần kết nối MongoDB thật
const mockUsers = [];

jest.unstable_mockModule("../src/models/user.js", () => ({
  default: {
    findOne: jest.fn(async ({ email }) => mockUsers.find((u) => u.email === email) || null),
    create: jest.fn(async (userData) => {
      const newUser = {
        _id: "mock_user_id_" + Date.now(),
        matchPassword: async (enteredPassword) => enteredPassword === userData.password,
        isActive: true,
        ...userData,
      };
      mockUsers.push(newUser);
      return newUser;
    }),
  },
}));

// Load authRoutes linh hoạt với mock user
const authRoutes = (await import("../src/routes/authRoutes.js")).default;

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Authentication API Integration Tests (Supertest)", () => {
  beforeEach(() => {
    mockUsers.length = 0; // Reset mock database trước mỗi test case
  });

  test("POST /api/auth/signup - Đăng ký khách hàng công khai thành công", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Nguyễn Văn A",
      email: "testuser@gmail.com",
      password: "Password123@",
      phone: "0901234567",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toHaveProperty("email", "testuser@gmail.com");
  });

  test("POST /api/auth/login - Đăng nhập thất bại khi không tìm thấy tài khoản (404 Not Found)", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "notexist@gmail.com",
      password: "WrongPassword123@",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message");
  });
});
