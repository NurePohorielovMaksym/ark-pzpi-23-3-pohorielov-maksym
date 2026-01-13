import express from "express";
const router = express.Router();

import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createPlan,
  listPlans,
  getPlanById,
} from "../controllers/feeding-plans.controller.js";

/**
 * @swagger
 * tags:
 *   name: Feeding Plans
 *   description: Плани годування
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/feeding-plans/add:
 *   post:
 *     summary: Створити новий глобальний план годування
 *     tags: [Feeding Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Puppy basic
 *               description:
 *                 type: string
 *                 example: Базовий план годування для цуценят
 *     responses:
 *       201:
 *         description: План створено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Unauthorized
 */
router.post("/add", createPlan);

/**
 * @swagger
 * /api/feeding-plans:
 *   get:
 *     summary: Список усіх доступних планів годування
 *     tags: [Feeding Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Масив планів
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
router.get("/", listPlans);

/**
 * @swagger
 * /api/feeding-plans/{planId}:
 *   get:
 *     summary: Отримати детальну інформацію про план
 *     tags: [Feeding Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID плану годування
 *     responses:
 *       200:
 *         description: Дані плану
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: План не знайдено
 */
router.get("/:planId", getPlanById);

export default router;

