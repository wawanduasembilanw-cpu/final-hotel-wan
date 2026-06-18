import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUser, logout, isLoggedIn } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path ? "nav-link active fw-semibold" : "nav-link";

  return (
    <nav className="navbar navbar-expand-lg sticky-top" style={{ background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)", boxShadow: "0 2px 20px rgba(26,35,126,0.4)" }}>
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #ff9800, #f57c00)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏨</div>
          <span className="fw-bold text-white fs-5">WAN'S HOTEL</span>
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
          <span className="navbar-toggler-icon" style={{ filter: "invert(1)" }}></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav mx-auto gap-1">
            <li className="nav-item">
              <Link className={isActive("/")} style={{ color: "rgba(255,255,255,0.85)", borderRadius: 8, padding: "8px 16px" }} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={isActive("/rooms")} style={{ color: "rgba(255,255,255,0.85)", borderRadius: 8, padding: "8px 16px" }} to="/rooms">Kamar</Link>
            </li>
            {isLoggedIn() && (
              <li className="nav-item">
                <Link className={isActive("/history")} style={{ color: "rgba(255,255,255,0.85)", borderRadius: 8, padding: "8px 16px" }} to="/history">Riwayat</Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {isLoggedIn() ? (
              <>
                <Link to="/profile" className="d-flex align-items-center gap-2 text-decoration-none">
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #ff9800, #f57c00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: "bold", color: "white" }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white fw-semibold d-none d-lg-inline" style={{ fontSize: 14 }}>{user?.name}</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-sm btn-outline-light rounded-pill px-3">Keluar</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-outline-light rounded-pill px-3">Masuk</Link>
                <Link to="/register" className="btn btn-sm px-3 rounded-pill" style={{ background: "linear-gradient(135deg, #ff9800, #f57c00)", color: "white", border: "none" }}>Daftar</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
