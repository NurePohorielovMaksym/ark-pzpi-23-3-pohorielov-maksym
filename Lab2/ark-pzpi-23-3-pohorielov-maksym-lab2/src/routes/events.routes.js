// src/routes/events.routes.js
const router = require("express").Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const eventsController = require("../controllers/events.controller");

router.use(authMiddleware);

router.post("/add", eventsController.create);
router.get("/pet/:petId", eventsController.getByPet);

module.exports = router;
