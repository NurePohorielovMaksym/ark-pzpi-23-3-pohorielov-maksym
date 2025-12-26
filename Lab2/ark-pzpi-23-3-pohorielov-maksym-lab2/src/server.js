const { env } = require("./config/env");
const app = require("./app");
const { initDb } = require("./config/db");
const { logger } = require("./utils/logger");

async function bootstrap() {
  await initDb();

  app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  logger.error("Fatal bootstrap error", err);
  process.exit(1);
});

