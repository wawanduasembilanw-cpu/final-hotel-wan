const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, isAdmin } = require("../middleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/*
=====================================
KONFIGURASI MULTER — Upload Bukti Bayar
Disimpan di folder: uploads/payments/
=====================================
*/
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/payments");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `payment_${req.params.bookingId}_${Date.now()}${ext}`);
  }

});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error("Hanya file gambar atau PDF yang diizinkan."));
  }
});

/*
=====================================
GET /api/payment-methods
Daftar metode pembayaran (public)
=====================================
*/
router.get("/methods", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT * FROM payment_methods ORDER BY type ASC, name ASC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error("GET /payment-methods error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
GET /api/payments
Semua data pembayaran (Admin only)
=====================================
*/
router.get("/", isAdmin, async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        p.payment_id,
        p.status     AS payment_status,
        p.proof_image,
        p.verified_at,
        p.created_at,
        b.booking_code,
        b.check_in,
        b.check_out,
        b.total_price,
        u.name       AS customer_name,
        u.email      AS customer_email,
        r.name       AS room_name,
        r.room_number,
        pm.name      AS payment_method,
        pm.type      AS payment_type,
        vr.name      AS verified_by_name
      FROM payments p
      JOIN bookings b       ON p.booking_id  = b.booking_id
      JOIN users u          ON b.user_id     = u.user_id
      JOIN rooms r          ON b.room_id     = r.room_id
      LEFT JOIN payment_methods pm ON p.method_id   = pm.method_id
      LEFT JOIN users vr    ON p.verified_by = vr.user_id
      ORDER BY p.created_at DESC
      `
    );

    res.json(result.rows);

  } catch (error) {
    console.error("GET /payments error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
POST /api/payments/:bookingId/upload
Customer upload bukti pembayaran
Form-data: { proof: <file>, method_id: <number> }
=====================================
*/
/*
=====================================
POST /api/payments/:bookingId/upload
Catatan: Karena metode pembayaran adalah Cash saat check in,
upload bukti bersifat OPSIONAL.
=====================================
*/
router.post(
  "/:bookingId/upload",
  authenticateToken,
  upload.single("proof"),
  async (req, res) => {

    try {

      const { bookingId } = req.params;

      // Pastikan booking milik user ini (atau admin)
      const bookingCheck = await pool.query(
        `SELECT * FROM bookings WHERE booking_id = $1`,
        [bookingId]
      );

      if (bookingCheck.rows.length === 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: "Booking tidak ditemukan." });
      }

      if (
        req.user.role !== "admin" &&
        bookingCheck.rows[0].user_id !== req.user.user_id
      ) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(403).json({ message: "Akses ditolak." });
      }

      // method_id default ke 1 (Cash saat check in)
      const proofUrl = req.file ? `/uploads/payments/${req.file.filename}` : null;

      const result = await pool.query(
        `
        UPDATE payments
        SET
          proof_image = COALESCE($1, proof_image),
          method_id   = 1
        WHERE booking_id = $2
        RETURNING *
        `,
        [proofUrl, bookingId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Data pembayaran tidak ditemukan." });
      }

      res.json({
        message: "Data pembayaran berhasil diperbarui. Pembayaran dilakukan saat check in.",
        payment: result.rows[0]
      });

    } catch (error) {
      console.error("POST /payments/:bookingId/upload error:", error);
      res.status(500).json({ message: "Server error." });
    }

  }
);

/*
=====================================
PUT /api/payments/:bookingId/verify
Admin verifikasi pembayaran → status: Paid
=====================================
*/
router.put("/:bookingId/verify", isAdmin, async (req, res) => {

  const client = await pool.connect();

  try {

    const { bookingId } = req.params;

    await client.query("BEGIN");

    // Cek payment ada
    const payCheck = await client.query(
      `SELECT * FROM payments WHERE booking_id = $1`,
      [bookingId]
    );

    if (payCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Data pembayaran tidak ditemukan." });
    }

    // Karena Cash saat check in, tidak perlu cek bukti upload
    // Admin langsung bisa verifikasi saat tamu tiba

    // Update status payment → paid
    const result = await client.query(
      `
      UPDATE payments
      SET
        status      = 'paid',
        verified_at = NOW(),
        verified_by = $1
      WHERE booking_id = $2
      RETURNING *
      `,
      [req.user.user_id, bookingId]
    );

    // Update status booking → confirmed
    await client.query(
      `UPDATE bookings SET status = 'confirmed' WHERE booking_id = $1`,
      [bookingId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Pembayaran berhasil diverifikasi. Status booking menjadi Confirmed.",
      payment: result.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("PUT /payments/:bookingId/verify error:", error);
    res.status(500).json({ message: "Server error." });
  } finally {
    client.release();
  }

});

module.exports = router;
