// src/controllers/feeding.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { feedNow as _feedNow, history as _history } from "../services/feeding.service.js";

export const feedNow = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user.id : null; 
  
  const petId = req.params.petId;
  const { deviceId, portionGrams, foodType } = req.body;
  const event = await _feedNow(userId, { petId, deviceId, portionGrams, foodType});
  
  res.status(201).json({ 
    ok: true, 
    message: "Команда на годування відправлена",
    event,
    currentCapacity: event.currentCapacity
  });
});

export const history = asyncHandler(async (req, res) => {
  const petId = Number(req.params.petId);
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  
  const events = await _history(petId, limit);
  res.json({ ok: true, events });
});


export const feedAuto = asyncHandler(async (req, res) => {
  const petId = req.params.petId;
  const { deviceId, portionGrams, foodType } = req.body;

  const event = await _feedNow(null, { 
    petId, 
    deviceId, 
    portionGrams, 
    foodType,
    source: "AUTO" 
  });
  
  res.status(201).json({ 
    ok: true, 
    message: "Автоматичне годування виконано",
    event,
    currentCapacity: event.currentCapacity
  });
});