import express from "express";
const router = express.Router();

import {
  register,
  login,
  updateMe,
  deleteMe,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Аутентифікація та профіль користувача
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Реєстрація нового користувача
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: strongPass123
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               role:
 *                 type: string
 *                 example: admin
 *     responses:
 *       201:
 *         description: Користувач успішно зареєстрований
 *       400:
 *         description: Некоректні дані
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Автентифікація користувача
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: strongPass123
 *     responses:
 *       200:
 *         description: Успішний вхід, повертає JWT токен
 *       401:
 *         description: Невірні облікові дані
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/me:
 *   delete:
 *     summary: Видалення власного профілю
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Профіль успішно видалено
 *       401:
 *         description: Unauthorized
 */
router.delete("/me", authMiddleware, deleteMe);

/**
 * @swagger
 * /api/auth/me:
 *   patch:
 *     summary: Оновлення даних власного профілю
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: new@email.com
 *     responses:
 *       200:
 *         description: Дані оновлено
 *       401:
 *         description: Unauthorized
 */
router.patch("/me", authMiddleware, updateMe);

export default router;

