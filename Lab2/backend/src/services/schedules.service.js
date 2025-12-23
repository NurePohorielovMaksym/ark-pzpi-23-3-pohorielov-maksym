const schedulesRepo = require("../repositories/schedules.repo");

/* ================= PET ================= */

async function listByPet(petId) {
  return schedulesRepo.listByPetId(petId);
}

async function createForPet(petId, dto) {
  if (!dto?.feedTime || !dto?.portionGrams) {
    const err = new Error("feedTime and portionGrams are required");
    err.statusCode = 400;
    throw err;
  }
  return schedulesRepo.createForPet(petId, dto);
}

/* ================= PLAN ================= */

async function listByPlan(planId) {
  return schedulesRepo.listByPlanId(planId);
}

async function createForPlan(planId, dto) {
  if (!dto?.feedTime || !dto?.portionGrams) {
    const err = new Error("feedTime and portionGrams are required");
    err.statusCode = 400;
    throw err;
  }
  return schedulesRepo.createForPlan(planId, dto);
}

module.exports = {
  listByPet,
  createForPet,
  listByPlan,
  createForPlan
};

