const { asyncHandler } = require("../utils/asyncHandler");
const authService = require("../services/auth.service");

const register = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;
  const data = await authService.register({ email, password, fullName });
  res.status(201).json({ ok: true, ...data });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login({ email, password });
  res.json({ ok: true, ...data });
});

module.exports = { register, login };
