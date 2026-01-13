// src/controllers/events.controller.js
import { eventsService } from "../services/feeding-event.service.js"; 
export const eventsController = {
  async create(req, res, next) {
    try {
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

