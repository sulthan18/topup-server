const Player = require("./model");
const Voucher = require("../voucher/model");
const Category = require("../category/model");

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
      const category = await Category.find();
      res.status(200).json({ data: category });
    } catch (err) {
      res.status(500).json({ message: err.message || `Internal server error` });
    }
  },
};
