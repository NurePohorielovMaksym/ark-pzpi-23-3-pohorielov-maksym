const { asyncHandler } = require("../utils/asyncHandler");
const iotService = require("../services/iot.service");

/**
 * For lab simplicity:
 * Expect body: { deviceId, userId, foodLevelPercent, status }
 * In real: device auth by apiKey and resolve userId.
 */
const reportStatus = asyncHandler(async (req, res) => {
  const saved = await iotService.reportStatus(req.body);
  res.status(201).json({ ok: true, status: saved });
});

module.exports = { reportStatus };
