// server.js
import { env } from "./config/env.js";
import app from "./app.js"; 
import { initDb } from "./config/db.js";
import { logger } from "./utils/logger.js";
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
async function bootstrap() {
  try {
    await initDb();
    logger.info("Database initialized successfully");

    app.listen(env.PORT, () => {
      logger.info(`API listening on http://192.168.0.180:3000`);
    });
  } catch (err) {
    logger.error("Fatal bootstrap error", err);
    process.exit(1);
  }
}

bootstrap();
