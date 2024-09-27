const express = require("express");
const { landingPage, detailPage } = require("./controller");
const router = express.Router();

router.get("/landingpage", landingPage);
router.get("/:id/detail", detailPage);

module.exports = router;
