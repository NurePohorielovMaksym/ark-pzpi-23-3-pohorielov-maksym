// src/controllers/pets.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { 
  listMyPets as _listMyPets, 
  createMyPet as _createMyPet, 
  deleteMyPet as _deleteMyPet, 
  assignFeedingPlan as _assignFeedingPlan, 
  getPetSchedules as _getPetSchedules,
  calculateAndSavePortion as _calculateAndSavePortion, 
  updateMyPet as _updateMyPet
} from "../services/pets.service.js";
import { uploadToImageKit } from "../config/UploadToImageKit.js";

export const listMyPets = asyncHandler(async (req, res) => {
  const pets = await _listMyPets(req.user.id);
  res.json({ ok: true, pets });
});

export const createMyPet = asyncHandler(async (req, res) => {
  const pet = await _createMyPet(req.user.id, req.body);
  res.status(201).json({ ok: true, pet });
});

export const updatePet = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const petId = Number(req.params.id);
  
  let updateData = { ...req.body };

  if (req.file) {
    const cloudUrl = await uploadToImageKit(req.file);
    updateData.photoUrl = cloudUrl;
  }

  const pet = await _updateMyPet(userId, petId, updateData);
  
  res.json({
    ok: true,
    pet
  });
});

export const deleteMyPet = asyncHandler(async (req, res) => {
  await _deleteMyPet(req.user.id, Number(req.params.id));
  res.json({ ok: true });
});

export const assignFeedingPlan = asyncHandler(async (req, res) => {
  const pet = await _assignFeedingPlan(
    req.user.id,
    Number(req.params.petId),
    Number(req.body.planId)
  );
  res.json({ ok: true, pet });
});

export const getPetSchedules = asyncHandler(async (req, res) => {
  const schedules = await _getPetSchedules(req.user.id, Number(req.params.petId));
  res.json({ ok: true, schedules });
});

export const calculatePetPortion = asyncHandler(async (req, res) => {
  const { petId } = req.params;
  const userId = req.user.id;

  const calculatedGrams = await _calculateAndSavePortion(petId, userId);

  res.json({
    ok: true,
    message: "Рекомендовану порцію оновлено",
    data: {
      petId: Number(petId),
      recommendedPortionGrams: calculatedGrams
    }
  });
});