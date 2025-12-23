const router = require("express").Router();
const iotController = require("../controllers/iot.controller");

// For lab: no auth; in real use apiKey header and validate device
router.post("/status", iotController.reportStatus);

module.exports = router;
