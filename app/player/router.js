const express = require("express");
const {
  landingPage,
  detailPage,
  category,
  checkout,
  history,
  detailHistory,
} = require("./controller");
const { isLoginPlayer } = require("../middleware/auth");
const router = express.Router();

router.get("/landingpage", landingPage);
router.get("/:id/detail", detailPage);
router.get("/category", category);
router.post("/checkout", isLoginPlayer, checkout);
router.get("/history", isLoginPlayer, history);
router.get("/history/:id/detail", isLoginPlayer, detailHistory);

module.exports = router;
