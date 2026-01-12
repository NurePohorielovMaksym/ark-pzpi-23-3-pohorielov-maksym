import { config } from "dotenv";
import { z } from "zod";

config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default("http://192.168.0.180:3000"),

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

export const env = {
  ...parsed.data,
  DB_ENCRYPT: parsed.data.DB_ENCRYPT === "true",
};


