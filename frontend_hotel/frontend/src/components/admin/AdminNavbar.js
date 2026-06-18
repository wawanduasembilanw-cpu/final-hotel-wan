import React from "react";
import { useLocation } from "react-router-dom";

const titles = {
  "/admin/dashboard":  "Dashboard",
  "/admin/rooms":      "Kelola Kamar",
  "/admin/facilities": "Kelola Fasilitas",
  "/admin/customers":  "Data Customer",
  "/admin/bookings":   "Data Booking",
  "/admin/payments":   "Verifikasi Pembayaran",
  "/admin/reports":    "Laporan Transaksi",
};

export default function AdminNavbar({ onMenuClick }) {
  const location = useLocation();
  const title = titles[location.pathname] || "Admin Panel";
  const now = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <header style={{
      height: 64,
      background: "white",
      borderBottom: "1px solid #e8eaf6",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div className="d-flex align-items-center gap-3">
        {/* Hamburger - mobile */}
        <button onClick={onMenuClick} className="btn btn-sm d-lg-none" style={{ background: "transparent", border: "none", fontSize: 20 }}>☰</button>
        <div>
          <h6 className="mb-0 fw-bold" style={{ color: "#1a237e", fontSize: 16 }}>{title}</h6>
          <div style={{ fontSize: 11, color: "#999" }}>{now}</div>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2">
        <span style={{ fontSize: 13, color: "#666", background: "#f5f5f5", padding: "4px 12px", borderRadius: 20 }}>🏨 WAN'S HOTEL</span>
      </div>
    </header>
  );
}
