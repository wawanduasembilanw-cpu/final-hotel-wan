import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ background: "linear-gradient(135deg, #0d0d2b 0%, #1a237e 100%)", color: "rgba(255,255,255,0.8)", paddingTop: 60, paddingBottom: 30 }}>
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand */}
          <div className="col-lg-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #ff9800, #f57c00)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏨</div>
              <span className="fw-bold text-white fs-5">WAN'S HOTEL</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.6)" }}>
              Hotel bintang 4 dengan pelayanan terbaik dan fasilitas lengkap untuk kenyamanan Anda dan keluarga.
            </p>
            <div className="d-flex gap-3 mt-3">
              {["📘","📸","🐦"].map((icon, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, transition: "all 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,152,0,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                >{icon}</div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-6">
            <h6 className="text-white fw-bold mb-3" style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Navigasi</h6>
            {[["Home", "/"], ["Kamar", "/rooms"], ["Riwayat", "/history"], ["Profil", "/profile"]].map(([label, path]) => (
              <div key={label} className="mb-2">
                <Link to={path} style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#ff9800"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
                >{label}</Link>
              </div>
            ))}
          </div>

          {/* Room Types */}
          <div className="col-lg-2 col-6">
            <h6 className="text-white fw-bold mb-3" style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Kamar</h6>
            {["Standard Room", "Deluxe Room", "Family Room", "Suite Room"].map(r => (
              <div key={r} className="mb-2">
                <Link to="/rooms" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14 }}
                  onMouseEnter={e => e.target.style.color = "#ff9800"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
                >{r}</Link>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="col-lg-4">
            <h6 className="text-white fw-bold mb-3" style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>Kontak</h6>
            {[
              ["📍", "Jl. Hotel Mewah No. 1, Jakarta Selatan"],
              ["📞", "+62 21 1234 5678"],
              ["✉️", "info@wanshotel.com"],
              ["🕐", "Check-in: 14:00 | Check-out: 12:00"],
            ].map(([icon, text]) => (
              <div key={text} className="d-flex gap-2 mb-2 align-items-start">
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <hr style={{ borderColor: "rgba(255,255,255,0.1)" }} />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <p className="mb-0" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            © 2024 WAN'S HOTEL. All rights reserved.
          </p>
          <p className="mb-0" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Made with ❤️ for Hospitality
          </p>
        </div>
      </div>
    </footer>
  );
}
