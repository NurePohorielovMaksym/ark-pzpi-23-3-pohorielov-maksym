const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const schedulesController = require("../controllers/schedules.controller");
const feedingController = require("../controllers/feeding.controller");

router.use(authMiddleware);


// schedules
router.get("/pets/:petId/schedules", schedulesController.listSchedules);
router.post("/pets/:petId/schedules", schedulesController.createSchedule);

// feeding
router.post("/pets/:petId/feed-now", feedingController.feedNow);
router.get("/pets/:petId/history", feedingController.history);

router.post(
  "/feeding-plans/:planId/schedules",
  schedulesController.createScheduleForPlan
);
router.get(
  "/feeding-plans/:planId/schedules",
  schedulesController.listSchedulesForPlan
);
module.exports = router;
