const { query } = require("../config/db");

const adminController = {
    // 1. Глобальна статистика системи
    async getGlobalStats(req, res, next) {
        try {
            const stats = await query(`
                SELECT 
                    (SELECT COUNT(*) FROM USERS) as totalUsers,
                    (SELECT COUNT(*) FROM DEVICES) as totalDevices,
                    (SELECT COUNT(*) FROM PETS) as totalPets,
                    (SELECT COUNT(*) FROM FEEDING_EVENTS) as totalFeedings
            `);
            res.json(stats.recordset[0]);
        } catch (err) { next(err); }
    },

    // 2. Список усіх користувачів (для керування)
    async listAllUsers(req, res, next) {
        try {
            const users = await query("SELECT id, email, fullName, role, createdAt FROM USERS ORDER BY createdAt DESC");
            res.json(users.recordset);
        } catch (err) { next(err); }
    },

    // 3. Моніторинг усіх пристроїв (хто онлайн/офлайн)
    async monitorDevices(req, res, next) {
        try {
            const devices = await query(`
                SELECT d.id, d.name, d.serialNumber, u.email as ownerEmail, d.lastSeenAt
                FROM DEVICES d
                JOIN USERS u ON d.userId = u.id
            `);
            res.json(devices.recordset);
        } catch (err) { next(err); }
    },

    // 4. Зміна ролі користувача (наприклад, призначити іншого адміна)
    async updateUserRole(req, res, next) {
        try {
            const { userId, newRole } = req.body;
            await query("UPDATE USERS SET role = @newRole WHERE id = @userId", { userId, newRole });
            res.json({ message: `Роль користувача ${userId} змінено на ${newRole}` });
        } catch (err) { next(err); }
    }
};

module.exports = adminController;