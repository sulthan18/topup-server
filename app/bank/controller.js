const Bank = require("./model");

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };
      const bank = await Bank.find()

      res.render("admin/bank/view_bank", {
        bank,
        alert,
      });
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/bank");
    }
  },
  viewCreate: async (req, res) => {
    try {
      res.render("admin/bank/create");
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/bank");
    }
  },
  actionCreate: async (req, res) => {
    try {
      const { name, nameBank, noRekening } = req.body;

      let bank = await Bank({ name, nameBank, noRekening });
      await bank.save();

      req.flash("alertMessage", "Berhasil tambah bank");
      req.flash("alertStatus", "success");

      res.redirect("/bank");
    } catch (err) {
      req.flash("alertMessage", `${err.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/bank");
    }
  },
};

//   actionEdit: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { name, category, nominals } = req.body;

//       if (req.file) {
//         let tmp_path = req.file.path;
//         let originalExt =
//           req.file.originalname.split(".")[
//             req.file.originalname.split(".").length - 1
//           ];
//         let filename = req.file.filename + "." + originalExt;
//         let target_path = path.resolve(
//           config.rootPath,
//           `public/uploads/${filename}`
//         );

//         const src = fs.createReadStream(tmp_path);
//         const dest = fs.createWriteStream(target_path);

//         src.pipe(dest);

//         src.on("end", async () => {
//           try {
//             const voucher = await Voucher.findOne({ _id: id });

//             let currentImage = `${config.rootPath}/public/uploads/${voucher.thumbnail}`;
//             if (fs.existsSync(currentImage)) {
//               fs.unlinkSync(currentImage);
//             }
//             await Voucher.findOneAndUpdate(
//               {
//                 _id: id,
//               },
//               {
//                 name,
//                 category,
//                 nominals,
//                 thumbnail: filename,
//               }
//             );
//             req.flash("alertMessage", "Berhasil ubah voucher");
//             req.flash("alertStatus", "success");
//             res.redirect("/voucher");
//           } catch (err) {
//             req.flash("alertMessage", `${err.message}`);
//             req.flash("alertStatus", "danger");
//             res.redirect("/voucher");
//           }
//         });
//       } else {
//         await Voucher.findOneAndUpdate(
//           {
//             _id: id,
//           },
//           {
//             name,
//             category,
//             nominals,
//           }
//         );
//         req.flash("alertMessage", "Berhasil ubah voucher");
//         req.flash("alertStatus", "success");
//         res.redirect("/voucher");
//       }
//     } catch (err) {
//       req.flash("alertMessage", `${err.message}`);
//       req.flash("alertStatus", "danger");
//       res.redirect("/nominal");
//     }
//   },
//   actionDelete: async (req, res) => {
//     try {
//       const { id } = req.params;
//       const voucher = await Voucher.findOneAndDelete({
//         _id: id,
//       });

//       let currentImage = `${config.rootPath}/public/uploads/${voucher.thumbnail}`;
//       if (fs.existsSync(currentImage)) {
//         fs.unlinkSync(currentImage);
//       }

//       req.flash("alertMessage", "Berhasil hapus voucher");
//       req.flash("alertStatus", "success");

//       res.redirect("/voucher");
//     } catch (err) {
//       req.flash("alertMessage", `${err.message}`);
//       req.flash("alertStatus", "danger");
//       res.redirect("/voucher");
//     }
//   },
//   actionStatus: async (req, res) => {
//     try {
//       const { id } = req.params;

//       let voucher = await Voucher.findOne({ _id: id });
//       let status = voucher.status === "Y" ? "N" : "Y";

//       voucher = await Voucher.findOneAndUpdate(
//         {
//           _id: id,
//         },
//         { status }
//       );

//       req.flash("alertMessage", "Berhasil ubah status");
//       req.flash("alertStatus", "success");
//       res.redirect("/voucher");
//     } catch (err) {
//       req.flash("alertMessage", `${err.message}`);
//       req.flash("alertStatus", "danger");
//       res.redirect("/voucher");
//     }
//   },
