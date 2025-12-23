const schedulesService = require("../services/schedules.service");

async function listSchedules(req, res) {
  const petId = Number(req.params.petId);
  const data = await schedulesService.listByPet(petId);
  res.json(data);
}

async function createSchedule(req, res) {
  const petId = Number(req.params.petId);
  const data = await schedulesService.createForPet(petId, req.body);
  res.status(201).json(data);
}

async function listSchedulesForPlan(req, res) {
  const planId = Number(req.params.planId);
  const data = await schedulesService.listByPlan(planId);
  res.json(data);
}

async function createScheduleForPlan(req, res) {
  const planId = Number(req.params.planId);
  const data = await schedulesService.createForPlan(planId, req.body);
  res.status(201).json(data);
}

module.exports = {
  listSchedules,
  createSchedule,
  listSchedulesForPlan,
  createScheduleForPlan
};

