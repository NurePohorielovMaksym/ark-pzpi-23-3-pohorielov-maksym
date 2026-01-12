import { query } from "../config/db.js";

export async function listByUserId(userId) {
  const r = await query("SELECT * FROM dbo.PETS WHERE userId=@userId ORDER BY id DESC", { userId });
  return r.recordset;
}

export async function createPet(userId, dto) {
  const r = await query(`
    INSERT INTO dbo.PETS (userId, name, type, breed, weight, birthDate, activity, photoUrl, foodType, recommendedPortionGrams)
    OUTPUT INSERTED.*
    VALUES (@userId, @name, @type, @breed, @weight, @birthDate, @activity, @photoUrl, @foodType, @recommendedPortionGrams)
  `, {
    userId,
    name: dto.name,
    type: dto.type || null,        
    breed: dto.breed || null,      
    weight: dto.weight ?? null,    
    birthDate: dto.birthDate || null,
    activity: dto.activity || null, 
    photoUrl: dto.photoUrl || null,
    foodType: dto.foodType || null,
    recommendedPortionGrams: dto.recommendedPortionGrams ?? null,
  });
  return r.recordset[0];
}

export async function updatePet(userId, petId, dto) {
  const r = await query(`
    UPDATE dbo.PETS
    SET 
      name = COALESCE(@name, name),
      type = COALESCE(@type, type),
      breed = COALESCE(@breed, breed),
      weight = COALESCE(@weight, weight),
      birthDate = COALESCE(@birthDate, birthDate),
      activity = COALESCE(@activity, activity),
      photoUrl = COALESCE(@photoUrl, photoUrl),
      foodType = COALESCE(@foodType, foodType),
      recommendedPortionGrams = COALESCE(@recommendedPortionGrams, recommendedPortionGrams)
    OUTPUT INSERTED.*
    WHERE id = @petId AND userId = @userId
  `, {
    userId,
    petId,
    name: dto.name || null,
    type: dto.type || null,
    breed: dto.breed || null,
    weight: dto.weight ?? null,
    birthDate: dto.birthDate || null,
    activity: dto.activity || null,
    photoUrl: dto.photoUrl || null,
    foodType: dto.foodType || null,
    recommendedPortionGrams: dto.recommendedPortionGrams ?? null
  });

  return r.recordset[0];
}

export async function deletePet(userId, petId) {
  const r = await query("DELETE FROM dbo.PETS WHERE id=@petId AND userId=@userId", { petId, userId });
  return r.rowsAffected[0] > 0;
}

export async function setFeedingPlan(petId, feedingPlanId) {
  await query(`
    UPDATE dbo.PETS
    SET feedingPlanId = @feedingPlanId
    WHERE id = @petId
  `, { petId, feedingPlanId });
}

export async function getById(petId) {
   const r = await query(`
    SELECT
      id, userId, name, type, breed, weight, birthDate, activity,
      photoUrl, foodType, recommendedPortionGrams, feedingPlanId
    FROM dbo.PETS
    WHERE id = @petId
  `, { petId });

  return r.recordset[0];
}

export async function getByIdForUser(userId, petId) {
  console.log(`DATABASE QUERY: Looking for petId ${petId} with userId ${userId}`);
  const r = await query(
    `SELECT * FROM dbo.PETS WHERE id = @pId AND userId = @uId`,
    { 
      pId: Number(petId), 
      uId: Number(userId) 
    }
  );
  return r.recordset[0] || null;
}

export async function getSchedulesForPet(petId, userId) {
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

export async function getPetForCalculation(petId, userId) {
  const r = await query(
    `SELECT weight, activity, type FROM dbo.PETS WHERE id = @id AND userId = @userId`,
    { id: petId, userId }
  );
  return r.recordset[0] || null;
}

export async function updateRecommendedPortion(petId, portion) {
  await query(
    `UPDATE dbo.PETS SET recommendedPortionGrams = @portion WHERE id = @id`,
    { portion, id: petId }
  );
}

