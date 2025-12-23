const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const notificationsController = require("../controllers/notifications.controller");

router.use(authMiddleware);

router.get("/user", notificationsController.listUser);
router.patch("/user/:id/read", notificationsController.markUserRead);

module.exports = router;
