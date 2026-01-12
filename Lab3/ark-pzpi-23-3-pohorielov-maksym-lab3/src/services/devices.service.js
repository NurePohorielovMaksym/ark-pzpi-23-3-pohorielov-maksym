// src/services/devices.service.js
import { randomBytes, createHash } from "crypto";
import { listByUserId, createDevice, deleteById } from "../repositories/devices.repo.js";
import * as devicesRepo from "../repositories/devices.repo.js";
import { query } from "../config/db.js"; 
import * as notificationsRepo from "../repositories/notifications.repo.js"

function generateApiKey() {
  return randomBytes(32).toString("hex");
}

function hashApiKey(apiKey) {
  return createHash("sha256").update(apiKey).digest("hex");
}

export async function listMyDevices(userId) {
  return listByUserId(userId);
}

export async function createMyDevice(userId, dto) {
  if (!dto.serial) {
    const err = new Error("Device serial is required");
    err.statusCode = 400;
    throw err;
  }

  const apiKey = generateApiKey();
  const apiKeyHash = hashApiKey(apiKey);

  const device = await createDevice(userId, {
    serial: dto.serial,
    name: dto.name,
    capacity: dto.capacity,
    apiKeyHash,
  });

  return { device, apiKey };
}

export async function deleteMyDevice(userId, deviceId) {
  await ensureDeviceConnected(deviceId, userId);
  const ok = await deleteById(userId, deviceId);
  if (!ok) {
    const err = new Error("Device not found");
    err.statusCode = 404;
    throw err;
  }
  return true;
}

export async function pairDevice(userId, { serial, apiKey }) {
  const device = await devicesRepo.findBySerial(serial);

  if (!device) {
    const err = new Error("Пристрій не знайдено.");
    err.statusCode = 404;
    throw err;
  }

  if (device.isConnected) {
    const err = new Error("Цей пристрій вже активовано.");
    err.statusCode = 400;
    throw err;
  }

  const incomingHash = hashApiKey(apiKey);
  if (incomingHash !== device.apiKeyHash) {
    const err = new Error("Невірний API ключ.");
    err.statusCode = 401;
    throw err;
  }

  await devicesRepo.linkDeviceToUser(device.id, userId);
  
  return { success: true, deviceName: device.name };
}

export async function refillFood(userId, deviceId, gramsToAdd) {
  let device;

  if (userId) {
    await ensureDeviceConnected(deviceId, userId);
    device = await devicesRepo.getDeviceWithStatus(deviceId, userId);

    if (!device) throw new Error("Пристрій не знайдено");
    if (!device.isConnected) {
      const err = new Error("Помилка: необхідно спочатку підключити (спарити) пристрій");
      err.statusCode = 400;
      throw err;
    }

  } else {
    const res = await query(`
      SELECT d.capacity, s.foodLevel
      FROM dbo.DEVICES d
      LEFT JOIN dbo.DEVICE_STATUSES s ON d.id = s.deviceId
      WHERE d.id = @deviceId
    `, { deviceId });

    if (res.recordset.length === 0) {
      throw new Error("Пристрій не знайдено");
    }

    const row = res.recordset[0];
    device = {
      capacity: row.capacity,
      foodLevel: row.foodLevel || 0,
      isConnected: true 
    };
  }
  const currentLevel = device.foodLevel || 0;
  const capacity = device.capacity;

  if (gramsToAdd < 1) throw new Error("Замало, мінімум 1 грам");
  
  if (currentLevel + gramsToAdd > capacity) {
    throw new Error(`Забагато! Вільно лише ${capacity - currentLevel}г`);
  }

  const lastseenAt = await devicesRepo.touchDevice(deviceId);
  const newLevel = currentLevel + gramsToAdd;
  const newPercent = Math.round((newLevel * 100) / capacity);

  await devicesRepo.updateFoodStatus(deviceId, newLevel, newPercent);

  return {
    added: gramsToAdd,
    totalNow: newLevel,
    percentNow: `${newPercent}%`,
    lastseenAt 
  };
}

export async function checkLowFoodLevel(deviceId, userId) {
  await ensureDeviceConnected(deviceId, userId);
  const data = await query(`
    SELECT 
        s.foodLevel, 
        s.foodLevelPercent, 
        p.recommendedPortionGrams,
        d.capacity
    FROM dbo.DEVICE_STATUSES s
    JOIN dbo.DEVICES d ON d.id = s.deviceId
    JOIN dbo.PETS p ON p.userId = d.userId
    WHERE s.deviceId = @deviceId AND d.userId = @userId
  `, { deviceId, userId });
  const info = data.recordset[0];
  await devicesRepo.touchDevice(deviceId);
  if (!info) return;

  const { foodLevel, foodLevelPercent, recommendedPortionGrams } = info;
  
  const recPortion = recommendedPortionGrams || 50; 
  const twoPortionsThreshold = recPortion * 2;

  let warningMessage = null;

  if (foodLevelPercent < 20) {
    warningMessage = `Увага! Рівень корму критично низький: ${foodLevelPercent}% (залишилось ${foodLevel}г).`;
  } else if (foodLevel < twoPortionsThreshold) {
    warningMessage = `Увага! Корму в баку (${foodLevel}г) вистачить менше ніж на два годування.`;
  }

  if (warningMessage) {
    await notificationsRepo.createNotification(deviceId, 'LOW_FOOD', warningMessage);
    
    return warningMessage; 
  }
  
  return null;
}

export async function ensureDeviceConnected(deviceId) {
  const device = await devicesRepo.getById(deviceId);
  if (!device) {
    const err = new Error("Пристрій не знайдено");
    err.statusCode = 404;
    throw err;
  }

  const lastseenAt = await devicesRepo.touchDevice(deviceId);

  if (!device.isConnected) {
    const err = new Error("Помилка: підключіть девайс");
    err.statusCode = 400;
    throw err;
  }
  
  return device, lastseenAt;
}
