const pool = require('./db');

(async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const room_id = 1;
    const check_in = "2026-06-25";
    const check_out = "2026-06-27";
    const num_guests = 2;
    const user_id = 2; // Budi Santoso

    // Hitung harga
    const roomResult = await client.query(`SELECT * FROM rooms WHERE room_id = $1`, [room_id]);
    const room = roomResult.rows[0];
    const ci = new Date(check_in);
    const co = new Date(check_out);
    const days = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
    const total_price = days * parseFloat(room.price);
    
    // Generate kode
    const booking_code = `BK-20260625-${Math.floor(1000 + Math.random() * 9000)}`;

    console.log("Mencoba insert booking...");
    const bookingResult = await client.query(
      `
      INSERT INTO bookings
        (booking_code, user_id, room_id, check_in, check_out, num_guests, total_price, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *
      `,
      [booking_code, user_id, room_id, check_in, check_out, num_guests, total_price]
    );
    const booking = bookingResult.rows[0];
    console.log("Booking terbuat dengan ID:", booking.booking_id);

    console.log("Update status kamar...");
    await client.query(
      `UPDATE rooms SET status = 'Booked' WHERE room_id = $1`,
      [room_id]
    );

    console.log("Insert payments (dengan method_id = NULL)...");
    await client.query(
      `
      INSERT INTO payments (booking_id, method_id, status)
      VALUES ($1, NULL, 'pending')
      `,
      [booking.booking_id]
    );
    
    await client.query("ROLLBACK"); // Batalkan test agar tidak mengotori DB
    console.log("✅ TEST BERHASIL! Tidak ada error di SQL.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.log("❌ ERROR DITEMUKAN:");
    console.log(error);
  } finally {
    client.release();
    process.exit();
  }
})();
