const mongoose = require("mongoose");
const Player = require("./model");
const Voucher = require("../voucher/model");
const Category = require("../category/model");
const Bank = require("../bank/model");
const Payment = require("../payment/model");
const Nominal = require("../nominal/model");
const Transaction = require("../transaction/model");

module.exports = {
  landingPage: async (req, res) => {
    try {
      const vouchers = await Voucher.find()
        .populate("category")
        .select("_id name status category thumbnail");

      res.status(200).json({ data: vouchers });
    } catch (err) {
      res.status(500).json({
        message: err.message || "Internal server error",
      });
    }
  },

  detailPage: async (req, res) => {
    try {
      const { id } = req.params;

      // Validasi ObjectId sebelum query
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
        return res.status(404).json({
          message: "Voucher game tidak ditemukan.",
        });
      }

      res.status(200).json({
        status: "success",
        data: voucher,
      });
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
      res.status(500).json({
        message: err.message || "Internal server error",
      });
    }
  },

  checkout: async (req, res) => {
    try {
      const { accountUser, name, nominal, voucher, payment, bank } = req.body;

      const res_voucher = await Voucher.findOne({ _id: voucher })
        .select("name category _id thumbnail user")
        .populate("category")
        .populate("user");

      if (!res_voucher) {
        return res.status(404).json({
          message: "Voucher game tidak ditemukan.",
        });
      }

      const res_nominal = await Nominal.findOne({ _id: nominal });
      if (!res_nominal) {
        return res.status(404).json({ message: "Nominal tidak ditemukan." });
      }

      const res_payment = await Payment.findOne({ _id: payment });
      if (!res_payment) {
        return res.status(404).json({ message: "Payment tidak ditemukan." });
      }

      const res_bank = await Bank.findOne({ _id: bank });
      if (!res_bank) {
        return res.status(404).json({ message: "Bank tidak ditemukan." });
      }

      const tax = (10 / 100) * res_nominal._doc.price;
      const value = res_nominal._doc.price - tax;

      const payload = {
        historyVoucherTopup: {
          gameName: res_voucher._doc.name,
          category: res_voucher._doc.category
            ? res_voucher._doc.category.name
            : "",
          thumbnail: res_voucher._doc.thumbnail,
          coinName: res_nominal._doc.coinName,
          coinQuantity: res_nominal._doc.coinQuantity,
          price: res_nominal._doc.price,
        },
        paymentHistory: {
          name: res_bank._doc.name,
          type: res_payment._doc.type,
          bankName: res_bank._doc.bankName,
          noRekening: res_bank._doc.noRekening,
        },
        name: name,
        accountUser: accountUser,
        tax: tax,
        value: value,
        player: req.player._id,
        userHistory: {
          name: res_voucher._doc.user?.name,
          phoneNumber: res_voucher._doc.user?.phoneNumber,
        },
        category: res_voucher._doc.category?._id,
        user: res_voucher._doc.user?._id,
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
      let criteria = {};

      if (status.length) {
        criteria = {
          ...criteria,
          status: { $regex: `${status}`, $options: "i" },
        };
      }

      if (req.player._id) {
        criteria = {
          ...criteria,
          player: req.player._id,
        };
      }

      const history = await Transaction.find(criteria);

      let total = await Transaction.aggregate([
        { $match: criteria },
        {
          $group: {
            _id: null,
            value: { $sum: "$value" },
          },
        },
      ]);

      res.status(200).json({
        data: history,
        total: total.length ? total[0].value : 0,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message || "Internal server error",
      });
    }
  },

  detailHistory: async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !(await Transaction.findById(id))
      ) {
        return res.status(404).json({ message: "History tidak ditemukan." });
      }

      const history = await Transaction.findById(id);

      res.status(200).json({ data: history });
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  },
  dashboard: async (req, res) => {
    try {
      const count = await Transaction.aggregate([
        { $match: { player: req.player._id } },
        {
          $group: {
            _id: "$category",
            value: { $sum: "$value" },
          },
        },
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
      res.status(500).json({ message: err.message || `Internal server error` });
    }
  },
};
