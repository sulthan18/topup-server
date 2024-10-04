const mongoose = require("mongoose");
const Player = require("./model");
const Voucher = require("../voucher/model");
const Category = require("../category/model");
const Bank = require("../bank/model");
const Payment = require("../payment/model");
const Nominal = require("../nominal/model");
const Transaction = require("../transaction/model");
const path = require("path");
const fs = require("fs");
const config = require("../../config");

module.exports = {
  landingPage: async (req, res) => {
    try {
      const vouchers = await Voucher.find()
        .populate("category")
        .select("_id name status category thumbnail");

      res.status(200).json({ data: vouchers });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  },

  detailPage: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(404)
          .json({ message: "Voucher game tidak ditemukan." });
      }

      const voucher = await Voucher.findById(id)
        .populate("category")
        .populate("nominals")
        .populate("user", "_id name phoneNumber");

      if (!voucher) {
        return res
          .status(404)
          .json({ message: "Voucher game tidak ditemukan." });
      }

      res.status(200).json({ status: "success", data: voucher });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: err.message || "Internal server error",
      });
    }
  },

  category: async (req, res) => {
    try {
      const categories = await Category.find();
      res.status(200).json({ data: categories });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  },

  checkout: async (req, res) => {
    try {
      const { accountUser, name, nominal, voucher, payment, bank } = req.body;

      const res_voucher = await Voucher.findById(voucher)
        .select("name category _id thumbnail user")
        .populate("category")
        .populate("user");

      if (!res_voucher)
        return res
          .status(404)
          .json({ message: "Voucher game tidak ditemukan." });

      const res_nominal = await Nominal.findById(nominal);
      if (!res_nominal)
        return res.status(404).json({ message: "Nominal tidak ditemukan." });

      const res_payment = await Payment.findById(payment);
      if (!res_payment)
        return res.status(404).json({ message: "Payment tidak ditemukan." });

      const res_bank = await Bank.findById(bank);
      if (!res_bank)
        return res.status(404).json({ message: "Bank tidak ditemukan." });

      const tax = (10 / 100) * res_nominal.price;
      const value = res_nominal.price - tax;

      const payload = {
        historyVoucherTopup: {
          gameName: res_voucher.name,
          category: res_voucher.category ? res_voucher.category.name : "",
          thumbnail: res_voucher.thumbnail,
          coinName: res_nominal.coinName,
          coinQuantity: res_nominal.coinQuantity,
          price: res_nominal.price,
        },
        paymentHistory: {
          name: res_bank.name,
          type: res_payment.type,
          bankName: res_bank.bankName,
          noRekening: res_bank.noRekening,
        },
        name,
        accountUser,
        tax,
        value,
        player: req.player._id,
        userHistory: {
          name: res_voucher.user?.name,
          phoneNumber: res_voucher.user?.phoneNumber,
        },
        category: res_voucher.category?._id,
        user: res_voucher.user?._id,
      };

      const transaction = new Transaction(payload);
      await transaction.save();

      res.status(201).json({ data: transaction });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  },

  history: async (req, res) => {
    try {
      const { status = "" } = req.query;
      let criteria = { player: req.player._id };

      if (status.length) {
        criteria = {
          ...criteria,
          status: { $regex: `${status}`, $options: "i" },
        };
      }

      const history = await Transaction.find(criteria);
      const total = await Transaction.aggregate([
        { $match: criteria },
        { $group: { _id: null, value: { $sum: "$value" } } },
      ]);

      res
        .status(200)
        .json({ data: history, total: total.length ? total[0].value : 0 });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  },

  detailHistory: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: "History tidak ditemukan." });
      }

      const history = await Transaction.findById(id);
      if (!history) {
        return res.status(404).json({ message: "History tidak ditemukan." });
      }

      res.status(200).json({ data: history });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  },

  dashboard: async (req, res) => {
    try {
      const count = await Transaction.aggregate([
        { $match: { player: req.player._id } },
        { $group: { _id: "$category", value: { $sum: "$value" } } },
      ]);

      const categories = await Category.find({});
      const categoryMap = categories.reduce((map, category) => {
        map[category._id.toString()] = category.name;
        return map;
      }, {});

      const countWithNames = count.map((data) => ({
        ...data,
        name: categoryMap[data._id.toString()] || "Unknown",
      }));

      const history = await Transaction.find({ player: req.player._id })
        .populate("category")
        .sort({ updatedAt: -1 });

      res.status(200).json({ data: history, count: countWithNames });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  },

  profile: async (req, res) => {
    try {
      const player = {
        id: req.player.id,
        username: req.player.username,
        email: req.player.email,
        name: req.player.name,
        avatar: req.player.avatar,
        phone_number: req.player.phoneNumber,
      };
      res.status(200).json({ data: player });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  },

  editProfile: async (req, res) => {
    try {
      const { name = "", phoneNumber = "", email = "" } = req.body;
      const payload = {};

      if (name.length) payload.name = name;
      if (phoneNumber.length) payload.phoneNumber = phoneNumber;

      if (email.length) {
        const existingPlayer = await Player.findOne({
          email,
          _id: { $ne: req.player._id },
        });
        if (existingPlayer) {
          return res.status(400).json({ message: "Email sudah terdaftar." });
        }
        payload.email = email;
      }

      if (req.file) {
        const tmp_path = req.file.path;
        const originalExt = path.extname(req.file.originalname);
        const filename = `${req.file.filename}${originalExt}`;
        const target_path = path.resolve(
          config.rootPath,
          `public/uploads/${filename}`
        );

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);

        src.pipe(dest);

        src.on("end", async () => {
          let player = await Player.findById(req.player._id);
          if (player.avatar) {
            const currentImage = `${config.rootPath}/public/uploads/${player.avatar}`;
            if (fs.existsSync(currentImage)) {
              fs.unlinkSync(currentImage);
            }
          }

          payload.avatar = filename;
          player = await Player.findByIdAndUpdate(req.player._id, payload, {
            new: true,
            runValidators: true,
          });

          res.status(201).json({
            data: {
              id: player.id,
              name: player.name,
              phoneNumber: player.phoneNumber,
              avatar: player.avatar,
              email: player.email,
            },
          });
        });

        src.on("error", (err) => {
          res
            .status(500)
            .json({ message: err.message || "Internal server error" });
        });
      } else {
        const player = await Player.findByIdAndUpdate(req.player._id, payload, {
          new: true,
          runValidators: true,
        });

        res.status(201).json({
          data: {
            id: player.id,
            name: player.name,
            phoneNumber: player.phoneNumber,
            avatar: player.avatar,
            email: player.email,
          },
        });
      }
    } catch (err) {
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  },
};
