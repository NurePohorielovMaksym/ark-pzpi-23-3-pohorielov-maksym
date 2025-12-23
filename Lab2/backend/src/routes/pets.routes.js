const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const petsController = require("../controllers/pets.controller");

router.use(authMiddleware);

router.get("/", petsController.listMyPets);
router.post("/add", petsController.createMyPet);
router.delete("/:id", petsController.deleteMyPet);
router.post("/:petId/feeding-plan", petsController.assignFeedingPlan);
router.get("/:petId/schedules", petsController.getPetSchedules);

module.exports = router;
