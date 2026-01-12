// src/controllers/notifications.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { list as _list, markRead as _markRead } from "../services/notifications.service.js";

export const list = asyncHandler(async (req, res) => {
  const notifications = await _list(req.user.id);
  res.json({ ok: true, notifications });
});

export const markRead = asyncHandler(async (req, res) => {
  await _markRead(req.user.id, Number(req.params.id));
  res.json({ ok: true });
});
