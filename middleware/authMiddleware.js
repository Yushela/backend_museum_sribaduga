import jwt from "jsonwebtoken";
import User from "../models/user.js";

// middleware yang mengharuskan login terlebih dahulu
export const protectedMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifikasi token

    // Cari user di database berdasarkan ID dari token
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user; // Simpan data user ke req.user
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

// middleware yang mengecek apakah user adalah system_engineer
export const internalMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    // Pastikan middleware autentikasi sudah dijalankan sebelumnya
    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    // Periksa apakah role user termasuk dalam role yang diizinkan
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        msg: "Akses ditolak",
      });
    }

    next();
  };
};


export const checkIsActive = async (req, res, next) => {
  const user = await User.findOne({ where: { username: req.body.username } });

  if (!user) {
    return res.status(404).json({ message: "user tidak ditemukan!" });
  }

  if (user.isActive !== 1) {
    return res.status(403).json({ message: "user belum aktif!" });
  }

  req.user = user;
  next();
};