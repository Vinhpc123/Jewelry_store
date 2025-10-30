import jwt from "jsonwebtoken";

const TOKEN_TTL = process.env.JWT_EXPIRES_IN || "1h";

export const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
