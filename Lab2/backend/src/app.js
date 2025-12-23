const express = require("express");
const cors = require("cors");

const { env } = require("./config/env");
const { errorMiddleware } = require("./middlewares/error.middleware");

const authRoutes = require("./routes/auth.routes");
const petsRoutes = require("./routes/pets.routes");
const schedulesRoutes = require("./routes/schedules.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const iotRoutes = require("./routes/iot.routes");
const feedingPlansRoutes = require("./routes/feeding-plans.routes");
const devicesRoutes = require("./routes/devices.routes");
const eventRoutes = require("./routes/events.routes")
const adminRoutes = require("./routes/admin.routes")
const app = express();

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/pets", petsRoutes);
app.use("/api", schedulesRoutes);         
app.use("/api/notifications", notificationsRoutes);
app.use("/api/iot", iotRoutes);
app.use("/api/feeding-plans", feedingPlansRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes)
app.use(errorMiddleware);

module.exports = app;
