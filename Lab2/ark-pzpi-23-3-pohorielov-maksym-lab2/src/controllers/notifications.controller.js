const { asyncHandler } = require("../utils/asyncHandler");
const notificationsService = require("../services/notifications.service");

const listUser = asyncHandler(async (req, res) => {
  const notifications = await notificationsService.listUser(req.user.userId);
  res.json({ ok: true, notifications });
});

const markUserRead = asyncHandler(async (req, res) => {
  await notificationsService.markUserRead(req.user.userId, Number(req.params.id));
  res.json({ ok: true });
});

module.exports = { listUser, markUserRead };
