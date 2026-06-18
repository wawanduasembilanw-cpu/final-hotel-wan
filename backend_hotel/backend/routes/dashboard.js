const express = require("express");
const router = express.Router();
const pool = require("../db");
const { isAdmin } = require("../middleware");

/*
=====================================
GET /api/dashboard/stats
Statistik ringkasan untuk dashboard Admin
=====================================
*/
router.get("/stats", isAdmin, async (req, res) => {

  try {

    const [
      totalRooms,
      availableRooms,
      bookedRooms,
      totalCustomers,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue,
      pendingPayments,
      paidPayments
    ] = await Promise.all([

      pool.query(`SELECT COUNT(*) FROM rooms`),
      pool.query(`SELECT COUNT(*) FROM rooms WHERE status = 'Available'`),
      pool.query(`SELECT COUNT(*) FROM rooms WHERE status = 'Booked'`),
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'customer'`),
      pool.query(`SELECT COUNT(*) FROM bookings`),
      pool.query(`SELECT COUNT(*) FROM bookings WHERE status = 'pending'`),
      pool.query(`SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'`),
      pool.query(
        `SELECT COALESCE(SUM(b.total_price), 0) AS total
         FROM bookings b
         JOIN payments p ON b.booking_id = p.booking_id
         WHERE p.status = 'paid'`
      ),
      pool.query(`SELECT COUNT(*) FROM payments WHERE status = 'pending'`),
      pool.query(`SELECT COUNT(*) FROM payments WHERE status = 'paid'`)

    ]);

    res.json({
      rooms: {
        total:     parseInt(totalRooms.rows[0].count),
        available: parseInt(availableRooms.rows[0].count),
        booked:    parseInt(bookedRooms.rows[0].count)
      },
      customers: {
        total: parseInt(totalCustomers.rows[0].count)
      },
      bookings: {
        total:     parseInt(totalBookings.rows[0].count),
        pending:   parseInt(pendingBookings.rows[0].count),
        confirmed: parseInt(confirmedBookings.rows[0].count)
      },
      payments: {
        pending: parseInt(pendingPayments.rows[0].count),
        paid:    parseInt(paidPayments.rows[0].count)
      },
      revenue: {
        total: parseFloat(totalRevenue.rows[0].total)
      }
    });

  } catch (error) {
    console.error("GET /dashboard/stats error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
GET /api/dashboard/transactions
Laporan transaksi lengkap (Admin)
Query params: ?from=YYYY-MM-DD&to=YYYY-MM-DD
=====================================
*/
router.get("/transactions", isAdmin, async (req, res) => {

  try {

    const { from, to } = req.query;

    let query = `
      SELECT
        b.booking_code,
        b.check_in,
        b.check_out,
        b.num_guests,
        b.total_price,
        b.status      AS booking_status,
        b.created_at,
        u.name        AS customer_name,
        u.email       AS customer_email,
        u.phone       AS customer_phone,
        r.room_number,
        r.type        AS room_type,
        r.name        AS room_name,
        p.status      AS payment_status,
        p.verified_at,
        pm.name       AS payment_method,
        pm.type       AS payment_type
      FROM bookings b
      JOIN users u  ON b.user_id  = u.user_id
      JOIN rooms r  ON b.room_id  = r.room_id
      LEFT JOIN payments p        ON b.booking_id = p.booking_id
      LEFT JOIN payment_methods pm ON p.method_id  = pm.method_id
    `;

    const params = [];

    // Filter by date range jika diberikan
    if (from && to) {
      query += ` WHERE b.created_at >= $1 AND b.created_at <= $2::date + interval '1 day'`;
      params.push(from, to);
    } else if (from) {
      query += ` WHERE b.created_at >= $1`;
      params.push(from);
    } else if (to) {
      query += ` WHERE b.created_at <= $1::date + interval '1 day'`;
      params.push(to);
    }

    query += ` ORDER BY b.created_at DESC`;

    const result = await pool.query(query, params);

    // Hitung ringkasan
    const totalTransaksi = result.rows.length;
    const totalPendapatan = result.rows
      .filter(r => r.payment_status === "paid")
      .reduce((sum, r) => sum + parseFloat(r.total_price), 0);

    res.json({
      summary: {
        total_transaksi:  totalTransaksi,
        total_pendapatan: totalPendapatan
      },
      transactions: result.rows
    });

  } catch (error) {
    console.error("GET /dashboard/transactions error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
GET /api/dashboard/rooms-status
Status semua kamar (Admin)
=====================================
*/
router.get("/rooms-status", isAdmin, async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        r.room_id,
        r.room_number,
        r.type,
        r.name,
        r.price,
        r.capacity,
        r.status,
        b.booking_code,
        b.check_in,
        b.check_out,
        u.name AS current_guest
      FROM rooms r
      LEFT JOIN bookings b
        ON r.room_id = b.room_id
        AND b.status = 'confirmed'
        AND CURRENT_DATE BETWEEN b.check_in AND b.check_out
      LEFT JOIN users u ON b.user_id = u.user_id
      ORDER BY r.room_number ASC
      `
    );

    res.json(result.rows);

  } catch (error) {
    console.error("GET /dashboard/rooms-status error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

module.exports = router;
