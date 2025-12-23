const eventsRepo = require("../repositories/events.repo");

async function feedNow({ petId, deviceId, portionGrams }) {
  // In a real system you might send a command to device here.
  // For lab: record event immediately.
  return eventsRepo.createEvent({
    petId,
    deviceId,
    portionGrams,
    source: "MANUAL",
    result: "SUCCESS",
  });
}

async function history(petId, limit) {
  return eventsRepo.getEventsByPet(petId, limit);
}

module.exports = { feedNow, history };

