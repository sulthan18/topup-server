const mongoose = require("mongoose");

let transactionSchema = mongoose.Schema(
  {
    historyVoucherTopup: {
      gameName: {
        type: String,
        required: [true, "Nama game harus diisi."],
      },
      category: {
        type: String,
        required: [true, "Kategori harus diisi."],
      },
      thumbnail: {
        type: String,
      },
      coinName: {
        type: String,
        required: [true, "Nama koin harus diisi."],
      },
      coinQuantity: {
        type: String,
        required: [true, "Jumlah koin harus diisi."],
      },
      price: {
        type: Number,
      },
    },
    paymentHistory: {
      name: {
        type: String,
        required: [true, "Nama harus diisi."],
      },
      type: {
        type: String,
        required: [true, "Tipe pembayaran harus diisi."],
      },
      bankName: {
        type: String,
        required: [true, "Nama bank harus diisi."],
      },
      noRekening: {
        type: String,
        required: [true, "Nomor rekening harus diisi."],
      },
    },
    name: {
      type: String,
      required: [true, "Nama harus diisi."],
      maxlength: [225, "Panjang nama harus antara 3 - 225 karakter."],
      minlength: [3, "Panjang nama harus antara 3 - 225 karakter."],
    },
    accountUser: {
      type: String,
      required: [true, "Nama akun harus diisi."],
      maxlength: [225, "Panjang nama harus antara 3 - 225 karakter."],
      minlength: [3, "Panjang nama harus antara 3 - 225 karakter."],
    },
    tax: {
      type: Number,
      default: 0,
    },
    value: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
    userHistory: {
      name: {
        type: String,
        required: [true, "Nama player harus diisi."],
      },
      phoneNumber: {
        type: Number,
        required: [true, "Nomor telepon harus diisi."],
        maxlength: [13, "Panjang nomor telepon harus antara 9 - 13 karakter."],
        minlength: [9, "Panjang nomor telepon harus antara 9 - 13 karakter."],
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
