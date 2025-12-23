// src/services/devices.service.js
const crypto = require("crypto");
const devicesRepo = require("../repositories/devices.repo");

function generateApiKey() {
  return crypto.randomBytes(32).toString("hex");
}

function hashApiKey(apiKey) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

async function listMyDevices(userId) {
  return devicesRepo.listByUserId(userId);
}

async function createMyDevice(userId, dto) {
  if (!dto.serial) {
    const err = new Error("Device serial is required");
    err.statusCode = 400;
    throw err;
  }

  const apiKey = generateApiKey();
  const apiKeyHash = hashApiKey(apiKey);

  const device = await devicesRepo.createDevice(userId, {
    serial: dto.serial,
    name: dto.name,
    apiKeyHash,
  });

  // ВАЖЛИВО: apiKey показується ТІЛЬКИ ОДИН РАЗ
  return { device, apiKey };
}

async function deleteMyDevice(userId, deviceId) {
  const ok = await devicesRepo.deleteById(userId, deviceId);
  if (!ok) {
    const err = new Error("Device not found");
    err.statusCode = 404;
    throw err;
  }
  return true;
}

module.exports = {
  listMyDevices,
  createMyDevice,
  deleteMyDevice,
};
