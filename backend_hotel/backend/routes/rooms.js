const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, isAdmin } = require("../middleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/*
=====================================
KONFIGURASI MULTER — Upload Foto Kamar
Disimpan di folder: uploads/rooms/
=====================================
*/
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/rooms");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `room_${req.params.id}_${Date.now()}${ext}`);
  }

});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error("Hanya file gambar yang diizinkan (jpg, png, webp)."));
  }
});

/*
=====================================
GET /api/rooms
Daftar semua kamar (public)
Termasuk foto dan fasilitas
=====================================
*/
router.get("/", async (req, res) => {

  try {

    const rooms = await pool.query(
      `SELECT * FROM rooms ORDER BY room_id ASC`
    );

    // Ambil foto dan fasilitas untuk setiap kamar
    const result = await Promise.all(

      rooms.rows.map(async (room) => {

        const images = await pool.query(
          `SELECT * FROM room_images WHERE room_id = $1 ORDER BY image_id ASC`,
          [room.room_id]
        );

        const facilities = await pool.query(
          `
          SELECT f.facility_id, f.name
          FROM facilities f
          JOIN room_facilities rf ON f.facility_id = rf.facility_id
          WHERE rf.room_id = $1
          ORDER BY f.name ASC
          `,
          [room.room_id]
        );

        return {
          ...room,
          images:     images.rows,
          facilities: facilities.rows
        };

      })

    );

    res.json(result);

  } catch (error) {
    console.error("GET /rooms error:", error);
    res.status(500).json({ message: "Server error: " + error.message, stack: error.stack });
  }

});

/*
=====================================
GET /api/rooms/:id
Detail satu kamar (public)
=====================================
*/
router.get("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const room = await pool.query(
      `SELECT * FROM rooms WHERE room_id = $1`,
      [id]
    );

    if (room.rows.length === 0) {
      return res.status(404).json({ message: "Kamar tidak ditemukan." });
    }

    const images = await pool.query(
      `SELECT * FROM room_images WHERE room_id = $1 ORDER BY image_id ASC`,
      [id]
    );

    const facilities = await pool.query(
      `
      SELECT f.facility_id, f.name
      FROM facilities f
      JOIN room_facilities rf ON f.facility_id = rf.facility_id
      WHERE rf.room_id = $1
      ORDER BY f.name ASC
      `,
      [id]
    );

    res.json({
      ...room.rows[0],
      images:     images.rows,
      facilities: facilities.rows
    });

  } catch (error) {
    console.error("GET /rooms/:id error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
POST /api/rooms
Tambah kamar baru (Admin only)
=====================================
*/
router.post("/", isAdmin, async (req, res) => {

  try {

    const { room_number, type, name, description, price, capacity } = req.body;

    if (!room_number || !type || !name || !price) {
      return res.status(400).json({
        message: "Nomor kamar, tipe, nama, dan harga wajib diisi."
      });
    }

    const result = await pool.query(
      `
      INSERT INTO rooms (room_number, type, name, description, price, capacity)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [room_number, type, name, description || null, price, capacity || 2]
    );

    res.status(201).json({
      message: "Kamar berhasil ditambahkan.",
      room: result.rows[0]
    });

  } catch (error) {
    console.error("POST /rooms error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Nomor kamar sudah ada." });
    }
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
PUT /api/rooms/:id
Edit kamar (Admin only)
=====================================
*/
router.put("/:id", isAdmin, async (req, res) => {

  try {

    const { id } = req.params;
    const { room_number, type, name, description, price, capacity, status } = req.body;

    const result = await pool.query(
      `
      UPDATE rooms
      SET
        room_number = COALESCE($1, room_number),
        type        = COALESCE($2, type),
        name        = COALESCE($3, name),
        description = COALESCE($4, description),
        price       = COALESCE($5, price),
        capacity    = COALESCE($6, capacity),
        status      = COALESCE($7, status)
      WHERE room_id = $8
      RETURNING *
      `,
      [room_number, type, name, description, price, capacity, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Kamar tidak ditemukan." });
    }

    res.json({
      message: "Kamar berhasil diupdate.",
      room: result.rows[0]
    });

  } catch (error) {
    console.error("PUT /rooms/:id error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
DELETE /api/rooms/:id
Hapus kamar (Admin only)
=====================================
*/
router.delete("/:id", isAdmin, async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM rooms WHERE room_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Kamar tidak ditemukan." });
    }

    res.json({ message: "Kamar berhasil dihapus." });

  } catch (error) {
    console.error("DELETE /rooms/:id error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
POST /api/rooms/:id/images
Upload foto kamar (Admin only, max 2 foto)
=====================================
*/
router.post("/:id/images", isAdmin, upload.single("image"), async (req, res) => {

  try {

    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "File gambar wajib diupload." });
    }

    // Cek jumlah foto yang sudah ada
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM room_images WHERE room_id = $1`,
      [id]
    );

    const count = parseInt(countResult.rows[0].count);

    if (count >= 2) {
      // Hapus file yang baru saja diupload karena sudah melebihi batas
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: "Kamar sudah memiliki 2 foto. Hapus salah satu foto terlebih dahulu."
      });
    }

    const imageUrl = `/uploads/rooms/${req.file.filename}`;

    const result = await pool.query(
      `
      INSERT INTO room_images (room_id, image_url)
      VALUES ($1, $2)
      RETURNING *
      `,
      [id, imageUrl]
    );

    res.status(201).json({
      message: "Foto kamar berhasil diupload.",
      image: result.rows[0]
    });

  } catch (error) {
    console.error("POST /rooms/:id/images error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
DELETE /api/rooms/:id/images/:imgId
Hapus foto kamar (Admin only)
=====================================
*/
router.delete("/:id/images/:imgId", isAdmin, async (req, res) => {

  try {

    const { imgId } = req.params;

    const result = await pool.query(
      `DELETE FROM room_images WHERE image_id = $1 RETURNING *`,
      [imgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Foto tidak ditemukan." });
    }

    // Hapus file fisik dari server
    const filePath = path.join(__dirname, "..", result.rows[0].image_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: "Foto berhasil dihapus." });

  } catch (error) {
    console.error("DELETE /rooms/:id/images/:imgId error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
GET /api/facilities
Daftar semua fasilitas (public)
=====================================
*/
router.get("/facilities/all", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT * FROM facilities ORDER BY name ASC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error("GET /facilities error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
POST /api/facilities
Tambah fasilitas baru (Admin only)
=====================================
*/
router.post("/facilities/add", isAdmin, async (req, res) => {

  try {

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Nama fasilitas wajib diisi." });
    }

    const result = await pool.query(
      `INSERT INTO facilities (name) VALUES ($1) RETURNING *`,
      [name]
    );

    res.status(201).json({
      message: "Fasilitas berhasil ditambahkan.",
      facility: result.rows[0]
    });

  } catch (error) {
    console.error("POST /facilities error:", error);
    if (error.code === "23505") {
      return res.status(409).json({ message: "Fasilitas sudah ada." });
    }
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
DELETE /api/facilities/:facilityId
Hapus fasilitas (Admin only)
=====================================
*/
router.delete("/facilities/:facilityId", isAdmin, async (req, res) => {

  try {

    const { facilityId } = req.params;

    const result = await pool.query(
      `DELETE FROM facilities WHERE facility_id = $1 RETURNING *`,
      [facilityId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Fasilitas tidak ditemukan." });
    }

    res.json({ message: "Fasilitas berhasil dihapus." });

  } catch (error) {
    console.error("DELETE /facilities/:id error:", error);
    res.status(500).json({ message: "Server error." });
  }

});

/*
=====================================
PUT /api/rooms/:id/facilities
Set fasilitas untuk kamar (Admin only)
Body: { facility_ids: [1, 2, 3] }
=====================================
*/
router.put("/:id/facilities", isAdmin, async (req, res) => {

  const client = await pool.connect();

  try {

    const { id } = req.params;
    const { facility_ids } = req.body;

    await client.query("BEGIN");

    // Hapus semua fasilitas kamar ini dulu
    await client.query(
      `DELETE FROM room_facilities WHERE room_id = $1`,
      [id]
    );

    // Insert fasilitas baru
    if (facility_ids && facility_ids.length > 0) {
      for (const fid of facility_ids) {
        await client.query(
          `INSERT INTO room_facilities (room_id, facility_id) VALUES ($1, $2)`,
          [id, fid]
        );
      }
    }

    await client.query("COMMIT");

    res.json({ message: "Fasilitas kamar berhasil diupdate." });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("PUT /rooms/:id/facilities error:", error);
    res.status(500).json({ message: "Server error." });
  } finally {
    client.release();
  }

});

module.exports = router;
