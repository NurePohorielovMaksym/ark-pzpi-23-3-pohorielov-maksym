// src/repositories/events.repo.js
import { query } from "../config/db.js"; 

export const eventsRepo = {
  async createEvent({ petId, deviceId, portionGrams, foodType, source, result }) {
    const r = await query(`
        INSERT INTO dbo.FEEDING_EVENTS (petId, deviceId, fedAt, portionGrams, foodType, source, result)
        OUTPUT INSERTED.id, INSERTED.petId, INSERTED.deviceId, INSERTED.portionGrams, 
               INSERTED.foodType, INSERTED.source, INSERTED.result, INSERTED.fedAt
        VALUES (@petId, @deviceId, GETUTCDATE(), @portionGrams, @foodType, @source, @result)
      `, { petId, deviceId, portionGrams, foodType, source, result });

    const event = r.recordset[0];

    // Отримуємо актуальні дані про залишок для відповіді
    const status = await query(`
        SELECT foodLevel, foodLevelPercent 
        FROM dbo.DEVICE_STATUSES WHERE deviceId = @deviceId
    `, { deviceId });

    event.foodLevel = status.recordset[0]?.foodLevel || 0;
    event.foodLevelPercent = status.recordset[0]?.foodLevelPercent || 0;
      
    return event;
  },async createEvent({ petId, deviceId, portionGrams, foodType, source, result }) {
    const r = await query(`
        INSERT INTO dbo.FEEDING_EVENTS (petId, deviceId, fedAt, portionGrams, foodType, source, result)
        OUTPUT INSERTED.id, INSERTED.petId, INSERTED.deviceId, INSERTED.portionGrams, 
               INSERTED.foodType, INSERTED.source, INSERTED.result, INSERTED.fedAt
        VALUES (@petId, @deviceId, GETUTCDATE(), @portionGrams, @foodType, @source, @result)
      `, { petId, deviceId, portionGrams, foodType, source, result });

    const event = r.recordset[0];

    // Отримуємо актуальні дані про залишок для відповіді
    const status = await query(`
        SELECT foodLevel, foodLevelPercent 
        FROM dbo.DEVICE_STATUSES WHERE deviceId = @deviceId
    `, { deviceId });

    event.foodLevel = status.recordset[0]?.foodLevel || 0;
    event.foodLevelPercent = status.recordset[0]?.foodLevelPercent || 0;
      
    return event;
  },

  async getEventsByPet(petId) {
    const r = await query(`
        SELECT *
        FROM dbo.FEEDING_EVENTS
        WHERE petId = @petId
        ORDER BY fedAt DESC 
      `, { petId });

    return r.recordset;
  }
};

