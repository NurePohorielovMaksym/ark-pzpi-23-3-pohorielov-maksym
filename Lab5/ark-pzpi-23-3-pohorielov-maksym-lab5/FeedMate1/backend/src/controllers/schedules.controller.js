// src/controllers/schedules.controller.js
import { 
  listByPet as _listByPet, 
  createForPet as _createForPet, 
  listByPlan as _listByPlan, 
  createForPlan as _createForPlan,
  patchSchedule as _patchSchedule,
  getForDevice as _getForDevice
} from "../services/schedules.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export async function listSchedules(req, res, next) {
  try {
    const petId = Number(req.params.petId);
    const data = await _listByPet(petId);
    res.json({ ok: true, schedules: data });
  } catch (err) { next(err); }
}

export async function createSchedule(req, res, next) {
  try {
    const petId = Number(req.params.petId);
    const data = await _createForPet(petId, req.body);
    res.status(201).json({ ok: true, schedule: data });
  } catch (err) { next(err); }
}

export async function listSchedulesForPlan(req, res, next) {
  try {
    const planId = Number(req.params.planId);
    const data = await _listByPlan(planId);
    res.json({ ok: true, schedules: data });
  } catch (err) { next(err); }
}

export async function createScheduleForPlan(req, res, next) {
  try {
    const planId = Number(req.params.planId);
    const data = await _createForPlan(planId, req.body);
    res.status(201).json({ ok: true, schedule: data });
  } catch (err) { next(err); }
}

export const updateScheduleItem = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;
  const userId = req.user.id;
  const { feedTime, portionGrams } = req.body;

  const updatedSchedule = await _patchSchedule(
    parseInt(scheduleId), 
    userId, 
    { feedTime, portionGrams }
  );

  res.json({
    ok: true,
    message: "Розклад успішно оновлено",
    data: updatedSchedule
  });
});

export const getSchedulesForDevice = asyncHandler(async (req, res) => {
  const { petId } = req.params;
  
  // Викликаємо сервіс
  const schedules = await _getForDevice(petId);

  // Віддаємо у форматі, який чекає C++
  res.json({ 
    ok: true, 
    schedules: schedules // [{ hour: 8, minute: 30, portionGrams: 50, enabled: true }, ...]
  });
});