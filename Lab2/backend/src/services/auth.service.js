const { findByEmail, createUser } = require("../repositories/users.repo");
const { hashPassword, verifyPassword } = require("../utils/hash");
const { signToken } = require("../utils/jwt");

async function register({ email, password, fullName }) {
  const exists = await findByEmail(email);
  if (exists) {
    const err = new Error("Email already in use");
    err.statusCode = 409;
    throw err;
  }
  validatePassword(password);
  const passwordHash = await hashPassword(password);
  const user = await createUser({ email, passwordHash, fullName });

  return { user: { id: user.id, email: user.email, fullName: user.fullName } };
}

async function login({ email, password }) {
  const user = await findByEmail(email);
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ userId: user.id, email: user.email });
  return { user: { id: user.id, email: user.email, fullName: user.fullName }, token };
}

function validatePassword(password) {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!passwordRegex.test(password)) {
    const err = new Error(
      "Password must be at least 8 characters long, contain one uppercase letter and one number"
    );
    err.statusCode = 400;
    throw err;
  }
}


module.exports = { register, login };
