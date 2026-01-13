// src/services/feeding-plans.service.js
import * as feedingPlansRepo from "../repositories/feeding-plans.repo.js";

export async function createPlan(userId, name, description) {
  if (!name) {
    const err = new Error("Plan name is required");
    err.statusCode = 400;
    throw err;
  }
  return feedingPlansRepo.create(userId, name, description);
}

export async function listPlans(userId) {
  return feedingPlansRepo.listByUser(userId);
}

export async function getPlanById(userId, planId) {
  const plan = await feedingPlansRepo.getById(userId, planId);
  if (!plan) {
    const err = new Error("Feeding plan not found");
    err.statusCode = 404;
    throw err;
  }
  return plan;
}

