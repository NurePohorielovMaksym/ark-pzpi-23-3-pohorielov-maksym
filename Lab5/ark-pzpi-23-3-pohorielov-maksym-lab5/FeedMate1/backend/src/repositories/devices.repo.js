// src/repositories/devices.repo.js
import { query } from "../config/db.js";

export async function listByUserId(userId) {
  const r = await query(
    `SELECT id, userId, serial, name, lastSeenAt, capacity, isConnected
     FROM dbo.DEVICES
     WHERE userId = @userId
     ORDER BY id DESC`,
    { userId }
  );
  return r.recordset;
}

export async function createDevice(userId, dto) {
  const r = await query(
    `
    INSERT INTO dbo.DEVICES (userId, serial, name, apiKeyHash, capacity, isConnected)
    OUTPUT INSERTED.id, INSERTED.userId, INSERTED.serial, INSERTED.name, INSERTED.capacity, INSERTED.isConnected
    VALUES (@userId, @serial, @name, @apiKeyHash, @capacity, 0) 
    `,
    {
      userId,
      serial: dto.serial,
      name: dto.name || null,
      apiKeyHash: dto.apiKeyHash,
      capacity: dto.capacity
    }
  );
  const newDevice = r.recordset[0];

  await query(`
      INSERT INTO dbo.DEVICE_STATUSES (deviceId, reportedAt, foodLevel, foodLevelPercent, status)
      VALUES (@deviceId, GETUTCDATE(), @capacity, 100, 'OK')
    `, { 
      deviceId: newDevice.id, 
      capacity: newDevice.capacity 
    });
  return newDevice;
}

export async function deleteById(userId, deviceId) {
  const r = await query(
    `DELETE FROM dbo.DEVICES WHERE id=@id AND userId=@userId`,
    { id: deviceId, userId }
  );
  return r.rowsAffected[0] > 0;
}

export async function findBySerial(serial) {
  const r = await query("SELECT * FROM dbo.DEVICES WHERE serial = @serial", { serial });
  return r.recordset[0] || null;
}

export async function linkDeviceToUser(deviceId, userId) {
  await query(
    `UPDATE dbo.DEVICES 
     SET userId = @userId,
         isConnected = 1
     WHERE id = @deviceId`,
    { deviceId, userId }
  );
}

export async function getById(id) {
  const r = await query(
    "SELECT * FROM dbo.DEVICES WHERE id = @id", 
    { id: Number(id) }
  );
  return r.recordset[0] || null;
}

export async function getDeviceWithStatus(deviceId, userId) {
  const r = await query(`
    SELECT d.id, d.userId, d.capacity, s.foodLevel, s.foodLevelPercent
    FROM dbo.DEVICES d
    LEFT JOIN dbo.DEVICE_STATUSES s ON d.id = s.deviceId
    WHERE d.id = @deviceId AND d.userId = @userId
  `, { deviceId, userId });
  
  return r.recordset[0] || null;
}

export async function updateFoodStatus(deviceId, newLevel, newPercent) {
  await query(`
    UPDATE dbo.DEVICE_STATUSES 
    SET 
        foodLevel = @newLevel,
        foodLevelPercent = @newPercent,
        reportedAt = SYSDATETIME(),
        status = 'OK'
    WHERE deviceId = @deviceId
  `, { newLevel, newPercent, deviceId });
}

export async function touchDevice(deviceId) {
  await query(`
    UPDATE dbo.DEVICES
    SET lastSeenAt = GETUTCDATE()
    WHERE id = @deviceId
  `, { deviceId });
}
