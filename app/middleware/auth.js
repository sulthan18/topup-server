module.exports = {
    isLoginAdmin: (req, res, next) => {
      if (!req.session.user) {
        req.flash("alertMessage", "Mohon maaf, sesi Anda telah habis. Silahkan login kembali.");
        req.flash("alertStatus", "danger");
        return res.redirect("/");
      }
      
      next();
    },
  };
  