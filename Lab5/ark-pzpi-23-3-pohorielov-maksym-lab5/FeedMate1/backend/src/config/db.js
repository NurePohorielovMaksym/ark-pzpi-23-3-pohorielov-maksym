import mssql from "mssql";  
import {env} from "./env.js"; 
import { logger } from "../utils/logger.js";  

let pool;

export async function initDb() {
  if (pool) return pool;

  try {
    pool = await mssql.connect({
      server: env.DB_SERVER,
      port: env.DB_PORT ? Number(env.DB_PORT) : 1433,
      database: env.DB_DATABASE,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      options: {
        encrypt: env.DB_ENCRYPT,
        trustServerCertificate: true, // Важливо для локальної розробки
      },
    });

    logger.info("✅ Connected to MSSQL");
    return pool;
  } catch (err) {
    logger.error("❌ Database connection failed", err);
    throw err;
  }
}

export function getDb() {
  if (!pool) {
    throw new Error("DB pool is not initialized. Call initDb() first.");
  }
  return pool;
}

export async function query(text, params = {}) {
  const request = getDb().request();
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }
  return await request.query(text);
}

