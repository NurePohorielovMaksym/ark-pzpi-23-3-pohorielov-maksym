// src/services/event.service.js
const eventsRepo = require("../repositories/events.repo");
const petsRepo = require("../repositories/pets.repo");

const eventsService = {
  async createEvent(userId, data) {
    // petsRepo.getByIdForUser очікує (userId, petId)
    const pet = await petsRepo.getByIdForUser(userId, data.petId);
    
    if (!pet) {
      const err = new Error("Pet not found or access denied");
      err.statusCode = 404;
      throw err;
    }

    await eventsRepo.createEvent({
      petId: data.petId,
      deviceId: data.deviceId, // Обов'язково для вашої БД
      portionGrams: data.portionGrams,
      source: data.source,
      result: data.result.toUpperCase() // Щоб уникнути конфліктів з CHECK constraint
    });
  },

  async getPetEvents(userId, petId) {
    const pet = await petsRepo.getByIdForUser(userId, petId);
    if (!pet) {
      const err = new Error("Pet not found or access denied");
      err.statusCode = 404;
      throw err;
    }
    return await eventsRepo.getEventsByPet(petId);
  }
};

module.exports = eventsService;