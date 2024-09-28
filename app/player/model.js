const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const HASH_ROUND = 10;

const validateUniqueEmail = async function (email) {
  const emailCount = await mongoose.models.Player.countDocuments({ email });
  return !emailCount;
};

const emailAlreadyRegisteredMessage = (props) =>
  `${props.value} sudah terdaftar`;

const playerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email harus diisi"],
      unique: true,
      validate: [
        {
          validator: validateUniqueEmail,
          message: emailAlreadyRegisteredMessage,
        },
      ],
    },
    name: {
      type: String,
      required: [true, "Nama harus diisi"],
      maxlength: [225, "Panjang nama harus antara 3 - 225 karakter"],
      minlength: [3, "Panjang nama harus antara 3 - 225 karakter"],
    },
    username: {
      type: String,
      required: [true, "Username harus diisi"],
      maxlength: [225, "Panjang username harus antara 3 - 225 karakter"],
      minlength: [3, "Panjang username harus antara 3 - 225 karakter"],
    },
    password: {
      type: String,
      required: [true, "Password harus diisi"],
      maxlength: [225, "Panjang password maksimal 225 karakter"],
      minlength: [3, "Panjang password minimal 3 karakter"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["Y", "N"],
      default: "Y",
    },
    avatar: {
      type: String,
    },
    fileName: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: [true, "Nomor telepon harus diisi"],
      maxlength: [13, "Panjang nomor telepon harus antara 9 - 13 karakter"],
      minlength: [9, "Panjang nomor telepon harus antara 9 - 13 karakter"],
    },
    favorite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);

playerSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, HASH_ROUND);
  }
  next();
});

module.exports = mongoose.model("Player", playerSchema);
