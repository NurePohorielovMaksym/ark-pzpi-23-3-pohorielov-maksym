const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const { adminOnly } = require("../middlewares/admin.middleware");
const adminController = require("../controllers/admin.controller");

router.use(authMiddleware);
router.use(adminOnly);

router.get("/stats", adminController.getGlobalStats);
router.get("/users", adminController.listAllUsers);
router.get("/devices", adminController.monitorDevices);
router.patch("/role", adminController.updateUserRole);

module.exports = router;