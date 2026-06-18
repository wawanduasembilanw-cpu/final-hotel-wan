import React from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api/api";

const facilityIcons = {
  "WiFi": "📶", "AC": "❄️", "TV": "📺", "Breakfast": "🍳",
  "Water Heater": "🚿", "Bathtub": "🛁", "Minibar": "🍷", "Balcony": "🌅",
};

const typeColors = {
  Standard: { bg: "#e3f2fd", color: "#1565c0" },
  Deluxe:   { bg: "#f3e5f5", color: "#7b1fa2" },
  Family:   { bg: "#e8f5e9", color: "#2e7d32" },
  Suite:    { bg: "#fff8e1", color: "#f57f17" },
};

const fallbackImages = {
  Standard: "/room_standard.png",
  Deluxe:   "/room_deluxe.png",
  Family:   "/room_family.png",
  Suite:    "/room_suite.png",
};

export default function RoomCard({ room }) {
  const navigate = useNavigate();
  const imgSrc = room.images && room.images.length > 0
    ? `${API_BASE}${room.images[0].image_url}`
    : fallbackImages[room.type] || "/room_standard.png";

  const typeStyle = typeColors[room.type] || typeColors.Standard;

  return (
    <div className="card h-100 border-0 overflow-hidden"
      style={{ borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", transition: "transform 0.3s, box-shadow 0.3s", cursor: "pointer" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)"; }}
      onClick={() => navigate(`/rooms/${room.room_id}`)}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
        <img src={imgSrc} alt={room.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
          onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
          onError={e => { e.target.onerror = null; e.target.src = fallbackImages[room.type] || "/room_standard.png"; }}
        />
        {/* Type Badge */}
        <span style={{ position: "absolute", top: 12, left: 12, background: typeStyle.bg, color: typeStyle.color, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
          {room.type}
        </span>
        {/* Status Badge */}
        <span style={{ position: "absolute", top: 12, right: 12, background: room.status === "Available" ? "#4caf50" : "#f44336", color: "white", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
          {room.status === "Available" ? "✓ Tersedia" : "✕ Penuh"}
        </span>
      </div>

      {/* Content */}
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h6 className="fw-bold mb-0" style={{ color: "#1a237e" }}>{room.name}</h6>
          <span style={{ fontSize: 12, color: "#666" }}>Kamar {room.room_number}</span>
        </div>

        <div className="d-flex align-items-center gap-1 mb-2" style={{ fontSize: 13, color: "#555" }}>
          <span>👥</span>
          <span>Kapasitas {room.capacity} orang</span>
        </div>

        {/* Facilities */}
        {room.facilities && room.facilities.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-2">
            {room.facilities.slice(0, 4).map(f => (
              <span key={f.facility_id} style={{ fontSize: 11, background: "#f5f5f5", borderRadius: 6, padding: "2px 8px", color: "#555" }}>
                {facilityIcons[f.name] || "✓"} {f.name}
              </span>
            ))}
            {room.facilities.length > 4 && (
              <span style={{ fontSize: 11, background: "#e8eaf6", color: "#3949ab", borderRadius: 6, padding: "2px 8px" }}>
                +{room.facilities.length - 4} lainnya
              </span>
            )}
          </div>
        )}

        <hr className="my-2" />
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div style={{ fontSize: 11, color: "#999" }}>mulai dari</div>
            <div className="fw-bold" style={{ color: "#e65100", fontSize: 16 }}>
              Rp {Number(room.price).toLocaleString("id-ID")}
              <span style={{ fontSize: 11, fontWeight: 400, color: "#999" }}>/malam</span>
            </div>
          </div>
          <button
            className="btn btn-sm px-3"
            style={{ background: "linear-gradient(135deg, #1a237e, #283593)", color: "white", borderRadius: 8, fontSize: 13, border: "none" }}
            onClick={e => { e.stopPropagation(); navigate(`/rooms/${room.room_id}`); }}
          >
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  );
}
