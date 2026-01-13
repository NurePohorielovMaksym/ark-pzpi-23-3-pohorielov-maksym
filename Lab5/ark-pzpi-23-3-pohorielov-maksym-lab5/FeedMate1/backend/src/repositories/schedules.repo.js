import { query } from "../config/db.js";

export async function listByPetId(petId) {
  const r = await query("SELECT * FROM dbo.FEEDING_SCHEDULES WHERE petId=@petId ORDER BY feedTime", { petId });
  return r.recordset;
}

export async function createSchedule(petId, dto) {
  const r = await query(`
    INSERT INTO dbo.FEEDING_SCHEDULES (petId, feedTime, portionGrams, mode, enabled)
    OUTPUT INSERTED.*
    VALUES (@petId, @feedTime, @portionGrams, @mode, @enabled)
  `, {
    petId,
    feedTime: dto.feedTime,                 
    portionGrams: dto.portionGrams,
    mode: dto.mode || "AUTO",
    enabled: dto.enabled ?? true,
  });
  return r.recordset[0];
}

export async function createForPlan(planId, dto) {
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

export async function listByPlanId(planId) {
  const r = await query(
    "SELECT * FROM dbo.FEEDING_SCHEDULES WHERE planId=@planId ORDER BY feedTime",
    { planId }
  );
  return r.recordset;
}

export async function getById(id) {
  const r = await query("SELECT * FROM dbo.FEEDING_SCHEDULES WHERE id = @id", { id });
  return r.recordset[0];
}

export async function updateSchedule(scheduleId, userId, { feedTime, portionGrams }) {
  const r = await query(`
    UPDATE fs
    SET 
        fs.feedTime = ISNULL(@feedTime, fs.feedTime),
        fs.portionGrams = ISNULL(@portionGrams, fs.portionGrams)
    FROM dbo.FEEDING_SCHEDULES fs
    JOIN dbo.FEEDING_PLANS fp ON fs.planId = fp.id
    WHERE fs.id = @scheduleId AND fp.userId = @userId;
    
    SELECT * FROM dbo.FEEDING_SCHEDULES WHERE id = @scheduleId;
  `, { scheduleId, userId, feedTime, portionGrams });

  return r.recordset[0] || null;
}

export async function getSchedulesByPetIdForDevice(petId) {
  // Ми робимо JOIN, бо таблиця SCHEDULES не має petId, вона має planId.
  // А таблиця PETS має feedingPlanId.
  const sql = `
    SELECT 
      DATEPART(HOUR, fs.feedTime) as [hour],
      DATEPART(MINUTE, fs.feedTime) as [minute],
      fs.portionGrams,
      fs.enabled
    FROM PETS p
    JOIN FEEDING_SCHEDULES fs ON fs.planId = p.feedingPlanId
    WHERE p.id = @petId 
      AND fs.mode = 'AUTO' 
      AND fs.enabled = 1
    ORDER BY fs.feedTime ASC
  `;
  
  const r = await query(sql, { petId });
  return r.recordset;
}