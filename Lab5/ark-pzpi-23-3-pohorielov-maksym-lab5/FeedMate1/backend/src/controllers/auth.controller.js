// src/controllers/auth.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { register as registerService, login as loginService } from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const { email, password, fullName, role } = req.body;
  const data = await registerService({ email, password, fullName, role });
  res.status(201).json({ ok: true, ...data });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await loginService({ email, password });
  res.json({ ok: true, ...data });
});

export const updateMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { fullName, password } = req.body;
  
  const user = await updateProfileService(userId, { fullName, password });
  
  res.json({ ok: true, user });
});

export const deleteMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Введіть пароль для підтвердження видалення" });
  }

  await deleteAccountService(userId, password);
  
  res.json({ ok: true, message: "Акаунт успішно видалено" });
});