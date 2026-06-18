import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getRoomById, API_BASE } from "../../api/api";
import { isLoggedIn } from "../../utils/auth";

const facilityIcons = { "WiFi":"📶","AC":"❄️","TV":"📺","Breakfast":"🍳","Water Heater":"🚿","Bathtub":"🛁","Minibar":"🍷","Balcony":"🌅" };
const fallbackImages = { Standard:"/room_standard.png", Deluxe:"/room_deluxe.png", Family:"/room_family.png", Suite:"/room_suite.png" };
const typeColors = { Standard:"#1565c0", Deluxe:"#7b1fa2", Family:"#2e7d32", Suite:"#f57f17" };

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    getRoomById(id).then(r => setRoom(r.data)).catch(() => navigate("/rooms")).finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div className="text-center"><div className="spinner-border" style={{ color:"#1a237e" }} /><div className="mt-2 text-muted">Memuat...</div></div>
    </div>
  );
  if (!room) return null;

  const images = room.images?.length ? room.images.map(i => `${API_BASE}${i.image_url}`) : [fallbackImages[room.type]||"/room_standard.png"];
  const tc = typeColors[room.type] || "#1a237e";

  return (
    <div style={{ background:"#f8f9ff", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ background:"white", padding:"12px 0", borderBottom:"1px solid #e8eaf6", fontSize:13, color:"#888" }}>
        <div className="container">
          <span style={{ cursor:"pointer" }} onClick={() => navigate("/")}>Home</span> {" / "}
          <span style={{ cursor:"pointer" }} onClick={() => navigate("/rooms")}>Kamar</span> {" / "}
          <strong style={{ color:"#1a237e" }}>{room.name}</strong>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-5">
          <div className="col-lg-7">
            {/* Main Image */}
            <div style={{ borderRadius:20, overflow:"hidden", height:360, position:"relative", boxShadow:"0 8px 32px rgba(0,0,0,0.12)", marginBottom:12 }}>
              <img src={images[activeImg]} alt={room.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}
                onError={e => { e.target.src = fallbackImages[room.type]; }} />
              <span style={{ position:"absolute", top:16, left:16, background:tc, color:"white", padding:"4px 16px", borderRadius:20, fontSize:13, fontWeight:700 }}>{room.type}</span>
              <span style={{ position:"absolute", top:16, right:16, background:room.status==="Available"?"#4caf50":"#f44336", color:"white", padding:"4px 16px", borderRadius:20, fontSize:13 }}>
                {room.status==="Available" ? "✓ Tersedia" : "✕ Penuh"}
              </span>
            </div>
            {images.length > 1 && (
              <div className="d-flex gap-2 mb-4">
                {images.map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i)} style={{ width:100, height:70, borderRadius:10, overflow:"hidden", cursor:"pointer", border:`3px solid ${activeImg===i ? tc : "transparent"}`, transition:"all 0.2s" }}>
                    <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.target.src = fallbackImages[room.type]; }} />
                  </div>
                ))}
              </div>
            )}
            <div className="card border-0 p-4" style={{ borderRadius:16, boxShadow:"0 4px 20px rgba(0,0,0,0.06)" }}>
              <h4 className="fw-bold mb-1" style={{ color:"#1a237e" }}>{room.name}</h4>
              <p className="text-muted mb-3" style={{ fontSize:14 }}>No. Kamar: {room.room_number}</p>
              <div className="d-flex gap-2 mb-3 p-2 rounded-3" style={{ background:"#f5f7ff" }}>
                <span style={{ fontSize:22 }}>👥</span>
                <div><div className="fw-semibold" style={{ fontSize:14 }}>Kapasitas</div><div style={{ fontSize:13, color:"#666" }}>Maks. {room.capacity} orang</div></div>
              </div>
              {room.description && <p className="text-muted" style={{ fontSize:14, lineHeight:1.7 }}>{room.description}</p>}
              {room.facilities?.length > 0 && (
                <div>
                  <h6 className="fw-bold mb-3" style={{ fontSize:14 }}>Fasilitas Kamar</h6>
                  <div className="row g-2">
                    {room.facilities.map(f => (
                      <div key={f.facility_id} className="col-6 col-sm-4">
                        <div className="d-flex align-items-center gap-2 p-2 rounded-3" style={{ background:"#f5f7ff", fontSize:13 }}>
                          <span style={{ fontSize:18 }}>{facilityIcons[f.name]||"✓"}</span><span style={{ color:"#444" }}>{f.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-5">
            <div style={{ position:"sticky", top:80 }}>
              <div className="card border-0 p-4" style={{ borderRadius:20, boxShadow:"0 8px 40px rgba(26,35,126,0.12)" }}>
                <div className="text-center mb-3">
                  <div style={{ fontSize:13, color:"#999" }}>Harga per malam</div>
                  <div className="fw-bold" style={{ fontSize:32, color:"#e65100" }}>Rp {Number(room.price).toLocaleString("id-ID")}</div>
                </div>
                <hr />
                <div className="d-flex gap-2 mb-4 p-3 rounded-3" style={{ background:room.status==="Available"?"#e8f5e9":"#ffebee" }}>
                  <span style={{ fontSize:20 }}>{room.status==="Available"?"✅":"❌"}</span>
                  <div>
                    <div className="fw-semibold" style={{ fontSize:14, color:room.status==="Available"?"#2e7d32":"#c62828" }}>
                      {room.status==="Available" ? "Kamar Tersedia" : "Tidak Tersedia"}
                    </div>
                    <div style={{ fontSize:12, color:"#888" }}>{room.status==="Available" ? "Siap dibooking" : "Sedang dipesan"}</div>
                  </div>
                </div>
                <div className="mb-4">
                  {["✓ Handuk & perlengkapan mandi","✓ Air mineral setiap hari","✓ Wi-Fi gratis","✓ Pembersihan harian"].map(i => (
                    <div key={i} style={{ fontSize:13, color:"#555", marginBottom:4 }}>{i}</div>
                  ))}
                </div>
                <button onClick={() => { if(!isLoggedIn()){navigate("/login");return;} navigate(`/booking/${room.room_id}`); }}
                  disabled={room.status!=="Available"} className="btn w-100 fw-bold py-3"
                  style={{ background:room.status==="Available"?"linear-gradient(135deg,#1a237e,#283593)":"#ccc", color:"white", border:"none", borderRadius:12, fontSize:16 }}>
                  {room.status==="Available" ? "🛒 Booking Sekarang" : "❌ Tidak Tersedia"}
                </button>
                {!isLoggedIn() && <p className="text-center mt-2 mb-0" style={{ fontSize:12, color:"#888" }}>Perlu <span style={{ color:"#1a237e", cursor:"pointer" }} onClick={() => navigate("/login")}>login</span> untuk booking</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
