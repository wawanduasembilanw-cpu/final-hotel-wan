import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import RoomCard from "../../components/RoomCard";
import { getRooms } from "../../api/api";

const TYPES = ["Semua", "Standard", "Deluxe", "Family", "Suite"];

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState("default");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getRooms().then(r => setRooms(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = rooms
    .filter(r => filter === "Semua" || r.type === filter)
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "price_asc")  return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return a.room_id - b.room_id;
    });

  const available = rooms.filter(r => r.status === "Available").length;

  return (
    <div style={{ background: "#f8f9ff", minHeight: "100vh" }}>
      <Navbar />

      {/* Page Header */}
      <div style={{ background: "linear-gradient(135deg, #1a237e, #283593)", padding: "50px 0 60px" }}>
        <div className="container text-center text-white">
          <h1 className="fw-bold mb-2" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>Daftar Kamar Hotel</h1>
          <p style={{ opacity: 0.85, fontSize: 16 }}>
            {available} kamar tersedia dari {rooms.length} kamar total
          </p>
          {/* Search */}
          <div className="mx-auto mt-4" style={{ maxWidth: 440 }}>
            <div className="input-group">
              <span className="input-group-text" style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", borderRight: 0, color: "white" }}>🔍</span>
              <input type="text" className="form-control" placeholder="Cari kamar..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.3)", borderLeft: 0, color: "white", "::placeholder": { color: "rgba(255,255,255,0.6)" } }} />
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: -24, paddingBottom: 60 }}>
        {/* Filter Card */}
        <div className="card border-0 mb-4 p-3" style={{ borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
          <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between">
            {/* Type Filter */}
            <div className="d-flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  className="btn btn-sm px-3"
                  style={{
                    borderRadius: 20, fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                    background: filter === t ? "linear-gradient(135deg, #1a237e, #283593)" : "#f0f0f0",
                    color: filter === t ? "white" : "#555",
                    border: "none",
                  }}>
                  {t === "Semua" ? "🏨 Semua" : t === "Standard" ? "🛏️ Standard" : t === "Deluxe" ? "✨ Deluxe" : t === "Family" ? "👨‍👩‍👧 Family" : "👑 Suite"}
                </button>
              ))}
            </div>
            {/* Sort */}
            <select className="form-select form-select-sm" value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ width: "auto", borderRadius: 10, border: "1.5px solid #e8eaf6", fontSize: 13 }}>
              <option value="default">Urutan Default</option>
              <option value="price_asc">Harga: Terendah</option>
              <option value="price_desc">Harga: Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mb-0" style={{ fontSize: 14, color: "#666" }}>
            Menampilkan <strong>{filtered.length}</strong> kamar
            {filter !== "Semua" && <> — Tipe: <strong>{filter}</strong></>}
          </p>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="row g-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="col-md-6 col-lg-4">
                <div style={{ height: 340, background: "#e8eaf6", borderRadius: 16, animation: "pulse 1.5s infinite" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
            <h5 className="text-muted">Tidak ada kamar yang sesuai</h5>
            <p className="text-muted" style={{ fontSize: 14 }}>Coba ubah filter atau kata kunci pencarian</p>
            <button className="btn btn-outline-primary" onClick={() => { setFilter("Semua"); setSearch(""); }}>Reset Filter</button>
          </div>
        ) : (
          <div className="row g-4">
            {filtered.map(room => (
              <div key={room.room_id} className="col-md-6 col-lg-4">
                <RoomCard room={room} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}
