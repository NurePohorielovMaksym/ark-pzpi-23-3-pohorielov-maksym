const petsRepo = require("../repositories/pets.repo");
const feedingPlansRepo = require("../repositories/feeding-plans.repo");

async function listMyPets(userId) {
  return petsRepo.listByUserId(userId);
}

async function createMyPet(userId, dto) {
  if (!dto?.name) {
    const err = new Error("Pet name is required");
    err.statusCode = 400;
    throw err;
  }
  return petsRepo.createPet(userId, dto);
}

async function deleteMyPet(userId, petId) {
  const ok = await petsRepo.deletePet(userId, petId);
  if (!ok) {
    const err = new Error("Pet not found");
    err.statusCode = 404;
    throw err;
  }
  return true;
}

async function assignFeedingPlan(userId, petId, feedingPlanId) {
  userId = Number(userId);
  petId = Number(petId);
  feedingPlanId = Number(feedingPlanId);

  // 1) тварина існує і належить юзеру
  const pet = await petsRepo.getByIdForUser(userId, petId);

  const petOwnerId = Number(pet?.userId ?? pet?.userid); // <-- ВАЖЛИВО
  if (!pet || petOwnerId !== userId) {
    const err = new Error("Pet not found or access denied");
    err.statusCode = 404;
    throw err;
  }

  // 2) план існує і належить юзеру
  // у тебе repo.getById має сигнатуру (userId, planId)
  const plan = await feedingPlansRepo.getById(userId, feedingPlanId);

  if (!plan) {
    const err = new Error("Feeding plan not found or access denied");
    err.statusCode = 404;
    throw err;
  }

  // 3) присвоюємо план тварині
  await petsRepo.setFeedingPlan(petId, feedingPlanId);

  // 4) повертаємо оновлену тварину
  return await petsRepo.getById(petId);
}

async function getPetSchedules(userId, petId) {
  userId = Number(userId);
  petId = Number(petId);

  // 1) перевіряємо, що тварина існує і належить юзеру
  const pet = await petsRepo.getByIdForUser(userId, petId);
  if (!pet) {
    const err = new Error("Pet not found or access denied");
    err.statusCode = 404;
    throw err;
  }

  // 2) якщо план не призначений
  if (!pet.feedingPlanId) {
    return []; // просто порожній розклад
  }

  // 3) тягнемо розклад
  return await petsRepo.getSchedulesForPet(petId, userId);
}

module.exports = { listMyPets, createMyPet, deleteMyPet, assignFeedingPlan, getPetSchedules};
