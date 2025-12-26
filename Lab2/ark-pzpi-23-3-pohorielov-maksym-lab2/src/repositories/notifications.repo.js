const { query } = require("../config/db");

async function listUserNotifications(userId) {
  const r = await query("SELECT * FROM dbo.USER_NOTIFICATIONS WHERE userId=@userId ORDER BY createdAt DESC", { userId });
  return r.recordset;
}

async function markUserNotificationRead(userId, id) {
  const r = await query(`
    UPDATE dbo.USER_NOTIFICATIONS
    SET isRead=1
    WHERE id=@id AND userId=@userId
  `, { id, userId });
  return r.rowsAffected[0] > 0;
}

async function createUserNotification(userId, type, message) {
  const r = await query(`
    INSERT INTO dbo.USER_NOTIFICATIONS (userId, createdAt, type, message, isRead)
    OUTPUT INSERTED.*
    VALUES (@userId, SYSUTCDATETIME(), @type, @message, 0)
  `, { userId, type, message });
  return r.recordset[0];
}

module.exports = { listUserNotifications, markUserNotificationRead, createUserNotification };
