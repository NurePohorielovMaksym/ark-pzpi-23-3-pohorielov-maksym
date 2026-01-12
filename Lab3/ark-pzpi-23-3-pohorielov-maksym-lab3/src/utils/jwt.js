import jwtPkg from "jsonwebtoken"; 
import {env} from "../config/env.js";

const { sign, verify } = jwtPkg;

export function signToken(payload) {
  return sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return verify(token, env.JWT_SECRET);
}


