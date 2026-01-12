// src/services/schedules.service.js
import * as schedulesRepo from "../repositories/schedules.repo.js";

export async function listByPet(petId) {
  return schedulesRepo.listByPetId(petId);
}

export async function createForPet(petId, dto) {
  if (!dto?.feedTime || !dto?.portionGrams) {
    const err = new Error("feedTime and portionGrams are required");
    err.statusCode = 400;
    throw err;
  }
  return schedulesRepo.createSchedule(petId, dto);
}

export async function listByPlan(planId) {
  return schedulesRepo.listByPlanId(planId);
}

export async function createForPlan(planId, dto) {
  if (!dto?.feedTime || !dto?.portionGrams) {
    const err = new Error("feedTime and portionGrams are required");
    err.statusCode = 400;
    throw err;
  }
  return schedulesRepo.createForPlan(planId, dto);
}

export async function executeSchedule(scheduleId, deviceId, userId) {
  const schedule = await schedulesRepo.getById(scheduleId);
  if (!schedule || !schedule.enabled) {
    throw new Error("Розклад не знайдено або вимкнено");
  }

  const event = await eventsService.createEvent(userId, {
    petId: schedule.petId,
    deviceId: deviceId,
    portionGrams: schedule.portionGrams,
    foodType: schedule.foodType || "Dry", 
    source: "AUTO", 
    result: "OK"
  });

  return {
    message: "Автоматичне годування виконано",
    event
  };
}

export async function patchSchedule(scheduleId, userId, updateData) {
  if (updateData.feedTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updateData.feedTime)) {
    throw new Error("Некоректний формат часу (має бути HH:mm)");
  }

  const updated = await schedulesRepo.updateSchedule(scheduleId, userId, updateData);
  
  if (!updated) {
    throw new Error("Розклад не знайдено або у вас немає прав на його зміну");
  }

  return updated;
}

export async function getForDevice(petId) {
  return schedulesRepo.getSchedulesByPetIdForDevice(petId);
}