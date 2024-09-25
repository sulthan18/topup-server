const express = require("express");
const router = express.Router();
const { viewSignin, actionSignin } = require("./controller");

router.get("/", viewSignin);
router.post("/", actionSignin);

module.exports = router;
