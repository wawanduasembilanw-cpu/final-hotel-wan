const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { SECRET_KEY } = require("../middleware");

/*
=====================================
POST /api/auth/register
Customer mendaftar akun sendiri
=====================================
*/
router.post("/register", async (req, res) => {

  try {

    const { name, username, email, password, phone, address } = req.body;

    // Validasi field wajib
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "Nama, username, email, dan password wajib diisi."
      });
    }

    // Cek username sudah dipakai
    const cekUsername = await pool.query(
      `SELECT user_id FROM users WHERE username = $1`,
      [username]
    );

    if (cekUsername.rows.length > 0) {
      return res.status(409).json({
        message: "Username sudah digunakan. Pilih username lain."
      });
    }

    // Cek email sudah dipakai
    const cekEmail = await pool.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [email]
    );

    if (cekEmail.rows.length > 0) {
      return res.status(409).json({
        message: "Email sudah terdaftar."
      });
    }

    // Hash password dengan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru (role default: customer)
    const result = await pool.query(
      `
      INSERT INTO users (name, username, email, password, phone, address, role)
      VALUES ($1, $2, $3, $4, $5, $6, 'customer')
      RETURNING user_id, name, username, email, phone, address, role, created_at
      `,
      [name, username, email, hashedPassword, phone || null, address || null]
    );

    res.status(201).json({
      message: "Registrasi berhasil! Silakan login.",
      user: result.rows[0]
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
POST /api/auth/login
Login untuk admin dan customer
=====================================
*/
router.post("/login", async (req, res) => {

  try {

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username dan password wajib diisi."
      });
    }

    // Cari user berdasarkan username
    const result = await pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Username tidak ditemukan."
      });
    }

    const user = result.rows[0];

    // Verifikasi password dengan bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Password salah."
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id:  user.user_id,
        username: user.username,
        role:     user.role
      },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login berhasil!",
      token: token,
      user: {
        user_id:  user.user_id,
        name:     user.name,
        username: user.username,
        email:    user.email,
        role:     user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
GET /api/auth/force-reset
Endpoint sementara untuk memperbaiki password admin di database online
=====================================
*/
router.get("/force-reset", async (req, res) => {
  try {
    const hash = await bcrypt.hash("admin123", 10);
    await pool.query(
      `UPDATE users SET password = $1 WHERE username = 'admin'`,
      [hash]
    );
    res.json({ message: "Password admin berhasil direset menjadi admin123" });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({ message: "Gagal mereset password admin." });
  }
});

module.exports = router;
