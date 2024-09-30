const Player = require("../player/model");
const path = require("path");
const fs = require("fs").promises;
const config = require("../../config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function saveFile(file) {
  const tmp_path = file.path;
  const originalExt = file.originalname.split(".").pop();
  const filename = `${file.filename}.${originalExt}`;
  const target_path = path.resolve(
    config.rootPath,
    `public/uploads/${filename}`
  );

  try {
    await fs.copyFile(tmp_path, target_path);
    await fs.unlink(tmp_path);
    return filename;
  } catch (err) {
    throw new Error("File upload failed");
  }
}

module.exports = {
  signup: async (req, res, next) => {
    try {
      const payload = req.body;

      if (req.file) {
        const filename = await saveFile(req.file);
        payload.avatar = filename;
      }

      const player = new Player(payload);
      await player.save();
      delete player._doc.password;

      res.status(201).json({ data: player });
    } catch (err) {
      if (err.name === "ValidationError") {
        const errorMessages = Object.keys(err.errors).map((field) => {
          return `Player validation failed pada ${field}: ${err.errors[field].message}`;
        });

        return res.status(422).json({
          error: 1,
          message: errorMessages.join(", "),
          fields: err.errors,
        });
      }
      next(err);
    }
  },

  signin: (req, res, next) => {
    const { email, password } = req.body;

    Player.findOne({ email: email })
      .then((player) => {
        if (player) {
          const checkPassword = bcrypt.compareSync(password, player.password);
          if (checkPassword) {
            const token = jwt.sign(
              {
                player: {
                  id: player.id,
                  username: player.username,
                  email: player.email,
                  name: player.name,
                  phoneNumber: player.phoneNumber,
                  avatar: player.avatar,
                },
              },
              config.jwtKey
            );
            return res.status(200).json({ data: { token } });
          } else {
            return res.status(403).json({
              message: "Password yang Anda masukkan salah.",
            });
          }
        } else {
          return res.status(403).json({
            message: "Email yang Anda masukkan belum terdaftar.",
          });
        }
      })
      .catch((err) => {
        return res.status(500).json({
          message: err.message || `Internal server error`,
        });
      });
  },
};
