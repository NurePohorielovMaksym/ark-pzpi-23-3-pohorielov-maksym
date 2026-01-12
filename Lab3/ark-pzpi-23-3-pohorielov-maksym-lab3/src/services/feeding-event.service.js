import { eventsRepo } from "../repositories/feeding-events.repo.js"; 
import * as petsRepo from "../repositories/pets.repo.js";    
import { query } from "../config/db.js"; 

export const eventsService = {
 async createEvent(userId, data) {
    const pet = await petsRepo.getByIdForUser(userId, data.petId);
    if (!pet) throw new Error("Access denied");

    if (data.deviceId) {
      await query(`
        IF EXISTS (SELECT 1 FROM dbo.DEVICE_STATUSES WHERE deviceId = @deviceId)
        BEGIN
            UPDATE dbo.DEVICE_STATUSES 
            SET foodLevel = CASE 
                WHEN foodLevel - @portion < 0 THEN 0 
                ELSE foodLevel - @portion 
            END,
            reportedAt = GETUTCDATE()
            WHERE deviceId = @deviceId
        END
        ELSE
        BEGIN
            INSERT INTO dbo.DEVICE_STATUSES (deviceId, foodLevel, reportedAt, status)
            SELECT id, capacity - @portion, GETUTCDATE(), 'OK'
            FROM dbo.DEVICES WHERE id = @deviceId
        END
      `, { portion: data.portionGrams, deviceId: data.deviceId });
    }

    return await eventsRepo.createEvent({
      petId: data.petId,
      deviceId: data.deviceId,
      portionGrams: data.portionGrams,
      foodType: data.foodType || "Dry",
      source: data.source,
      result: data.result ? data.result.toUpperCase() : "OK" 
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
  },

  async logFeeding({ petId, deviceId, portionGrams, source, foodType }) {
  return await eventsRepo.createEvent({
    petId,
    deviceId,
    portionGrams,
    source: source || "AUTOM", 
    result: "OK",
    foodType: foodType || "Dry"
  });
}
};


