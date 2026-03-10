/**
 * JWT Utilities
 * Token generation, verification, and cookie helpers.
 */

const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Dev note: frontend (:3000) and backend (:5000) are different origins.
 * Browsers block cross-origin cookies unless sameSite=None+secure (HTTPS).
 * In dev we omit sameSite so localhost works, and the Bearer token in
 * localStorage (sent by api.js interceptor) is the primary auth mechanism.
 */
const sendTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    expires: new Date(Date.now() + (process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProd,
    ...(isProd && { sameSite: "strict" }),
  });
};

const clearTokenCookie = (res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: isProd,
    ...(isProd && { sameSite: "strict" }),
  });
};

module.exports = { generateToken, verifyToken, sendTokenCookie, clearTokenCookie };
