import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout, getUser } from "../../utils/auth";

const menuItems = [
  { path: "/admin/dashboard",   icon: "📊", label: "Dashboard" },
  { path: "/admin/rooms",       icon: "🛏️",  label: "Kelola Kamar" },
  { path: "/admin/facilities",  icon: "✨",  label: "Fasilitas" },
  { path: "/admin/customers",   icon: "👥",  label: "Customer" },
  { path: "/admin/bookings",    icon: "📅",  label: "Booking" },
  { path: "/admin/payments",    icon: "💳",  label: "Pembayaran" },
  { path: "/admin/reports",     icon: "📈",  label: "Laporan" },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1040, display: "none" }} className="d-lg-none" />
      )}

      <div style={{
        width: 260,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0d0d2b 0%, #1a237e 100%)",
        position: "fixed",
        top: 0,
        left: isOpen ? 0 : -260,
        zIndex: 1045,
        transition: "left 0.3s ease",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 20px rgba(0,0,0,0.3)",
      }} className="d-lg-flex flex-column" id="adminSidebar">

        {/* Header */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #ff9800, #f57c00)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏨</div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: 14 }}>WAN'S HOTEL</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Admin Panel</div>
            </div>
          </div>
          {/* Admin Profile */}
          <div className="d-flex align-items-center gap-2 p-2 rounded-3" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #ff9800, #f57c00)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white", fontSize: 14 }}>
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <div className="text-white fw-semibold" style={{ fontSize: 13 }}>{user?.name || "Admin"}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Administrator</div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, paddingLeft: 8 }}>Menu Utama</div>
          {menuItems.map(({ path, icon, label }) => (
            <NavLink key={path} to={path}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10, marginBottom: 4,
                textDecoration: "none", fontSize: 14, fontWeight: 500,
                color: isActive ? "white" : "rgba(255,255,255,0.65)",
                background: isActive ? "linear-gradient(135deg, rgba(255,152,0,0.25), rgba(255,152,0,0.1))" : "transparent",
                borderLeft: isActive ? "3px solid #ff9800" : "3px solid transparent",
                transition: "all 0.2s",
              })}
              onMouseEnter={e => { if (!e.currentTarget.style.borderLeft.includes("ff9800")) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "white"; }}}
              onMouseLeave={e => { if (!e.currentTarget.style.borderLeft.includes("ff9800")) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}}
            >
              <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <button onClick={handleLogout} className="btn w-100 d-flex align-items-center gap-2"
            style={{ background: "rgba(244,67,54,0.15)", color: "#ef5350", border: "1px solid rgba(244,67,54,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 500 }}>
            <span>🚪</span> Keluar
          </button>
        </div>
      </div>
    </>
  );
}
