// src/services/pets.service.js
import * as petsRepo from "../repositories/pets.repo.js";
import * as feedingPlansRepo from "../repositories/feeding-plans.repo.js";

export async function listMyPets(userId) {
  return petsRepo.listByUserId(userId);
}

export async function createMyPet(userId, dto) {
  if (!dto?.name) {
    const err = new Error("Pet name is required");
    err.statusCode = 400;
    throw err;
  }
  return petsRepo.createPet(userId, dto);
}

export async function updateMyPet(userId, petId, dto) {
  const updatedPet = await petsRepo.updatePet(userId, petId, dto);
  
  if (!updatedPet) {
    const err = new Error("Pet not found or access denied");
    err.statusCode = 404;
    throw err;
  }
  
  return updatedPet;
}

export async function deleteMyPet(userId, petId) {
  const ok = await petsRepo.deletePet(userId, petId);
  if (!ok) {
    const err = new Error("Pet not found");
    err.statusCode = 404;
    throw err;
  }
  return true;
}

export async function assignFeedingPlan(userId, petId, planId) {
  userId = Number(userId);
  petId = Number(petId);
  planId = Number(planId)

  const pet = await petsRepo.getByIdForUser(userId, petId);
  const petOwnerId = pet ? Number(pet.userId || pet.userid) : null;

  if (!pet || petOwnerId !== userId) {
    const err = new Error("Pet not found or access denied");
    err.statusCode = 404;
    throw err;
  }

  const plan = await feedingPlansRepo.getById(userId, planId);
  if (!plan) {
    const err = new Error("Feeding plan not found or access denied");
    err.statusCode = 404;
    throw err;
  }

  await petsRepo.setFeedingPlan(petId, planId);
  return await petsRepo.getById(petId);
}

export async function getPetSchedules(userId, petId) {
  const pet = await petsRepo.getByIdForUser(userId, petId);
  if (!pet) {
    const err = new Error("Pet not found or access denied");
    err.statusCode = 404;
    throw err;
  }
  return petsRepo.getSchedulesForPet(petId, userId);
}

export async function calculateAndSavePortion(petId, userId) {
  const pet = await petsRepo.getPetForCalculation(petId, userId);
  
  if (!pet || !pet.weight) {
    throw new Error("Недостатньо даних для розрахунку (вкажіть вагу тварини)");
  }

  const weight = parseFloat(pet.weight);
  const rer = 70 * Math.pow(weight, 0.75);
  
  const coefficients = { low: 1.2, medium: 1.5, high: 1.8 };
  const coeff = coefficients[pet.activity?.toLowerCase()] || 1.2;
  const dailyCalories = rer * coeff;
  const caloriesPerGram = 3.5;

  if (pet.foodType === 'Wet') {
    caloriesPerGram = 1.0; 
  }

  const totalDailyGrams = dailyCalories / caloriesPerGram;
  const recommendedPortion = Math.round(totalDailyGrams / 2);

  await petsRepo.updateRecommendedPortion(petId, recommendedPortion);

  return {
    portion: recommendedPortion,
    typeUsed: pet.foodType || 'Dry'
  };
}