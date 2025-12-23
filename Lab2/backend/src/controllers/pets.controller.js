const { asyncHandler } = require("../utils/asyncHandler");
const petsService = require("../services/pets.service");

const listMyPets = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const pets = await petsService.listMyPets(userId);
  res.json({ ok: true, pets });
});

async function createMyPet(req, res) {
  const userId = req.user.id; 
  const pet = await petsService.createMyPet(userId, req.body);

  res.status(201).json({
    ok: true,
    pet,
  });
}


const deleteMyPet = asyncHandler(async (req, res) => {
    const userId = req.user.id;
  await petsService.deleteMyPet(userId, Number(req.params.id));
  res.json({ ok: true });
});


async function assignFeedingPlan(req, res) {
  const userId = req.user.id;
  const petId = Number(req.params.petId);
  const { feedingPlanId } = req.body;

  const pet = await petsService.assignFeedingPlan(
    userId,
    petId,
    feedingPlanId
  );

  res.json({ ok: true, pet });
}

async function getPetSchedules(req, res) {
  const userId = req.user.id;
  const petId = req.params.petId;

  const schedules = await petsService.getPetSchedules(userId, petId);

  res.json({
    ok: true,
    schedules
  });
}

module.exports = { listMyPets, createMyPet, deleteMyPet, assignFeedingPlan, getPetSchedules };
