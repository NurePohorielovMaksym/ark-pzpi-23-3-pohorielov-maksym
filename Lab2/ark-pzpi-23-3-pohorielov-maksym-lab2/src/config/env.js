const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  DB_SERVER: z.string(),
  DB_DATABASE: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_ENCRYPT: z.string().optional().default("false"),

  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().optional().default("7d"),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = {
  ...parsed.data,
  DB_ENCRYPT: parsed.data.DB_ENCRYPT === "true",
};

module.exports = { env };
