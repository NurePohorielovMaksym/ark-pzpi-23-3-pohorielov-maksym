import { query } from "../config/db.js";

export async function findByEmail(email) {
  const r = await query("SELECT TOP 1 * FROM dbo.USERS WHERE email=@email", { email });
  return r.recordset[0] || null;
}

export async function findById(id) {
  const r = await query("SELECT TOP 1 * FROM dbo.USERS WHERE id=@id", { id });
  return r.recordset[0] || null;
}

export async function createUser({ email, passwordHash, fullName, role }) {
  const r = await query(`
    INSERT INTO dbo.USERS (email, passwordHash, fullName, role)
    OUTPUT INSERTED.*
    VALUES (@email, @passwordHash, @fullName, @role)
  `, { email, passwordHash, fullName: fullName || null, role: role || user});
  return r.recordset[0];
}

export async function updateUser(id, { fullName, passwordHash }) {
  const r = await query(`
    UPDATE dbo.USERS
    SET 
      fullName = COALESCE(@fullName, fullName),
      passwordHash = COALESCE(@passwordHash, passwordHash)
    OUTPUT INSERTED.*
    WHERE id = @id
  `, { 
    id, 
    fullName: fullName || null, 
    passwordHash: passwordHash || null 
  });
  return r.recordset[0];
}

export async function deleteUser(id) {
  const r = await query("DELETE FROM dbo.USERS WHERE id = @id", { id });
  return r.rowsAffected[0] > 0;
}
