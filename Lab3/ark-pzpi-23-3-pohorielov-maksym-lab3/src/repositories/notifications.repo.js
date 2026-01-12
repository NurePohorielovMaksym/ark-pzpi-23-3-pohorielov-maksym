import { query } from "../config/db.js";

export async function listNotifications(deviceId) {
  const r = await query("SELECT * FROM dbo.DEVICE_NOTIFICATIONS WHERE deviceId=@deviceId ORDER BY createdAt DESC", { deviceId });
  return r.recordset;
}

export async function markNotificationRead(deviceId, id) {
  const r = await query(`
    UPDATE dbo.DEVICE_NOTIFICATIONS
    SET isRead=1
    WHERE id=@id AND deviceId=@deviceId
  `, { id, deviceId });
  return r.rowsAffected[0] > 0;
}

export async function createNotification(deviceId, type, message) {
  const r = await query(`
    INSERT INTO dbo.DEVICE_NOTIFICATIONS (deviceId, createdAt, type, message, isRead)
    OUTPUT INSERTED.*
    VALUES (@deviceId, SYSUTCDATETIME(), @type, @message, 0)
  `, { deviceId, type, message });
  return r.recordset[0];
}

