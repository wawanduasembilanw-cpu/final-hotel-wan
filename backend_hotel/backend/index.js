const express = require("express");
const cors = require("cors");
const path = require("path");

const pool = require("./db");

// Import semua route
const authRoutes      = require("./routes/auth");
const roomRoutes      = require("./routes/rooms");
const customerRoutes  = require("./routes/customers");
const bookingRoutes   = require("./routes/bookings");
const paymentRoutes   = require("./routes/payments");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

/*
=====================================
MIDDLEWARE GLOBAL
=====================================
*/
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve folder uploads sebagai static files
// Akses foto via: http://localhost:5000/uploads/rooms/namafile.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
=====================================
ROUTES
=====================================
*/

// Auth: register & login
app.use("/api/auth", authRoutes);

// Rooms: CRUD kamar, foto, fasilitas
app.use("/api/rooms", roomRoutes);

// Customers: kelola customer & profil
app.use("/api/customers", customerRoutes);

// Bookings: buat & kelola booking
app.use("/api/bookings", bookingRoutes);

// Payments: metode, upload bukti, verifikasi
app.use("/api/payments", paymentRoutes);

// Dashboard: statistik, laporan, status kamar
app.use("/api/dashboard", dashboardRoutes);

// Serve Frontend Static Files
const frontendPath = path.join(__dirname, "../../frontend_hotel/frontend");
app.use(express.static(frontendPath));

// API Root endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "🏨 Hotel API Server berjalan!",
    version: "1.0.0",
    endpoints: {
      auth:      "/api/auth",
      rooms:     "/api/rooms",
      customers: "/api/customers",
      bookings:  "/api/bookings",
      payments:  "/api/payments",
      dashboard: "/api/dashboard"
    }
  });
});

/*
=====================================
HANDLER: Route tidak ditemukan (404)
=====================================
*/
app.use((req, res) => {
  res.status(404).json({
    message: `Endpoint '${req.method} ${req.originalUrl}' tidak ditemukan.`
  });
});

/*
=====================================
HANDLER: Error global
=====================================
*/
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    message: err.message || "Terjadi kesalahan pada server."
  });
});

/*
=====================================
JALANKAN SERVER
=====================================
*/
const PORT = 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {

    console.log(`\n🏨 Hotel API Server berjalan di http://localhost:${PORT}`);
    console.log(`📁 Static files: http://localhost:${PORT}/uploads/`);

    // Test koneksi database saat server start
    try {
      await pool.query("SELECT 1");
      console.log("✅ Database PostgreSQL terhubung!");
    } catch (err) {
      console.error("❌ Database gagal terhubung:", err.message);
      console.error("   Pastikan PostgreSQL berjalan dan schema.sql sudah dijalankan.");
    }

    console.log(`\n📋 Endpoint yang tersedia:`);
    console.log(`   POST   /api/auth/register`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/rooms`);
    console.log(`   GET    /api/rooms/:id`);
    console.log(`   POST   /api/rooms          [Admin]`);
    console.log(`   PUT    /api/rooms/:id      [Admin]`);
    console.log(`   DELETE /api/rooms/:id      [Admin]`);
    console.log(`   POST   /api/rooms/:id/images    [Admin]`);
    console.log(`   DELETE /api/rooms/:id/images/:imgId [Admin]`);
    console.log(`   GET    /api/rooms/facilities/all`);
    console.log(`   POST   /api/rooms/facilities/add  [Admin]`);
    console.log(`   DELETE /api/rooms/facilities/:id  [Admin]`);
    console.log(`   PUT    /api/rooms/:id/facilities  [Admin]`);
    console.log(`   GET    /api/customers       [Admin]`);
    console.log(`   GET    /api/customers/:id   [Admin]`);
    console.log(`   PUT    /api/customers/:id   [Admin]`);
    console.log(`   DELETE /api/customers/:id   [Admin]`);
    console.log(`   GET    /api/customers/me/profile  [Auth]`);
    console.log(`   PUT    /api/customers/me/profile  [Auth]`);
    console.log(`   POST   /api/bookings        [Auth]`);
    console.log(`   GET    /api/bookings        [Admin]`);
    console.log(`   GET    /api/bookings/my     [Auth]`);
    console.log(`   GET    /api/bookings/:id    [Auth]`);
    console.log(`   PUT    /api/bookings/:id/status   [Admin]`);
    console.log(`   GET    /api/payments/methods`);
    console.log(`   GET    /api/payments        [Admin]`);
    console.log(`   POST   /api/payments/:bookingId/upload  [Auth]`);
    console.log(`   PUT    /api/payments/:bookingId/verify  [Admin]`);
    console.log(`   GET    /api/dashboard/stats       [Admin]`);
    console.log(`   GET    /api/dashboard/transactions [Admin]`);
    console.log(`   GET    /api/dashboard/rooms-status [Admin]`);
    console.log("");

  });
}

// Export the app for Vercel Serverless
module.exports = app;