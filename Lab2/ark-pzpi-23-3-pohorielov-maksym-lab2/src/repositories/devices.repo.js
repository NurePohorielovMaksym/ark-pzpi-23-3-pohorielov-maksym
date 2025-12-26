// src/repositories/devices.repo.js
const { query } = require("../config/db");

async function listByUserId(userId) {
  const r = await query(
    `SELECT id, userId, serial, name, lastSeenAt
     FROM dbo.DEVICES
     WHERE userId = @userId
     ORDER BY id DESC`,
    { userId }
  );
  return r.recordset;
}

async function createDevice(userId, dto) {
  const r = await query(
    `
    INSERT INTO dbo.DEVICES (userId, serial, name, apiKeyHash)
    OUTPUT INSERTED.id, INSERTED.userId, INSERTED.serial, INSERTED.name
    VALUES (@userId, @serial, @name, @apiKeyHash)
    `,
    {
      userId,
      serial: dto.serial,
      name: dto.name || null,
      apiKeyHash: dto.apiKeyHash,
    }
  );
  return r.recordset[0];
}

async function deleteById(userId, deviceId) {
  const r = await query(
    `DELETE FROM dbo.DEVICES WHERE id=@id AND userId=@userId`,
    { id: deviceId, userId }
  );
  return r.rowsAffected[0] > 0;
}

module.exports = {
  listByUserId,
  createDevice,
  deleteById,
};

