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

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FeedMate API Documentation',
      version: '1.0.0',
      description: 'Документація API для системи керування розумною годівницею',
    },
    servers: [
      {
        url: 'http://localhost:3000', 
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], 
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

bootstrap();
