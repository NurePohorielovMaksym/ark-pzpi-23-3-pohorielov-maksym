// src/controllers/devices.controller.js
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listMyDevices as listMyDevicesService,
  createMyDevice as createMyDeviceService,
  deleteMyDevice as deleteMyDeviceService,
  pairDevice as pairDeviceService,
  refillFood as refillFoodService,
  ensureDeviceConnected as _ensureDeviceConnectedService
} from "../services/devices.service.js";
import { query } from "../config/db.js";

export const listMyDevices = asyncHandler(async (req, res) => {
  const devices = await listMyDevicesService(req.user.id);
  res.json({ ok: true, devices });
});

export const createMyDevice = asyncHandler(async (req, res) => {
  const result = await createMyDeviceService(req.user.id, req.body);
  res.status(201).json({ ok: true, ...result });
});

export const deleteMyDevice = asyncHandler(async (req, res) => {
  await deleteMyDeviceService(req.user.id, req.params.id);
  res.json({ ok: true });
});

export const connectDevice = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { serial, apiKey } = req.body;
  const result = await pairDeviceService(userId, { serial, apiKey });
  res.json({
    ok: true,
    message: `Пристрій ${result.deviceName} успішно підключено!`
  });
});

export const refillDeviceFood = asyncHandler(async (req, res) => {
  const deviceId = req.params.deviceId;
  const { grams } = req.body;
  
  const userId = req.user ? req.user.id : null;

  const updatedData = await refillFoodService(userId, deviceId, grams);
  
  res.json({
    ok: true,
    message: "Запас корму оновлено",
    data: updatedData
  });
});

export const heartbeat = asyncHandler(async (req, res) => {
    const deviceId = req.params?.deviceId || req.body?.deviceId || req.deviceId;
    if (!deviceId) {
        return res.status(400).json({ ok: false, message: "Device ID is missing" });
    }
    await _ensureDeviceConnectedService(deviceId);
    res.json({
        ok: true,
        serverTime: new Date().toISOString()
    });
});

export const getMyFeedingProfile = asyncHandler(async (req, res) => {
  const { serial } = req.params; 

  if (!serial) {
    return res.status(400).json({ ok: false, message: "Не вказано серійний номер" });
  }

  // 2. Змінюємо SQL запит: шукаємо по 'serial', а не по 'id'
  // (Переконайтеся, що у вашій базі таблиця DEVICES має колонку 'serial')
  const data = await query(`
    SELECT
      p.id  AS petId,
      d.id  AS deviceId,
      p.recommendedPortionGrams
    FROM DEVICES d
    JOIN PETS p ON p.userId = d.userId
    WHERE d.serial = @serial
  `, { serial: serial });

  if (!data.recordset[0]) {
    // Якщо пристрій не знайдено або до нього не прив'язана тварина
    return res.status(404).json({ ok: false, message: "Пристрій або профіль не знайдено" });
  }

  res.json({ ok: true, profile: data.recordset[0] });
});
