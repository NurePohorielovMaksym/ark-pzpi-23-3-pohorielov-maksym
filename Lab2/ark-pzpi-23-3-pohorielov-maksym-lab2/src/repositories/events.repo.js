// src/repositories/events.repo.js
const { query, sql } = require("../config/db.js"); // Використовуємо стабільний query

const eventsRepo = {
  async createEvent({ petId, deviceId, portionGrams, source, result }) {
    // Використовуємо синтаксис, як у pets.repo.js
    return await query(`
        INSERT INTO dbo.FEEDING_EVENTS (petId, deviceId, portionGrams, source, result)
        VALUES (@petId, @deviceId, @portionGrams, @source, @result)
      `, { 
        petId, 
        deviceId: deviceId,
        portionGrams, 
        source, 
        result 
      });
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

module.exports = eventsRepo;

