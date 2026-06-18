const jwt = require("jsonwebtoken");

(async () => {
  try {
    // Generate token palsu tapi valid untuk tes
    const token = jwt.sign(
      { user_id: 2, username: 'budi_santoso', role: 'customer' },
      "WAN_HOTEL_SECRET",
      { expiresIn: "1d" }
    );

    // Tembak API
    const res = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        room_id: 1,
        check_in: "2026-06-25",
        check_out: "2026-06-27",
        num_guests: 2
      })
    });

    const data = await res.json();
    console.log("Status HTTP:", res.status);
    console.log("Response Body:", data);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
})();
