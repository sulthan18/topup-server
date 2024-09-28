const express = require("express");
const { landingPage, detailPage, category } = require("./controller");
const router = express.Router();

router.get("/landingpage", landingPage);
router.get("/:id/detail", detailPage);
router.get("/category", category);

module.exports = router;
