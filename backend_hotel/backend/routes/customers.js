const express = require("express");
const router = express.Router();
const pool = require("../db");
const { isAdmin, authenticateToken } = require("../middleware");

/*
=====================================
GET /api/customers
Daftar semua customer (Admin only)
=====================================
*/
router.get("/", isAdmin, async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT user_id, name, username, email, phone, address, created_at
      FROM users
      WHERE role = 'customer'
      ORDER BY created_at DESC
      `
    );

    res.json(result.rows);

  } catch (error) {
    console.error("GET /customers error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
GET /api/customers/:id
Detail satu customer (Admin only)
=====================================
*/
router.get("/:id", isAdmin, async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT user_id, name, username, email, phone, address, created_at
      FROM users
      WHERE user_id = $1 AND role = 'customer'
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer tidak ditemukan." });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("GET /customers/:id error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
PUT /api/customers/:id
Edit data customer (Admin only)
=====================================
*/
router.put("/:id", isAdmin, async (req, res) => {

  try {

    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const result = await pool.query(
      `
      UPDATE users
      SET
        name    = COALESCE($1, name),
        email   = COALESCE($2, email),
        phone   = COALESCE($3, phone),
        address = COALESCE($4, address)
      WHERE user_id = $5 AND role = 'customer'
      RETURNING user_id, name, username, email, phone, address
      `,
      [name, email, phone, address, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer tidak ditemukan." });
    }

    res.json({
      message: "Data customer berhasil diupdate.",
      customer: result.rows[0]
    });

  } catch (error) {
    console.error("PUT /customers/:id error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
DELETE /api/customers/:id
Hapus customer (Admin only)
=====================================
*/
router.delete("/:id", isAdmin, async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM users WHERE user_id = $1 AND role = 'customer' RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer tidak ditemukan." });
    }

    res.json({ message: "Customer berhasil dihapus." });

  } catch (error) {
    console.error("DELETE /customers/:id error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
GET /api/profile
Lihat profil sendiri (Customer/Admin)
=====================================
*/
router.get("/me/profile", authenticateToken, async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT user_id, name, username, email, phone, address, role, created_at
      FROM users
      WHERE user_id = $1
      `,
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error("GET /profile error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
PUT /api/profile
Edit profil sendiri (Customer/Admin)
=====================================
*/
router.put("/me/profile", authenticateToken, async (req, res) => {

  try {

    const { name, email, phone, address } = req.body;

    const result = await pool.query(
      `
      UPDATE users
      SET
        name    = COALESCE($1, name),
        email   = COALESCE($2, email),
        phone   = COALESCE($3, phone),
        address = COALESCE($4, address)
      WHERE user_id = $5
      RETURNING user_id, name, username, email, phone, address, role
      `,
      [name, email, phone, address, req.user.user_id]
    );

    res.json({
      message: "Profil berhasil diupdate.",
      user: result.rows[0]
    });

  } catch (error) {
    console.error("PUT /profile error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

module.exports = router;
