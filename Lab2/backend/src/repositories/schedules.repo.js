const { query } = require("../config/db");

async function listByPetId(petId) {
  const r = await query("SELECT * FROM dbo.FEEDING_SCHEDULES WHERE petId=@petId ORDER BY feedTime", { petId });
  return r.recordset;
}

async function createSchedule(petId, dto) {
  const r = await query(`
    INSERT INTO dbo.FEEDING_SCHEDULES (petId, feedTime, portionGrams, mode, enabled)
    OUTPUT INSERTED.*
    VALUES (@petId, @feedTime, @portionGrams, @mode, @enabled)
  `, {
    petId,
    feedTime: dto.feedTime,                 // expected as 'HH:MM:SS'
    portionGrams: dto.portionGrams,
    mode: dto.mode || "AUTO",
    enabled: dto.enabled ?? true,
  });
  return r.recordset[0];
}

module.exports = { listByPetId, createSchedule };

async function createForPlan(planId, dto) {
  const r = await query(
    `
    INSERT INTO dbo.FEEDING_SCHEDULES
      (planId, feedTime, portionGrams, mode, enabled)
    OUTPUT INSERTED.*
    VALUES
      (@planId, @feedTime, @portionGrams, @mode, @enabled)
    `,
    {
      planId,
      feedTime: dto.feedTime,
      portionGrams: dto.portionGrams,
      mode: dto.mode || "AUTO",
      enabled: dto.enabled ?? true
    }
  );
  return r.recordset[0];
}

async function listByPlanId(planId) {
  const r = await query(
    "SELECT * FROM dbo.FEEDING_SCHEDULES WHERE planId=@planId ORDER BY feedTime",
    { planId }
  );
  return r.recordset;
}


module.exports = {
  listByPetId,
  createForPlan,
  listByPlanId,
  createForPlan
};