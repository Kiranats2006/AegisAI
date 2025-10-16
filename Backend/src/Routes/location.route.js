const express = require("express");
const router = express.Router();
const { getNearbyHospitals, getAllNearbyServices } = require("../Controllers/location.controller");

router.get("/nearby-hospitals", getNearbyHospitals);
router.get("/nearby-services", getAllNearbyServices);

module.exports = router;
