const express = require("express");
const { landingPage } = require("./controller");
const router = express.Router();

router.get("/landingpage", landingPage);

module.exports = router;
