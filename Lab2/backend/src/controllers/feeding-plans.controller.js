const feedingPlansService = require("../services/feeding-plans.service");

async function createPlan(req, res) {
  const userId = req.user.id;
  const { name, description } = req.body;

  const plan = await feedingPlansService.createPlan(
    userId,
    name,
    description
  );

  res.status(201).json({ ok: true, plan });
}

async function listPlans(req, res) {
  const userId = req.user.id;
  const plans = await feedingPlansService.listPlans(userId);
  res.json({ ok: true, plans });
}

async function getPlanById(req, res) {
  const userId = req.user.id;
  const planId = Number(req.params.planId);

  const plan = await feedingPlansService.getPlanById(userId, planId);
  res.json({ ok: true, plan });
}

module.exports = {
  createPlan,
  listPlans,
  getPlanById
};
