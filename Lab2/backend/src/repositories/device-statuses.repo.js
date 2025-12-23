const { query } = require("../config/db");

async function createStatus({ deviceId, foodLevelPercent, status }) {
  const r = await query(`
    INSERT INTO dbo.DEVICE_STATUSES (deviceId, reportedAt, foodLevelPercent, status)
    OUTPUT INSERTED.*
    VALUES (@deviceId, SYSUTCDATETIME(), @foodLevelPercent, @status)
  `, {
    deviceId,
    foodLevelPercent: foodLevelPercent ?? null,
    status: status || "OK",
  });
  return r.recordset[0];
}

module.exports = { createStatus };
