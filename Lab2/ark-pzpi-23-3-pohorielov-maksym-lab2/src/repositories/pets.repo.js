const { query } = require("../config/db");

async function listByUserId(userId) {
  const r = await query("SELECT * FROM dbo.PETS WHERE userId=@userId ORDER BY id DESC", { userId });
  return r.recordset;
}

async function createPet(userId, dto) {
  const r = await query(`
    INSERT INTO dbo.PETS (userId, name, photoUrl, foodType, recommendedPortionGrams)
    OUTPUT INSERTED.*
    VALUES (@userId, @name, @photoUrl, @foodType, @recommendedPortionGrams)
  `, {
    userId,
    name: dto.name,
    photoUrl: dto.photoUrl || null,
    foodType: dto.foodType || null,
    recommendedPortionGrams: dto.recommendedPortionGrams ?? null,
  });
  return r.recordset[0];
}

async function deletePet(userId, petId) {
  const r = await query("DELETE FROM dbo.PETS WHERE id=@petId AND userId=@userId", { petId, userId });
  return r.rowsAffected[0] > 0;
}

async function setFeedingPlan(petId, feedingPlanId) {
  await query(`
    UPDATE dbo.PETS
    SET feedingPlanId = @feedingPlanId
    WHERE id = @petId
  `, { petId, feedingPlanId });
}

async function getById(petId) {
   const r = await query(`
    SELECT
      id,
      userId AS userId,
      name,
      photoUrl,
      foodType,
      recommendedPortionGrams,
      feedingPlanId
    FROM dbo.PETS
    WHERE id = @petId
  `, { petId });

  return r.recordset[0];
}

async function getByIdForUser(userId, petId) {
  const r = await query(`
    SELECT *
    FROM dbo.PETS
    WHERE id = @petId AND userId = @userId
  `, { petId, userId });

  return r.recordset[0] || null;
}

async function getSchedulesForPet(petId, userId) {
  const r = await query(`
    SELECT
      s.id,
      s.feedTime,
      s.portionGrams,
      s.mode,
      s.enabled
    FROM FEEDING_SCHEDULES s
    JOIN FEEDING_PLANS fp ON fp.id = s.planId
    JOIN PETS p ON p.feedingPlanId = fp.id
    WHERE p.id = @petId AND p.userId = @userId
    ORDER BY s.feedTime
  `, { petId, userId });

  return r.recordset
  }


module.exports = { listByUserId, createPet, deletePet, getById, setFeedingPlan, getByIdForUser, getSchedulesForPet };
