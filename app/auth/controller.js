const Player = require("../player/model");
const path = require("path");
const fs = require("fs").promises;
const config = require("../../config");

async function saveFile(file) {
  const tmp_path = file.path;
  const originalExt = file.originalname.split(".").pop();
  const filename = `${file.filename}.${originalExt}`;
  const target_path = path.resolve(config.rootPath, `public/uploads/${filename}`);

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
};
