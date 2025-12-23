const { asyncHandler } = require("../utils/asyncHandler");
const feedingService = require("../services/feeding.service");

const feedNow = asyncHandler(async (req, res) => {
  const petId = Number(req.params.petId);
  const { deviceId, portionGrams } = req.body;
  const event = await feedingService.feedNow({ petId, deviceId, portionGrams });
  res.status(201).json({ ok: true, event });
});

const history = asyncHandler(async (req, res) => {
  const petId = Number(req.params.petId);
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const events = await feedingService.history(petId, limit);
  res.json({ ok: true, events });
});

module.exports = { feedNow, history };
