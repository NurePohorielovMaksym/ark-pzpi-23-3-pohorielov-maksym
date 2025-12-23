// src/routes/devices.routes.js
const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const devicesController = require("../controllers/devices.controller");

router.use(authMiddleware);

router.get("/", devicesController.listMyDevices);
router.post("/add", devicesController.createMyDevice);
router.delete("/:id", devicesController.deleteMyDevice);

module.exports = router;
