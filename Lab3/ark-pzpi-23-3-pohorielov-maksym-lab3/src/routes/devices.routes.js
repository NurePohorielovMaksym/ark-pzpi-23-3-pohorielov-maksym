import express from "express";
const router = express.Router();

import { authMiddleware,deviceAuth } from "../middlewares/auth.middleware.js";
import {
  listMyDevices,
  createMyDevice,
  deleteMyDevice,
  connectDevice,
  refillDeviceFood,
  heartbeat,
  getMyFeedingProfile
} from "../controllers/devices.controller.js";

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Керування пристроями користувача
 */

/**
 * @swagger
 * /api/devices/{deviceId}/refill:
 *   post:
 *     summary: Додати корм у пристрій
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пристрою
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grams
 *             properties:
 *               grams:
 *                 type: integer
 *                 example: 500
 *     responses:
 *       200:
 *         description: Успішно
 */
router.post("/:deviceId/refill", refillDeviceFood);

/**
 * @swagger
 * /api/devices/heartbeat:
 *   post:
 *     summary: Оновити статус активності (лише за ID)
 *     description: Пристрій надсилає свій ID, щоб сервер знав, що він онлайн.
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *             properties:
 *               deviceId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Статус оновлено
 *       403:
 *         description: Пристрій не активовано (isConnected = 0)
 *       404:
 *         description: Пристрій не знайдено
 */

router.post(
  "/heartbeat",
  heartbeat
);


router.get("/:id/state", async (req, res) => {
  const deviceId = req.params.id;

  const device = await db.query(
    "SELECT foodLevel FROM DEVICE_STATUSES WHERE deviceId = @deviceId",
    [deviceId]
  );

  res.json({
    foodLevel: device.rows[0].food_level
  });
});

router.get("/my-pet-profile/:serial", getMyFeedingProfile);

router.use(authMiddleware);
/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Отримати список пристроїв користувача
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пристроїв
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
router.get("/", listMyDevices);

/**
 * @swagger
 * /api/devices/add:
 *   post:
 *     summary: Додати новий пристрій
 *     tags: [Devices]
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
 *               - serial
 *               - capacity
 *             properties:
 *               serial:
 *                 type: string
 *                 example: ABC-123456
 *               name:
 *                 type: string
 *                 example: Kitchen feeder
 *               capacity:
 *                 type: string
 *                 example: 1000
 *     responses:
 *       201:
 *         description: Пристрій додано
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Unauthorized
 */
router.post("/add", createMyDevice);

/**
 * @swagger
 * /api/devices/{id}:
 *   delete:
 *     summary: Видалити пристрій за ID
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пристрою
 *     responses:
 *       200:
 *         description: Пристрій видалено
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Пристрій не знайдено
 */
router.delete("/:id", deleteMyDevice);

/**
 * @swagger
 * /api/devices/connect:
 *   post:
 *     summary: Підключити пристрій до системи
 *     tags: [Devices]
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
 *               - serial
 *               - apiKey
 *             properties:
 *               name:
 *                 type: string
 *                 example: Kitchen feeder
 *               serial:
 *                 type: string
 *                 example: ABC-123456
 *               apiKey:
 *                 type: string
 *                 example: device-secret-key
 *     responses:
 *       200:
 *         description: Пристрій успішно підключено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Unauthorized
 */
router.post("/connect", connectDevice);


export default router;