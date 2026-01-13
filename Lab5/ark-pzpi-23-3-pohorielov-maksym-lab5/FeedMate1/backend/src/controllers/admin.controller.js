import { query } from "../config/db.js";

export const adminController = {
  async getGlobalStats(req, res, next) {
    try {
      const r = await query(`
        SELECT
          -- Користувачі та тварини
          (SELECT COUNT(*) FROM USERS) totalUsers,
          (SELECT COUNT(*) FROM USERS u WHERE EXISTS (
            SELECT 1 FROM PETS p WHERE p.userId = u.id
          )) usersWithPets,
          (SELECT COUNT(*) FROM PETS) totalPets,

          -- Пристрої
          (SELECT COUNT(*) FROM DEVICES) totalDevices,
          (SELECT COUNT(*) FROM DEVICES WHERE lastSeenAt > DATEADD(minute, -30, GETUTCDATE())) onlineDevices,

          -- Плани годування
          (SELECT COUNT(*) FROM FEEDING_PLANS) totalPlans,
          (SELECT COUNT(*) FROM PETS WHERE feedingPlanId IS NOT NULL) petsWithActivePlans,

          -- Події годування (за весь час та 24г)
          (SELECT COUNT(*) FROM FEEDING_EVENTS) totalEvents,
          (SELECT COUNT(*) FROM FEEDING_EVENTS WHERE fedAt > DATEADD(day, -1, GETUTCDATE())) feedings24h,
          (SELECT COUNT(*) FROM FEEDING_EVENTS WHERE result = 'OK') successfulFeedings,
          (SELECT COUNT(*) FROM FEEDING_EVENTS WHERE result <> 'OK') failedFeedings,

          -- Статистика по типам корму (приклад агрегації)
          (SELECT COUNT(*) FROM FEEDING_EVENTS WHERE foodType = 'Dry') dryFoodCount,
          (SELECT COUNT(*) FROM FEEDING_EVENTS WHERE foodType = 'Wet') wetFoodCount,

          -- Останні користувачі
          (SELECT TOP 5 email, createdAt FROM USERS ORDER BY createdAt DESC FOR JSON PATH) recentUsers
      `);

      const d = r.recordset[0];

      res.json({
        ok: true,
        generatedAt: new Date().toISOString(),

        overview: {
          users: {
            total: d.totalUsers,
            withPets: d.usersWithPets,
            withoutPets: d.totalUsers - d.usersWithPets
          },
          pets: {
            total: d.totalPets,
            averagePerUser: d.totalUsers ? (d.totalPets / d.totalUsers).toFixed(1) : 0,
            withActivePlans: d.petsWithActivePlans
          }
        },

        plansAndSchedules: {
          totalPlans: d.totalPlans,
          adoptionRate: d.totalPets 
            ? ((d.petsWithActivePlans / d.totalPets) * 100).toFixed(1) + '%' 
            : '0%'
        },

        iotHealth: {
          devices: {
            total: d.totalDevices,
            onlineNow: d.onlineDevices,
            onlineRate: d.totalDevices
              ? ((d.onlineDevices / d.totalDevices) * 100).toFixed(1) + '%'
              : '0%'
          }
        },

        activity: {
          totalFeedings: d.totalEvents,
          feedingsLast24h: d.feedings24h,
          successRate: d.totalEvents 
            ? ((d.successfulFeedings / d.totalEvents) * 100).toFixed(1) + '%' 
            : '0%',
          errorsCount: d.failedFeedings,
          foodTypeDistribution: {
            dry: d.dryFoodCount,
            wet: d.wetFoodCount
          },
          recentUsers: JSON.parse(d.recentUsers || '[]')
        }
      });
    } catch (e) {
      next(e);
    }
  },

    async listAllUsers(req, res, next) {
        try {
            const users = await query("SELECT id, email, fullName, role, createdAt FROM USERS ORDER BY createdAt DESC");
            res.json(users.recordset);
        } catch (err) { next(err); }
    },

    async monitorDevices(req, res, next) {
        try {
            const devices = await query(`
                SELECT d.id, d.name, d.serial, u.email as ownerEmail, d.lastSeenAt
                FROM DEVICES d
                JOIN USERS u ON d.userId = u.id
            `);
            res.json(devices.recordset);
        } catch (err) { next(err); }
    },

    async updateUserRole(req, res, next) {
        try {
            const { userId, role } = req.body; 

            if (!userId || !role) {
                return res.status(400).json({ ok: false, error: "userId та role є обов'язковими" });
            }

            const result = await query(
                "UPDATE USERS SET role = @role WHERE id = @userId", 
                { userId, role }
            );

            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ ok: false, error: "Користувача не знайдено" });
            }

            res.json({ ok: true, message: `Роль користувача ${userId} змінено на ${role}` });
        } catch (err) { 
            next(err); 
        }
    }
};