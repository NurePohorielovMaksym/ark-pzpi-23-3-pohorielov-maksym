const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const feedingPlansController = require("../controllers/feeding-plans.controller");

router.use(authMiddleware);

// створити новий план
router.post("/add", feedingPlansController.createPlan);

// отримати всі плани користувача
router.get("/", feedingPlansController.listPlans);

// отримати один план + його годування
router.get("/:planId", feedingPlansController.getPlanById);

module.exports = router;

