import express from "express";
const router = express.Router();
import { upload } from '../config/upload.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  listMyPets,
  createMyPet,
  deleteMyPet,
  assignFeedingPlan,
  getPetSchedules,
  updatePet,
  calculatePetPortion
} from "../controllers/pets.controller.js";

/**
 * @swagger
 * tags:
 *   name: Pets
 *   description: Керування тваринами користувача
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/pets:
 *   get:
 *     summary: Отримати список тварин поточного користувача
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Масив об'єктів тварин
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
router.get("/", listMyPets);

/**
 * @swagger
 * /api/pets/add:
 *   post:
 *     summary: Додати нову тварину
 *     tags: [Pets]
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
 *               - photoUrl
 *               - foodType
 *               - recommendedPortionGrams
 *               - type
 *               - weight
 *               - birthDate
 *               - breed
 *               - activity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Lakusha
 *               type:
 *                 type: string
 *                 example: Dog
 *               breed:
 *                 type: string
 *                 example: Chihuahua
 *               weight:
 *                 type: string
 *                 example: 2
 *               birthDate:
 *                 type: string
 *                 example: 11.12.2021
 *               activity:
 *                 type: string
 *                 example: low
 *               photoUrl:
 *                 type: string
 *                 example: not
 *               foodType:
 *                 type: string
 *                 example: Dry
 *               recommendedPortionGrams:
 *                 type: string
 *                 example: 20
 *     responses:
 *       201:
 *         description: Тварину успішно додано
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Unauthorized
 */
router.post("/add", createMyPet);

/**
 * @swagger
 * /api/pets/{id}:
 *   delete:
 *     summary: Видалити тварину
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID тварини
 *     responses:
 *       200:
 *         description: Тварину видалено
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Тварину не знайдено
 */
router.delete("/:id", deleteMyPet);

/**
 * @swagger
 * /api/pets/{id}:
 *   put:
 *     summary: Оновити дані тварини
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Barsik
 *               type:
 *                 type: string
 *                 example: Dog
 *               breed:
 *                 type: string
 *                 example: Chihuahua
 *               weight:
 *                 type: string
 *                 example: 2.5
 *               birthDate:
 *                 type: string
 *                 example: 11.12.2021
 *               activity:
 *                 type: string
 *                 example: high
 *               photoUrl:
 *                 type: string
 *                 example: not
 *               foodType:
 *                 type: string
 *                 example: Dry
 *               recommendedPortionGrams:
 *                 type: string
 *                 example: 20
 *     responses:
 *       200:
 *         description: Дані оновлено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Тварину не знайдено
 */
router.put("/:id", updatePet);

//фото файл завантажити
router.put("/photo/:id", upload.single('photo'), updatePet);

/**
 * @swagger
 * /api/pets/{petId}/feeding-plan:
 *   post:
 *     summary: Призначити план годування тварині
 *     tags: [Pets]
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
 *               - planId
 *             properties:
 *               planId:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: План призначено
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Тварину або план не знайдено
 */
router.post("/:petId/feeding-plan", assignFeedingPlan);

/**
 * @swagger
 * /api/pets/{petId}/schedules:
 *   get:
 *     summary: Отримати всі розклади для тварини
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID тварини
 *     responses:
 *       200:
 *         description: Список розкладів
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
router.get("/:petId/schedules", getPetSchedules);

/**
 * @swagger
 * /api/pets/{petId}/rec-portion:
 *   post:
 *     summary: Розрахувати та оновити рекомендовану порцію
 *     tags:
 *       - Pets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Рекомендована порція успішно оновлена
 *       404:
 *         description: Тварину не знайдено
 */
router.post("/:petId/rec-portion", calculatePetPortion);


export default router;
