import { jest } from "@jest/globals";
import { protect } from "../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";
import User from "../src/models/user.js";

describe("Auth Middleware (protect)", () => {
  let req, res, next;
  let jwtVerifySpy;
  let userFindByIdSpy;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    // Create spies on the real modules/objects
    jwtVerifySpy = jest.spyOn(jwt, "verify");
    userFindByIdSpy = jest.spyOn(User, "findById");
  });

  afterEach(() => {
    // Restore all spies to their original state after each test
    jest.restoreAllMocks();
  });

  test("should return 401 if Authorization header is missing", async () => {
    req.headers.authorization = "";

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token không hợp lệ" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if Authorization header does not start with Bearer", async () => {
    req.headers.authorization = "Basic token123";

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token không hợp lệ" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if token is invalid or expired (jwt.verify throws error)", async () => {
    req.headers.authorization = "Bearer invalid_token";
    jwtVerifySpy.mockImplementation(() => {
      throw new Error("jwt expired");
    });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Không thể xác thực",
      error: "jwt expired",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if user is not found in the database", async () => {
    req.headers.authorization = "Bearer valid_token";
    jwtVerifySpy.mockReturnValue({ userId: "user123" });

    const selectMock = jest.fn().mockResolvedValue(null);
    userFindByIdSpy.mockReturnValue({
      select: selectMock,
    });

    await protect(req, res, next);

    expect(userFindByIdSpy).toHaveBeenCalledWith("user123");
    expect(selectMock).toHaveBeenCalledWith("-password");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Tài khoản không hoạt động" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if user is deactivated (isActive is false)", async () => {
    req.headers.authorization = "Bearer valid_token";
    jwtVerifySpy.mockReturnValue({ userId: "user123" });

    const mockUser = { _id: "user123", isActive: false };
    const selectMock = jest.fn().mockResolvedValue(mockUser);
    userFindByIdSpy.mockReturnValue({
      select: selectMock,
    });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Tài khoản không hoạt động" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next() and assign req.user if token is valid and user is active", async () => {
    req.headers.authorization = "Bearer valid_token";
    jwtVerifySpy.mockReturnValue({ userId: "user123" });

    const mockUser = { _id: "user123", isActive: true, role: "customer" };
    const selectMock = jest.fn().mockResolvedValue(mockUser);
    userFindByIdSpy.mockReturnValue({
      select: selectMock,
    });

    await protect(req, res, next);

    expect(req.user).toBe(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
