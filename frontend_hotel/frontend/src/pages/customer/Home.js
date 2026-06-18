import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import RoomCard from "../../components/RoomCard";
import { getRooms } from "../../api/api";
import { isLoggedIn } from "../../utils/auth";

const roomTypes = ["Semua", "Standard", "Deluxe", "Family", "Suite"];

export default function Home() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    getRooms().then(r => setRooms(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate("/rooms");
  };

  const featuredRooms = rooms.slice(0, 4);

  return (
    <div style={{ background: "#f8f9ff", minHeight: "100vh" }}>
      <Navbar />

      {/* ===== HERO BANNER ===== */}
      <section style={{ position: "relative", height: "90vh", minHeight: 560, overflow: "hidden" }}>
        <img src="/hotel_banner.png" alt="WAN'S HOTEL" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(13,13,43,0.55) 0%, rgba(13,13,43,0.75) 100%)" }} />

        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px", textAlign: "center" }}>
          <span style={{ background: "rgba(255,152,0,0.9)", color: "white", padding: "4px 20px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 20, display: "inline-block" }}>⭐ Hotel Bintang 4 Terpercaya</span>
          <h1 className="fw-bold text-white mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.2, textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
            Temukan Kenyamanan<br />di <span style={{ color: "#ff9800" }}>WAN'S HOTEL</span>
          </h1>
          <p className="text-white mb-5" style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", opacity: 0.9, maxWidth: 520 }}>
            Nikmati pengalaman menginap mewah dengan fasilitas terlengkap dan pelayanan terbaik.
          </p>

          {/* Search Bar */}
          <div style={{ background: "white", borderRadius: 20, padding: 20, maxWidth: 720, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <form onSubmit={handleSearch}>
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label fw-semibold mb-1" style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>📅 Check-in</label>
                  <input type="date" className="form-control" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)} style={{ borderRadius: 10, border: "1.5px solid #e8eaf6" }} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold mb-1" style={{ fontSize: 12, color: "#666", textTransform: "uppercase", letterSpacing: 1 }}>📅 Check-out</label>
                  <input type="date" className="form-control" min={checkIn || today} value={checkOut} onChange={e => setCheckOut(e.target.value)} style={{ borderRadius: 10, border: "1.5px solid #e8eaf6" }} />
                </div>
                <div className="col-md-4">
                  <button type="submit" className="btn w-100 fw-bold" style={{ background: "linear-gradient(135deg, #1a237e, #283593)", color: "white", borderRadius: 10, padding: "10px", border: "none", fontSize: 15 }}>
                    🔍 Cari Kamar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", animation: "bounce 2s infinite" }}>
          <div style={{ width: 28, height: 48, border: "2px solid rgba(255,255,255,0.5)", borderRadius: 14, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 6 }}>
            <div style={{ width: 4, height: 12, background: "white", borderRadius: 2, animation: "scrollDown 2s infinite" }} />
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section style={{ background: "linear-gradient(135deg, #1a237e, #283593)", padding: "30px 0" }}>
        <div className="container">
          <div className="row g-0">
            {[
              { num: "4+",   label: "Tipe Kamar" },
              { num: "100%", label: "Kepuasan Tamu" },
              { num: "24/7", label: "Layanan Aktif" },
              { num: "5⭐",  label: "Rating Hotel" },
            ].map((s, i) => (
              <div key={i} className="col-6 col-md-3 text-center py-2" style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
                <div className="fw-bold text-white" style={{ fontSize: 28 }}>{s.num}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED ROOMS ===== */}
      <section style={{ padding: "70px 0" }}>
        <div className="container">
          <div className="text-center mb-5">
            <span style={{ background: "#e8eaf6", color: "#3949ab", padding: "4px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>🛏️ PILIHAN KAMAR</span>
            <h2 className="fw-bold mt-3 mb-2" style={{ color: "#1a237e" }}>Kamar Populer Kami</h2>
            <p className="text-muted">Temukan kamar impian Anda dari berbagai pilihan eksklusif</p>
          </div>

          {loading ? (
            <div className="row g-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="col-md-6 col-lg-3">
                  <div style={{ height: 340, background: "#e8eaf6", borderRadius: 16, animation: "pulse 1.5s infinite" }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="row g-4">
              {featuredRooms.map(room => (
                <div key={room.room_id} className="col-md-6 col-lg-3">
                  <RoomCard room={room} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-5">
            <button onClick={() => navigate("/rooms")} className="btn px-5 py-2 fw-semibold"
              style={{ background: "linear-gradient(135deg, #1a237e, #283593)", color: "white", borderRadius: 12, border: "none", fontSize: 15 }}>
              Lihat Semua Kamar →
            </button>
          </div>
        </div>
      </section>

      {/* ===== WHY US ===== */}
      <section style={{ background: "linear-gradient(135deg, #fff8e1, #fff3e0)", padding: "70px 0" }}>
        <div className="container">
          <div className="text-center mb-5">
            <span style={{ background: "rgba(255,152,0,0.15)", color: "#f57c00", padding: "4px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>✨ KEUNGGULAN KAMI</span>
            <h2 className="fw-bold mt-3 mb-2" style={{ color: "#1a237e" }}>Mengapa Pilih Kami?</h2>
          </div>
          <div className="row g-4">
            {[
              { icon: "🛏️", title: "Kamar Nyaman",    desc: "Setiap kamar dirancang untuk kenyamanan maksimal dengan furnitur premium." },
              { icon: "🍽️", title: "Sarapan Gratis",   desc: "Nikmati sarapan prasmanan lengkap setiap pagi untuk tamu kami." },
              { icon: "🏊", title: "Kolam Renang",    desc: "Fasilitas kolam renang outdoor yang bersih dan terawat setiap hari." },
              { icon: "🔒", title: "Aman & Nyaman",   desc: "Sistem keamanan 24 jam dengan CCTV dan petugas keamanan terlatih." },
            ].map((f, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="text-center p-4 rounded-4 h-100" style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", transition: "transform 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-6px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{f.icon}</div>
                  <h6 className="fw-bold mb-2" style={{ color: "#1a237e" }}>{f.title}</h6>
                  <p className="text-muted mb-0" style={{ fontSize: 14 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      {!isLoggedIn() && (
        <section style={{ background: "linear-gradient(135deg, #1a237e, #283593)", padding: "70px 0", textAlign: "center" }}>
          <div className="container">
            <h2 className="fw-bold text-white mb-3">Siap Menginap Bersama Kami?</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 30 }}>Daftar sekarang dan dapatkan pengalaman menginap terbaik</p>
            <button onClick={() => navigate("/register")} className="btn px-5 py-3 fw-bold me-3"
              style={{ background: "linear-gradient(135deg, #ff9800, #f57c00)", color: "white", borderRadius: 12, border: "none", fontSize: 16 }}>
              🚀 Daftar Sekarang
            </button>
            <button onClick={() => navigate("/rooms")} className="btn px-5 py-3 fw-bold btn-outline-light" style={{ borderRadius: 12, fontSize: 16 }}>
              Lihat Kamar
            </button>
          </div>
        </section>
      )}

      <Footer />

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-10px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}
