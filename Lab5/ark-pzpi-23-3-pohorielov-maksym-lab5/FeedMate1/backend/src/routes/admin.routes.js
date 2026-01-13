import express from "express";
const router = express.Router();

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";
import { adminController } from "../controllers/admin.controller.js";

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Адміністративні операції
 */

router.use(authMiddleware);
router.use(adminOnly);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Отримати глобальну статистику системи
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Об'єкт зі статистикою
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */
router.get("/stats", adminController.getGlobalStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Отримати список усіх користувачів
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список користувачів
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */
router.get("/users", adminController.listAllUsers);

/**
 * @swagger
 * /api/admin/devices:
 *   get:
 *     summary: Моніторинг усіх пристроїв у системі
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Дані моніторингу пристроїв
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalDevices:
 *                   type: integer
 *                   example: 42
 *                 onlineDevices:
 *                   type: integer
 *                   example: 30
 *                 deviceOnlineRate:
 *                   type: string
 *                   example: "71%"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */
router.get("/devices", adminController.monitorDevices);

/**
 * @swagger
 * /api/admin/role:
 *   patch:
 *     summary: Змінити роль користувача
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - role
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 12
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Роль оновлено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */
router.patch("/role", adminController.updateUserRole);

export default router;
