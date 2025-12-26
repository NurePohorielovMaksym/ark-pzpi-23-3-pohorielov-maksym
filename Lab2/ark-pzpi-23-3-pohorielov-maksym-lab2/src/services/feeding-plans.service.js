const feedingPlansRepo = require("../repositories/feeding-plans.repo");

async function createPlan(userId, name, description) {
  if (!name) {
    const err = new Error("Plan name is required");
    err.statusCode = 400;
    throw err;
  }
  return feedingPlansRepo.create(userId, name, description);
}

async function listPlans(userId) {
  return feedingPlansRepo.listByUser(userId);
}

async function getPlanById(userId, planId) {
  const plan = await feedingPlansRepo.getById(userId, planId);
  if (!plan) {
    const err = new Error("Feeding plan not found");
    err.statusCode = 404;
    throw err;
  }
  return plan;
}

module.exports = {
  createPlan,
  listPlans,
  getPlanById
};
