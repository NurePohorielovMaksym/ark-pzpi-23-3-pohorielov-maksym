const sql = require("mssql");
const { env } = require("./env");
const { logger } = require("../utils/logger");

let pool;

/**
 * Initialize MSSQL connection pool.
 * Repositories will reuse this pool.
 */
async function initDb() {
  if (pool) return pool;

  pool = await sql.connect({
    server: env.DB_SERVER,
    database: env.DB_DATABASE,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    options: {
      encrypt: env.DB_ENCRYPT,
      trustServerCertificate: true,
    },
  });

  logger.info("✅ Connected to MSSQL");
  return pool;
}

function getDb() {
  if (!pool) {
    throw new Error("DB pool is not initialized. Call initDb() first.");
  }
  return pool;
}

/**
 * Helper for parametrized queries.
 * usage: await query("SELECT * FROM USERS WHERE id=@id", { id: 1 })
 */
async function query(text, params = {}) {
  const request = getDb().request();
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }
  const result = await request.query(text);
  return result;
}

module.exports = { initDb, getDb, query };
