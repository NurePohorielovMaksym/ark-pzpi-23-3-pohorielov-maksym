const notificationsRepo = require("../repositories/notifications.repo");

async function listUser(userId) {
  return notificationsRepo.listUserNotifications(userId);
}

async function markUserRead(userId, id) {
  const ok = await notificationsRepo.markUserNotificationRead(userId, id);
  if (!ok) {
    const err = new Error("Notification not found");
    err.statusCode = 404;
    throw err;
  }
  return true;
}

module.exports = { listUser, markUserRead };
