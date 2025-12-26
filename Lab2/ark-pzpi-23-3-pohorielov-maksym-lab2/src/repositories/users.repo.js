const { query } = require("../config/db");

async function findByEmail(email) {
  const r = await query("SELECT TOP 1 * FROM dbo.USERS WHERE email=@email", { email });
  return r.recordset[0] || null;
}

async function findById(id) {
  const r = await query("SELECT TOP 1 * FROM dbo.USERS WHERE id=@id", { id });
  return r.recordset[0] || null;
}

async function createUser({ email, passwordHash, fullName }) {
  const r = await query(`
    INSERT INTO dbo.USERS (email, passwordHash, fullName)
    OUTPUT INSERTED.*
    VALUES (@email, @passwordHash, @fullName)
  `, { email, passwordHash, fullName: fullName || null });
  return r.recordset[0];
}

module.exports = { findByEmail, findById, createUser };
