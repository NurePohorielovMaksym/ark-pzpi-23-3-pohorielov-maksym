import express from "express";
const router = express.Router();

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { eventsController } from "../controllers/feeding-events.controller.js";

/**
 * @swagger
 * tags:
 *   name: Feeding Events
 *   description: Події годування тварин
 */
/**
 * @swagger
 * /api/feeding-events/add:
 *   post:
 *     summary: Створити нову подію годування
 *     description: Додає запис про факт годування тварини до бази даних.
 *     tags: [Feeding Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - petId
 *               - portionGrams
 *               - result
 *             properties:
 *               petId:
 *                 type: integer
 *                 description: ID тварини
 *                 example: 4
 *               deviceId:
 *                 type: integer
 *                 description: ID пристрою (якщо годування автоматичне)
 *                 example: 2
 *               portionGrams:
 *                 type: integer
 *                 description: Вага порції в грамах
 *                 example: 60
 *               source:
 *                 type: string
 *                 description: Джерело годування (MANUAL_APP або AUTO)
 *                 example: MANUAL_APP
 *               result:
 *                 type: string
 *                 description: Статус годування
 *                 example: OK
 *     responses:
 *       201:
 *         description: Подію успішно створено
 *       401:
 *         description: Неавторизований доступ
 *       404:
 *         description: Тварину не знайдено або доступ заборонено
 */
router.post("/add", eventsController.create);
router.use(authMiddleware);



/**
 * @swagger
 * /api/feeding-events/pet/{petId}:
 *   get:
 *     summary: Отримати історію годувань для конкретної тварини
 *     description: Повертає список усіх подій годування, пов'язаних із вказаним petId.
 *     tags: [Feeding Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Унікальний ідентифікатор тварини
 *     responses:
 *       200:
 *         description: Список подій годування отримано
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Неавторизований доступ
 *       404:
 *         description: Тварину не знайдено
 */
router.get("/pet/:petId", eventsController.getByPet);

export default router;

