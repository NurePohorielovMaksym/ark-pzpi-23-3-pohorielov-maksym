// src/services/notifications.service.js
import { listNotifications, markNotificationRead } from "../repositories/notifications.repo.js";

export async function list(userId) {
  return listNotifications(userId);
}

export async function markRead(userId, id) {
  const ok = await markNotificationRead(userId, id);
  if (!ok) {
    const err = new Error("Notification not found");
    err.statusCode = 404;
    throw err;
  }
  return true;
}