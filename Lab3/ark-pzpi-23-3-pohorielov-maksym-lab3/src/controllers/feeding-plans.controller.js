// src/controllers/feeding-plans.controller.js
import { 
  createPlan as _createPlan, 
  listPlans as _listPlans, 
  getPlanById as _getPlanById 
} from "../services/feeding-plans.service.js";

export async function createPlan(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;

    const plan = await _createPlan(userId, name, description);
    res.status(201).json({ ok: true, plan });
  } catch (err) {
    next(err);
  }
}

export async function listPlans(req, res, next) {
  try {
    const userId = req.user.id;
    const plans = await _listPlans(userId);
    res.json({ ok: true, plans });
  } catch (err) {
    next(err);
  }
}

export async function getPlanById(req, res, next) {
  try {
    const userId = req.user.id;
    const planId = Number(req.params.planId);

    const plan = await _getPlanById(userId, planId);
    res.json({ ok: true, plan });
  } catch (err) {
    next(err);
  }
}
