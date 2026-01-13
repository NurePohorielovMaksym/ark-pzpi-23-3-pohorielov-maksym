import express from "express";
const router = express.Router();

import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  listSchedules,
  createSchedule,
  createScheduleForPlan,
  listSchedulesForPlan,
  updateScheduleItem,
  getSchedulesForDevice,
} from "../controllers/schedules.controller.js";
import { feedNow, feedAuto} from "../controllers/feeding.controller.js";

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Розклади годування
 */

/**
 * @swagger
 * tags:
 *   name: Feeding
 *   description: Події та керування годуванням
 */
router.get("/pets/:petId", getSchedulesForDevice);
/**
 * @swagger
 * /api/schedules/pets/{petId}/feed-now:
 *   post:
 *     summary: Виконати негайне годування
 *     tags: [Feeding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID тварини
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - portionGrams
 *               - foodType
 *             properties:
 *               deviceId:
 *                 type: integer
 *                 example: 14
 *               portionGrams:
 *                 type: integer
 *                 example: 50
 *               foodType:
 *                 type: integer
 *                 example: Dry
 *     responses:
 *       201:
 *         description: Годування успішно ініційовано
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Unauthorized
 */
router.post("/pets/:petId/feed-now", feedNow);
router.post("/pets/:petId/feed-auto", feedAuto);

router.use(authMiddleware);


/**
 * @swagger
 * /api/schedules/plans/{planId}:
 *   get:
 *     summary: Отримати розклади, прив'язані до плану годування
 *     tags: [Schedules]
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
 *         description: Список розкладів плану
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
router.get("/plans/:planId", listSchedulesForPlan);

/**
 * @swagger
 * /api/schedules/plans/{planId}:
 *   post:
 *     summary: Додати розклад до плану годування
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID плану годування
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedTime
 *               - portionGrams
 *             properties:
 *               feedTime:
 *                 type: string
 *                 example: "12:00"
 *               portionGrams:
 *                 type: integer
 *                 example: 70
 *     responses:
 *       201:
 *         description: Розклад плану створено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Unauthorized
 */
router.post("/plans/:planId", createScheduleForPlan);

/**
 * @swagger
 * /api/schedules/{scheduleId}:
 *   patch:
 *     summary: Оновити конкретний запис у розкладі
 *     description: Дозволяє змінити час годування або кількість грам для конкретного ID розкладу.
 *     tags:
 *       - Schedules
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID запису розкладу 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feedTime:
 *                 type: string
 *                 example: "09:45"
 *                 description: Час у форматі HH:mm
 *               portionGrams:
 *                 type: integer
 *                 example: 65
 *     responses:
 *       200:
 *         description: Успішне оновлення
 *       404:
 *         description: Розклад не знайдено або доступ заборонено
 */
router.patch("/:scheduleId", authMiddleware, updateScheduleItem);

export default router;

