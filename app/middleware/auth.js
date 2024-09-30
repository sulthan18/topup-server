const config = require("../../config");
const jwt = require("jsonwebtoken");
const Player = require("../player/model");

module.exports = {
  isLoginAdmin: (req, res, next) => {
    if (!req.session.user) {
      req.flash(
        "alertMessage",
        "Mohon maaf, sesi Anda telah habis. Silahkan login kembali."
      );
      req.flash("alertStatus", "danger");
      return res.redirect("/");
    }

    next();
  },

  isLoginPlayer: async (req, res, next) => {
    try {
      const authorizationHeader = req.headers.authorization;
      const token = authorizationHeader ? authorizationHeader.replace("Bearer ", "") : null;

      if (!token) {
        return res.status(401).json({ error: "No token provided. Access denied." });
      }

      const data = jwt.verify(token, config.jwtKey);
      const player = await Player.findOne({ _id: data.player.id });

      if (!player) {
        return res.status(401).json({ error: "Player not found. Access denied." });
      }

      req.player = player;
      req.token = token;
      next();
    } catch (err) {
      res.status(401).json({ error: "Not authorized to access this resource." });
    }
  },
};
