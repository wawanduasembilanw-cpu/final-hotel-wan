(async () => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Testing User",
        username: "testuser" + Math.floor(Math.random()*1000),
        email: "testuser" + Math.floor(Math.random()*1000) + "@gmail.com",
        password: "password123",
        phone: "08123456789",
        address: "Jl. Testing"
      })
    });

    const data = await res.text();
    console.log("Status HTTP:", res.status);
    console.log("Response Body:", data);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
})();
