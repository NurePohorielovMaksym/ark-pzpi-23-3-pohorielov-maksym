const deviceStatusesRepo = require("../repositories/device-statuses.repo");
const notificationsRepo = require("../repositories/notifications.repo");

/**
 * Lab simplification:
 * - IoT reports status.
 * - If status is LOW_FOOD => create a user notification.
 * In real app you would authenticate device and map it to a userId.
 */
async function reportStatus({ deviceId, userId, foodLevelPercent, status }) {
  const saved = await deviceStatusesRepo.createStatus({ deviceId, foodLevelPercent, status });

  if (status === "LOW_FOOD") {
    await notificationsRepo.createUserNotification(userId, "LOW_FOOD", "Device reported LOW_FOOD");
  }

  return saved;
}

module.exports = { reportStatus };
