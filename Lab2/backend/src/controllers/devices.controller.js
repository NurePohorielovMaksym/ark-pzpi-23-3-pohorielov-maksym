// src/controllers/devices.controller.js
const { asyncHandler } = require("../utils/asyncHandler");
const devicesService = require("../services/devices.service");

exports.listMyDevices = asyncHandler(async (req, res) => {
  const devices = await devicesService.listMyDevices(req.user.id);
  res.json({ ok: true, devices });
});

exports.createMyDevice = asyncHandler(async (req, res) => {
  const result = await devicesService.createMyDevice(req.user.id, req.body);
  res.status(201).json({ ok: true, ...result });
});

exports.deleteMyDevice = asyncHandler(async (req, res) => {
  await devicesService.deleteMyDevice(req.user.id, req.params.id);
  res.json({ ok: true });
});
