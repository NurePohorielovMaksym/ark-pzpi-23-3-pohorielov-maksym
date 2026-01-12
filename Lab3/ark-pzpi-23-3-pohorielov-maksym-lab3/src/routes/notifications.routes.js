// src/routes/notifications.routes.js
import express from "express";
const router = express.Router();
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { list, markRead } from "../controllers/notifications.controller.js";

router.use(authMiddleware);

router.get("/user", list);
router.patch("/user/:id/read", markRead);

export default router;
