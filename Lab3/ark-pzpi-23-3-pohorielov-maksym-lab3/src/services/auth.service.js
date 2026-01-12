import { findByEmail, createUser, findById, updateUser, deleteUser } from "../repositories/users.repo.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";

export async function register({ email, password, fullName, role }) {
  const exists = await findByEmail(email);
  if (exists) {
    const err = new Error("Email already in use");
    err.statusCode = 409;
    throw err;
  }
  validatePassword(password);
  const passwordHash = await hashPassword(password);
  const user = await createUser({ email, passwordHash, fullName, role });

  return { user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } };
}

export async function login({ email, password }) {
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

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  return { user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, token };
}

export async function deleteAccount(userId, confirmPassword) {
  const user = await usersRepo.findById(userId);
  if (!user) {
    throw new Error("Користувача не знайдено");
  }

  const isMatch = await bcrypt.compare(confirmPassword, user.passwordHash);
  if (!isMatch) {
    const err = new Error("Невірний пароль. Видалення неможливе.");
    err.statusCode = 401;
    throw err;
  }

  return await usersRepo.deleteUser(userId);
}

export async function updateProfile(userId, { fullName, password }) {
  const updateData = {};

  if (fullName) {
    updateData.fullName = fullName;
  }

  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.passwordHash = await bcrypt.hash(password, salt);
  }

  const updatedUser = await usersRepo.updateUser(userId, updateData);
  
  if (!updatedUser) {
    const err = new Error("Користувача не знайдено");
    err.statusCode = 404;
    throw err;
  }

  delete updatedUser.passwordHash;
  return updatedUser;
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



