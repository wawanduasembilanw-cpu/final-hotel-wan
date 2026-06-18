const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, isAdmin } = require("../middleware");

/*
=====================================
HELPER: Generate Booking Code
Format: BK-YYYYMMDD-XXXX (random 4 digit)
=====================================
*/
const generateBookingCode = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BK-${date}-${rand}`;
};

/*
=====================================
POST /api/bookings
Buat booking baru (Customer)
Body: { room_id, check_in, check_out, num_guests, method_id }
=====================================
*/
router.post("/", authenticateToken, async (req, res) => {

  const client = await pool.connect();

  try {

    const { room_id, check_in, check_out, num_guests, method_id } = req.body;

    // Validasi field wajib
    if (!room_id || !check_in || !check_out || !num_guests) {
      return res.status(400).json({
        message: "room_id, check_in, check_out, dan num_guests wajib diisi."
      });
    }

    // Validasi tanggal
    const ci = new Date(check_in);
    const co = new Date(check_out);

    if (co <= ci) {
      return res.status(400).json({
        message: "Tanggal check-out harus setelah check-in."
      });
    }

    await client.query("BEGIN");

    // Cek apakah kamar ada dan available
    const roomResult = await client.query(
      `SELECT * FROM rooms WHERE room_id = $1 FOR UPDATE`,
      [room_id]
    );

    if (roomResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Kamar tidak ditemukan." });
    }

    const room = roomResult.rows[0];

    // Cek konflik tanggal booking yang sudah ada
    const conflict = await client.query(
      `
      SELECT booking_id FROM bookings
      WHERE room_id = $1
        AND status NOT IN ('cancelled', 'checked_out')
        AND check_in  < $3
        AND check_out > $2
      `,
      [room_id, check_in, check_out]
    );

    if (conflict.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "Kamar sudah dibooking pada tanggal tersebut. Pilih tanggal lain."
      });
    }

    // Hitung total harga
    const days = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
    const total_price = days * parseFloat(room.price);

    // Generate kode booking unik
    const booking_code = generateBookingCode();

    // Insert booking
    const bookingResult = await client.query(
      `
      INSERT INTO bookings
        (booking_code, user_id, room_id, check_in, check_out, num_guests, total_price, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *
      `,
      [booking_code, req.user.user_id, room_id, check_in, check_out, num_guests, total_price]
    );

    const booking = bookingResult.rows[0];

    // Update status kamar menjadi Booked
    await client.query(
      `UPDATE rooms SET status = 'Booked' WHERE room_id = $1`,
      [room_id]
    );

    // Buat record payment otomatis (Cash saat check in -> method_id = null)
    await client.query(
      `
      INSERT INTO payments (booking_id, method_id, status)
      VALUES ($1, NULL, 'pending')
      `,
      [booking.booking_id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Booking berhasil dibuat! Silakan lakukan pembayaran.",
      booking: {
        ...booking,
        room_name:   room.name,
        total_days:  days
      }
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("POST /bookings error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  } finally {
    client.release();
  }

});

/*
=====================================
GET /api/bookings
Semua booking (Admin only)
=====================================
*/
router.get("/", isAdmin, async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        b.booking_id,
        b.booking_code,
        b.check_in,
        b.check_out,
        b.num_guests,
        b.total_price,
        b.status,
        b.created_at,
        u.name       AS customer_name,
        u.email      AS customer_email,
        u.phone      AS customer_phone,
        r.room_number,
        r.type       AS room_type,
        r.name       AS room_name,
        p.status     AS payment_status,
        pm.name      AS payment_method
      FROM bookings b
      JOIN users u  ON b.user_id  = u.user_id
      JOIN rooms r  ON b.room_id  = r.room_id
      LEFT JOIN payments p   ON b.booking_id = p.booking_id
      LEFT JOIN payment_methods pm ON p.method_id = pm.method_id
      ORDER BY b.created_at DESC
      `
    );

    res.json(result.rows);

  } catch (error) {
    console.error("GET /bookings error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
GET /api/bookings/my
Riwayat booking milik customer sendiri
=====================================
*/
router.get("/my", authenticateToken, async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        b.booking_id,
        b.booking_code,
        b.check_in,
        b.check_out,
        b.num_guests,
        b.total_price,
        b.status,
        b.created_at,
        r.room_number,
        r.type       AS room_type,
        r.name       AS room_name,
        p.status     AS payment_status,
        p.proof_image,
        pm.name      AS payment_method
      FROM bookings b
      JOIN rooms r  ON b.room_id  = r.room_id
      LEFT JOIN payments p   ON b.booking_id = p.booking_id
      LEFT JOIN payment_methods pm ON p.method_id = pm.method_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      `,
      [req.user.user_id]
    );

    res.json(result.rows);

  } catch (error) {
    console.error("GET /bookings/my error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
GET /api/bookings/:id
Detail satu booking (Admin atau pemilik)
=====================================
*/
router.get("/:id", authenticateToken, async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        b.*,
        u.name       AS customer_name,
        u.email      AS customer_email,
        u.phone      AS customer_phone,
        r.room_number,
        r.type       AS room_type,
        r.name       AS room_name,
        r.price      AS room_price,
        p.payment_id,
        p.status     AS payment_status,
        p.proof_image,
        p.verified_at,
        pm.name      AS payment_method,
        pm.type      AS payment_type
      FROM bookings b
      JOIN users u  ON b.user_id  = u.user_id
      JOIN rooms r  ON b.room_id  = r.room_id
      LEFT JOIN payments p   ON b.booking_id = p.booking_id
      LEFT JOIN payment_methods pm ON p.method_id = pm.method_id
      WHERE b.booking_id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking tidak ditemukan." });
    }

    const booking = result.rows[0];

    // Customer hanya bisa lihat booking milik sendiri
    if (req.user.role === "customer" && booking.user_id !== req.user.user_id) {
      return res.status(403).json({ message: "Akses ditolak." });
    }

    res.json(booking);

  } catch (error) {
    console.error("GET /bookings/:id error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
PUT /api/bookings/:id/status
Ubah status booking (Admin only)
Body: { status: 'confirmed' | 'cancelled' | 'checked_out' }
=====================================
*/
router.put("/:id/status", isAdmin, async (req, res) => {

  const client = await pool.connect();

  try {

    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "confirmed", "cancelled", "checked_out"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Status tidak valid. Pilihan: ${allowed.join(", ")}`
      });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `
      UPDATE bookings
      SET status = $1
      WHERE booking_id = $2
      RETURNING *
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Booking tidak ditemukan." });
    }

    const booking = result.rows[0];

    // Jika booking dibatalkan atau checkout → cek apakah kamar bisa kembali Available
    if (status === "cancelled" || status === "checked_out") {

      const activeBookings = await client.query(
        `
        SELECT booking_id FROM bookings
        WHERE room_id = $1
          AND status NOT IN ('cancelled', 'checked_out')
          AND booking_id != $2
        `,
        [booking.room_id, id]
      );

      if (activeBookings.rows.length === 0) {
        await client.query(
          `UPDATE rooms SET status = 'Available' WHERE room_id = $1`,
          [booking.room_id]
        );
      }

    }

    await client.query("COMMIT");

    res.json({
      message: `Status booking berhasil diubah menjadi '${status}'.`,
      booking: result.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("PUT /bookings/:id/status error:", error);
    res.status(500).json({ message: "Server error." });
  } finally {
    client.release();
  }

});

module.exports = router;
