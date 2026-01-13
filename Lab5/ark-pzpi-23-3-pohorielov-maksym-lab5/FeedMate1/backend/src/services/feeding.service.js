import { eventsRepo } from "../repositories/feeding-events.repo.js";
import * as petsRepo from "../repositories/pets.repo.js";
import * as devicesRepo from "../repositories/devices.repo.js";
import { query } from "../config/db.js"; 
import { checkLowFoodLevel } from "./devices.service.js";


export async function feedNow(userId, { petId, deviceId, portionGrams, foodType, source }) {
  if (!portionGrams || portionGrams < 1) {
    throw new Error("Порція повинна бути не менше 1 грама");
  }

  const device = await devicesRepo.getById(deviceId);
  if (!device) {
    throw new Error("Пристрій не знайдено");
  }

  if (userId) {
    if (device.userId !== userId) {
      throw new Error("Пристрій вам не належить");
    }
    const pet = await petsRepo.getByIdForUser(userId, petId);
    if (!pet) throw new Error("Тварину не знайдено або вона вам не належить");
  } else {
    // Якщо це IoT (userId == null), ми довіряємо, що deviceId правильний,
    // але про всяк випадок можна перевірити, чи існує petId (опціонально)
    // Тут ми просто пропускаємо перевірку "device.userId === userId"
  }

  const statusRes = await query(
    `SELECT foodLevel FROM dbo.DEVICE_STATUSES WHERE deviceId = @deviceId`,
    { deviceId }
  );
  const currentFood = statusRes.recordset[0]?.foodLevel || 0;

  if (portionGrams > device.capacity) {
    throw new Error(`Помилка: пристрій вміщує максимум ${device.capacity}г`);
  }

  if (portionGrams > currentFood) {
    throw new Error(`Недостатньо корму: залишилось ${currentFood}г`);
  }

  await query(`
    UPDATE dbo.DEVICE_STATUSES 
    SET 
        foodLevel = foodLevel - @portion,
        foodLevelPercent = ((foodLevel - @portion) * 100) / @cap,
        reportedAt = SYSDATETIME()
    WHERE deviceId = @deviceId;
  `, { 
    portion: portionGrams, 
    deviceId: deviceId,
    cap: device.capacity 
  });

  const finalSource = source || (userId ? "MANUAL_APP" : "MANUAL_BUTTON");
  const event = await eventsRepo.createEvent({
    petId,
    deviceId,
    portionGrams,
    source: finalSource, 
    result: "OK",
    foodType
  });


  let warning = null;
  
  if (userId) {
      warning = await checkLowFoodLevel(deviceId, userId);
  } else {
      warning = await checkLowFoodLevel(deviceId, device.userId); 
  }

  if (warning) {
    event.warning = warning;
  }

  return event;
}

export async function history(petId, limit = 50) {
  return await eventsRepo.getEventsByPet(petId); 
}