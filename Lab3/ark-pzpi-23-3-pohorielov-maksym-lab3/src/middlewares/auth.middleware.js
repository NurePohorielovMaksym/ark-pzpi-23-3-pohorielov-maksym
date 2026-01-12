import { verifyToken } from "../utils/jwt.js";
import { query } from "../config/db.js";
import {createHash} from "crypto";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ ok: false, message: "Missing token" });

  try {
    const payload = verifyToken(token);
    req.user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role
};
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, message: "Invalid token" });
  }
}

export async function deviceAuth(req, res, next) {
  const apiKey = req.headers["x-device-key"];
  if (!apiKey) {
    return res.status(401).json({ error: "No device key" });
  }

  const hash = createHash("sha256").update(apiKey).digest("hex");

  const r = await query(`
    SELECT id, isConnected
    FROM DEVICES
    WHERE apiKeyHash = @hash
  `, { hash });

  const device = r.recordset[0];

  if (!device) {
    return res.status(401).json({ error: "Invalid device key" });
  }

  if (!device.isConnected) {
    return res.status(403).json({ error: "Device not activated" });
  }

  req.deviceId = device.id;
  next();
}


