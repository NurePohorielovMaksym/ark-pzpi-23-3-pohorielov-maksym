import { query } from "../config/db.js";

export async function create(userId, name, description) {
  const r = await query(
    `
    INSERT INTO dbo.FEEDING_PLANS (userId, name, description)
    OUTPUT INSERTED.*
    VALUES (@userId, @name, @description)
    `,
    { userId, name, description }
  );
  return r.recordset[0];
}

export async function listByUser(userId) {
  const r = await query(
    "SELECT * FROM dbo.FEEDING_PLANS WHERE userId=@userId ORDER BY createdAt DESC",
    { userId }
  );
  return r.recordset;
}

export async function getById(userId, planId) {
  const r = await query(
    `
    SELECT * FROM dbo.FEEDING_PLANS
    WHERE id=@planId AND userId=@userId
    `,
    { planId, 
      userId }
  );
  return r.recordset[0];
}

export async function getByIdForUser(userId, planId) {
  const r = await query(`
    SELECT *
    FROM dbo.FEEDING_PLANS
    WHERE id = @planId AND userId = @userId
  `, { planId, userId });

  return r.recordset[0] || null;
}