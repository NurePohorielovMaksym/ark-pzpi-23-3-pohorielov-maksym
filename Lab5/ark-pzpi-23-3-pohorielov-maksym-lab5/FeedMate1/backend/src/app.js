// app.js
import express, { json } from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import petsRoutes from "./routes/pets.routes.js";
import schedulesRoutes from "./routes/schedules.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import feedingPlansRoutes from "./routes/feeding-plans.routes.js";
import devicesRoutes from "./routes/devices.routes.js";
import eventRoutes from "./routes/feeding-events.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";

const app = express();

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));
app.use(json());

app.get("/health", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/pets", petsRoutes);
app.use("/api/schedules", schedulesRoutes);         
app.use("/api/notifications", notificationsRoutes);
app.use("/api/feeding-plans", feedingPlansRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/feeding-events", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorMiddleware);

export default app;