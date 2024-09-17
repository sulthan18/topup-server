const mongoose = require("mongoose");
const { urlDb } = require("../config");

mongoose.connect(urlDb, {});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

module.exports = db;
