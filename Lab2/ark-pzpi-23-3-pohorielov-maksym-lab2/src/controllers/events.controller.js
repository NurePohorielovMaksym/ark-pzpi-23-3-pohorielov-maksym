// src/controllers/events.controller.js
const eventsService = require("../services/event.service");

const eventsController = {
  async create(req, res, next) {
  try {
    // Змінюємо передачу аргументів: спочатку userId, потім дані події
    await eventsService.createEvent(req.user.id, req.body); 
    res.status(201).json({ message: "Feeding event created" });
  } catch (err) {
    next(err);
  }
  },

  async getByPet(req, res, next) {
    try {
      const events = await eventsService.getPetEvents(
        req.user.id,
        req.params.petId
      );
      res.json(events);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = eventsController;
