const { verifyToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ ok: false, message: "Missing token" });

  try {
    const payload = verifyToken(token);
    req.user = {
    id: payload.userId,
    email: payload.email
};
 // { userId, email }
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
}

module.exports = { authMiddleware };
