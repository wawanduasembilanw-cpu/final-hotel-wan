import { useEffect, useState } from "react";

function App() {

  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [customerName, setCustomerName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [roomId, setRoomId] =
    useState("");

  const [checkIn, setCheckIn] =
    useState("");

  const [checkOut, setCheckOut] =
    useState("");

  const [selectedRoom, setSelectedRoom] =
    useState(null);

  /*
  =====================================
  LOAD DATA
  =====================================
  */

  useEffect(() => {

    fetchRooms();
    fetchBookings();

  }, []);

  /*
  =====================================
  FETCH ROOMS
  =====================================
  */

  const fetchRooms = async () => {

    try {

      const response = await fetch(
        "http://localhost:5000/rooms"
      );

      const data = await response.json();

      setRooms(data);

    } catch (error) {

      console.log(error);

    }

  };

  /*
  =====================================
  FETCH BOOKINGS
  =====================================
  */

  const fetchBookings = async () => {

    try {

      const response = await fetch(
        "http://localhost:5000/bookings"
      );

      const data = await response.json();

      setBookings(data);

    } catch (error) {

      console.log(error);

    }

  };

  /*
  =====================================
  ROOM AUTO
  =====================================
  */

  const handleRoomChange = (value) => {

    setRoomId(value);

    const room = rooms.find(
      (r) => r.room_id === Number(value)
    );

    setSelectedRoom(room || null);

  };

  /*
  =====================================
  ADD BOOKING
  =====================================
  */

  const addBooking = async () => {

    try {

      if (
        !customerName ||
        !email ||
        !phone ||
        !address ||
        !roomId ||
        !checkIn ||
        !checkOut
      ) {

        alert("Lengkapi semua data");

        return;

      }

      /*
      =====================================
      ADD CUSTOMER
      =====================================
      */

      const customerResponse = await fetch(
        "http://localhost:5000/customers",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            name: customerName,
            email: email,
            phone: phone,
            address: address

          })

        }
      );

      const customerData =
        await customerResponse.json();

      /*
      =====================================
      ADD BOOKING
      =====================================
      */

      const bookingResponse = await fetch(
        "http://localhost:5000/bookings",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            customer_id:
              customerData.customer_id,

            room_id: roomId,

            check_in: checkIn,

            check_out: checkOut,

            total_price:
              selectedRoom.price

          })

        }
      );

      const bookingData =
        await bookingResponse.json();

      alert(bookingData.message);

      /*
      =====================================
      RESET
      =====================================
      */

      setCustomerName("");
      setEmail("");
      setPhone("");
      setAddress("");

      setRoomId("");
      setCheckIn("");
      setCheckOut("");

      setSelectedRoom(null);

      /*
      =====================================
      REFRESH
      =====================================
      */

      fetchRooms();
      fetchBookings();

    } catch (error) {

      console.log(error);

      alert("Booking gagal");

    }

  };

  return (

    <div
      style={{
        background: "#eef2ff",
        minHeight: "100vh",
        padding: "30px",
        fontFamily: "Arial"
      }}
    >

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <h1
        style={{
          textAlign: "center",
          color: "#1d4ed8",
          fontSize: "45px",
          marginBottom: "30px"
        }}
      >
        WAN'S HOTEL
      </h1>

      {/* ================================= */}
      {/* BOOKING FORM */}
      {/* ================================= */}

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "15px",
          marginBottom: "30px",
          boxShadow:
            "0 0 10px rgba(0,0,0,0.1)"
        }}
      >

        <h2
          style={{
            marginBottom: "20px",
            color: "#2563eb"
          }}
        >
          Booking Form
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap: "15px"
          }}
        >

          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) =>
              setCustomerName(
                e.target.value
              )
            }
            style={inputStyle}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Phone"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) =>
              setAddress(
                e.target.value
              )
            }
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) =>
              handleRoomChange(
                e.target.value
              )
            }
            style={inputStyle}
          />

          <input
            type="date"
            value={checkIn}
            onChange={(e) =>
              setCheckIn(
                e.target.value
              )
            }
            style={inputStyle}
          />

          <input
            type="date"
            value={checkOut}
            onChange={(e) =>
              setCheckOut(
                e.target.value
              )
            }
            style={inputStyle}
          />

          <input
            type="text"
            readOnly
            placeholder="Room Type"
            value={
              selectedRoom
                ? selectedRoom.room_type
                : ""
            }
            style={{
              ...inputStyle,
              background: "#f3f4f6"
            }}
          />

          <input
            type="text"
            readOnly
            placeholder="Price"
            value={
              selectedRoom
                ? `Rp ${Number(
                    selectedRoom.price
                  ).toLocaleString(
                    "id-ID"
                  )}`
                : ""
            }
            style={{
              ...inputStyle,
              background: "#f3f4f6"
            }}
          />

          <input
            type="text"
            readOnly
            placeholder="Room Status"
            value={
              selectedRoom
                ? selectedRoom.status
                : ""
            }
            style={{
              ...inputStyle,
              background: "#f3f4f6"
            }}
          />

        </div>

        <button
          onClick={addBooking}
          style={{
            marginTop: "20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            padding:
              "12px 30px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Booking Now
        </button>

      </div>

      {/* ================================= */}
      {/* ROOMS */}
      {/* ================================= */}

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "15px",
          marginBottom: "30px",
          boxShadow:
            "0 0 10px rgba(0,0,0,0.1)"
        }}
      >

        <h2
          style={{
            marginBottom: "20px",
            color: "#2563eb"
          }}
        >
          Available Rooms
        </h2>

        <table style={tableStyle}>

          <thead>

            <tr>

              <th style={thtd}>ID</th>
              <th style={thtd}>
                Room Number
              </th>
              <th style={thtd}>Type</th>
              <th style={thtd}>Price</th>
              <th style={thtd}>Status</th>

            </tr>

          </thead>

          <tbody>

            {rooms.map((room) => (

              <tr key={room.room_id}>

                <td style={thtd}>
                  {room.room_id}
                </td>

                <td style={thtd}>
                  {room.room_number}
                </td>

                <td style={thtd}>
                  {room.room_type}
                </td>

                <td style={thtd}>
                  Rp{" "}
                  {Number(
                    room.price
                  ).toLocaleString(
                    "id-ID"
                  )}
                </td>

                <td
                  style={{
                    ...thtd,
                    color:
                      room.status ===
                      "Available"
                        ? "green"
                        : "red",
                    fontWeight: "bold"
                  }}
                >
                  {room.status}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* ================================= */}
      {/* BOOKINGS */}
      {/* ================================= */}

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "15px",
          boxShadow:
            "0 0 10px rgba(0,0,0,0.1)"
        }}
      >

        <h2
          style={{
            marginBottom: "20px",
            color: "#2563eb"
          }}
        >
          Booking Data
        </h2>

        <table style={tableStyle}>

          <thead>

            <tr>

              <th style={thtd}>ID</th>
              <th style={thtd}>
                Customer
              </th>
              <th style={thtd}>Room</th>
              <th style={thtd}>
                Check In
              </th>
              <th style={thtd}>
                Check Out
              </th>
              <th style={thtd}>Total</th>

            </tr>

          </thead>

          <tbody>

            {bookings.map((booking) => (

              <tr
                key={booking.booking_id}
              >

                <td style={thtd}>
                  {booking.booking_id}
                </td>

                <td style={thtd}>
                  {
                    booking.customer_name
                  }
                </td>

                <td style={thtd}>
                  {
                    booking.room_number
                  }
                </td>

                <td style={thtd}>
                  {booking.check_in}
                </td>

                <td style={thtd}>
                  {booking.check_out}
                </td>

                <td style={thtd}>
                  Rp{" "}
                  {Number(
                    booking.total_price
                  ).toLocaleString(
                    "id-ID"
                  )}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

/*
=====================================
STYLE
=====================================
*/

const inputStyle = {

  padding: "12px",

  borderRadius: "8px",

  border: "1px solid #ccc"

};

const tableStyle = {

  width: "100%",

  borderCollapse: "collapse"

};

const thtd = {

  border: "1px solid #ddd",

  padding: "12px"

};

export default App;