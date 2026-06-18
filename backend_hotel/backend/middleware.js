const jwt = require("jsonwebtoken");

const SECRET_KEY = "WAN_HOTEL_SECRET";

/*
=====================================
MIDDLEWARE: Verifikasi JWT Token
=====================================
*/
const authenticateToken = (req, res, next) => {

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token tidak ada. Silakan login terlebih dahulu."
    });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {

    if (err) {
      return res.status(403).json({
        message: "Token tidak valid atau sudah expired."
      });
    }

    req.user = user;
    next();

  });

};

/*
=====================================
MIDDLEWARE: Hanya Admin
=====================================
*/
const isAdmin = (req, res, next) => {

  authenticateToken(req, res, () => {

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Akses ditolak. Hanya admin yang boleh mengakses."
      });
    }

    next();

  });

};

/*
=====================================
MIDDLEWARE: Hanya Customer
=====================================
*/
const isCustomer = (req, res, next) => {

  authenticateToken(req, res, () => {

    if (req.user.role !== "customer") {
      return res.status(403).json({
        message: "Akses ditolak. Hanya customer yang boleh mengakses."
      });
    }

    next();

  });

};

module.exports = {
  authenticateToken,
  isAdmin,
  isCustomer,
  SECRET_KEY
};