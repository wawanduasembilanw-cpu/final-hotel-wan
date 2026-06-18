import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getRoomById, getPaymentMethods, createBooking, uploadPaymentProof, API_BASE } from "../../api/api";

const fallbackImages = { Standard:"/room_standard.png", Deluxe:"/room_deluxe.png", Family:"/room_family.png", Suite:"/room_suite.png" };

export default function Booking() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [methods, setMethods] = useState([]);
  const [step, setStep] = useState(1); // 1=form, 2=payment, 3=success
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [form, setForm] = useState({ check_in:"", check_out:"", num_guests:1, method_id:"" });
  const today = new Date().toISOString().slice(0,10);

  useEffect(() => {
    Promise.all([getRoomById(roomId), getPaymentMethods()])
      .then(([r, m]) => { setRoom(r.data); setMethods(m.data); })
      .catch(() => navigate("/rooms"))
      .finally(() => setLoading(false));
  }, [roomId, navigate]);

  const totalDays = () => {
    if (!form.check_in || !form.check_out) return 0;
    const d = (new Date(form.check_out) - new Date(form.check_in)) / 86400000;
    return d > 0 ? d : 0;
  };
  const totalPrice = () => room ? totalDays() * Number(room.price) : 0;

  const handleBooking = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.method_id) { setError("Pilih metode pembayaran."); return; }
    if (totalDays() <= 0) { setError("Tanggal check-out harus setelah check-in."); return; }
    setSubmitting(true);
    try {
      const res = await createBooking({ room_id: Number(roomId), ...form, method_id: Number(form.method_id) });
      setBooking(res.data.booking);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Booking gagal.");
    } finally { setSubmitting(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!proofFile) { setError("Upload bukti pembayaran terlebih dahulu."); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("proof", proofFile);
      fd.append("method_id", form.method_id);
      await uploadPaymentProof(booking.booking_id, fd);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Upload gagal.");
    } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}><div className="spinner-border" style={{ color:"#1a237e" }} /></div>;

  const eWallets = methods.filter(m => m.type === "ewallet");
  const banks = methods.filter(m => m.type === "bank");
  const selectedMethod = methods.find(m => m.method_id === Number(form.method_id));
  const imgSrc = room?.images?.length ? `${API_BASE}${room.images[0].image_url}` : fallbackImages[room?.type];

  return (
    <div style={{ background:"#f8f9ff", minHeight:"100vh" }}>
      <Navbar />

      {/* Steps */}
      <div style={{ background:"white", borderBottom:"1px solid #e8eaf6", padding:"20px 0" }}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-center gap-0">
            {[["1","Detail Booking"],["2","Pembayaran"],["3","Selesai"]].map(([s, label], i) => (
              <React.Fragment key={s}>
                <div className="text-center">
                  <div style={{ width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 6px", fontWeight:"bold", fontSize:14,
                    background: step >= Number(s) ? "linear-gradient(135deg,#1a237e,#283593)" : "#e0e0e0",
                    color: step >= Number(s) ? "white" : "#999" }}>{s}</div>
                  <div style={{ fontSize:12, color: step >= Number(s) ? "#1a237e":"#999", fontWeight: step === Number(s) ? 600:400 }}>{label}</div>
                </div>
                {i < 2 && <div style={{ flex:1, height:2, background: step > Number(s) ? "#1a237e":"#e0e0e0", margin:"0 8px", marginBottom:22 }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4 justify-content-center">
          <div className="col-lg-7">

            {/* STEP 1: Booking Form */}
            {step === 1 && (
              <div className="card border-0 p-4" style={{ borderRadius:20, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
                <h5 className="fw-bold mb-4" style={{ color:"#1a237e" }}>📋 Detail Booking</h5>
                {error && <div className="alert alert-danger py-2" style={{ fontSize:13, borderRadius:10 }}>⚠️ {error}</div>}
                <form onSubmit={handleBooking}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize:13 }}>📅 Check-in *</label>
                      <input type="date" className="form-control" min={today} value={form.check_in}
                        onChange={e => setForm({...form, check_in:e.target.value})} required style={{ borderRadius:10, border:"1.5px solid #e8eaf6" }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize:13 }}>📅 Check-out *</label>
                      <input type="date" className="form-control" min={form.check_in||today} value={form.check_out}
                        onChange={e => setForm({...form, check_out:e.target.value})} required style={{ borderRadius:10, border:"1.5px solid #e8eaf6" }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize:13 }}>👥 Jumlah Tamu *</label>
                      <input type="number" className="form-control" min={1} max={room?.capacity||10} value={form.num_guests}
                        onChange={e => setForm({...form, num_guests:Number(e.target.value)})} required style={{ borderRadius:10, border:"1.5px solid #e8eaf6" }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize:13 }}>⏱️ Durasi Menginap</label>
                      <input type="text" className="form-control" readOnly value={totalDays() > 0 ? `${totalDays()} malam` : "-"} style={{ borderRadius:10, background:"#f5f7ff", border:"1.5px solid #e8eaf6" }} />
                    </div>

                    {/* Payment Method */}
                    <div className="col-12 mt-2">
                      <label className="form-label fw-semibold" style={{ fontSize:13 }}>💳 Metode Pembayaran *</label>
                      {eWallets.length > 0 && (
                        <div className="mb-3">
                          <div style={{ fontSize:12, color:"#888", marginBottom:8, fontWeight:600 }}>E-WALLET</div>
                          <div className="d-flex flex-wrap gap-2">
                            {eWallets.map(m => (
                              <label key={m.method_id} style={{ cursor:"pointer" }}>
                                <input type="radio" name="method" value={m.method_id} checked={Number(form.method_id)===m.method_id} onChange={() => setForm({...form,method_id:String(m.method_id)})} className="d-none" />
                                <div style={{ padding:"8px 20px", borderRadius:10, border:`2px solid ${Number(form.method_id)===m.method_id?"#1a237e":"#e0e0e0"}`, background:Number(form.method_id)===m.method_id?"#e8eaf6":"white", fontSize:14, fontWeight:600, color:Number(form.method_id)===m.method_id?"#1a237e":"#555", transition:"all 0.2s" }}>
                                  {m.name === "Dana" ? "💙" : m.name === "OVO" ? "💜" : m.name === "GoPay" ? "💚" : m.name === "ShopeePay" ? "🧡" : "📱"} {m.name}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      {banks.length > 0 && (
                        <div>
                          <div style={{ fontSize:12, color:"#888", marginBottom:8, fontWeight:600 }}>TRANSFER BANK</div>
                          <div className="d-flex flex-wrap gap-2">
                            {banks.map(m => (
                              <label key={m.method_id} style={{ cursor:"pointer" }}>
                                <input type="radio" name="method" value={m.method_id} checked={Number(form.method_id)===m.method_id} onChange={() => setForm({...form,method_id:String(m.method_id)})} className="d-none" />
                                <div style={{ padding:"8px 20px", borderRadius:10, border:`2px solid ${Number(form.method_id)===m.method_id?"#1a237e":"#e0e0e0"}`, background:Number(form.method_id)===m.method_id?"#e8eaf6":"white", fontSize:14, fontWeight:600, color:Number(form.method_id)===m.method_id?"#1a237e":"#555", transition:"all 0.2s" }}>
                                  🏦 {m.name}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className="btn w-100 fw-bold py-3 mt-4"
                    style={{ background:"linear-gradient(135deg,#1a237e,#283593)", color:"white", border:"none", borderRadius:12, fontSize:15 }}>
                    {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Memproses...</> : "Lanjutkan ke Pembayaran →"}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: Upload Bukti */}
            {step === 2 && (
              <div className="card border-0 p-4" style={{ borderRadius:20, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
                <h5 className="fw-bold mb-2" style={{ color:"#1a237e" }}>💳 Upload Bukti Pembayaran</h5>
                <div className="alert alert-info py-2 mb-4" style={{ fontSize:13, borderRadius:10 }}>
                  <strong>Kode Booking: {booking?.booking_code}</strong><br/>
                  Silakan transfer dan upload bukti pembayaran Anda.
                </div>
                <div className="p-3 mb-3 rounded-3" style={{ background:"#f5f7ff", border:"1px dashed #c5cae9" }}>
                  <div style={{ fontSize:13, color:"#555" }}>💳 Metode: <strong>{selectedMethod?.name}</strong></div>
                  <div style={{ fontSize:13, color:"#555" }}>💰 Total: <strong style={{ color:"#e65100" }}>Rp {totalPrice().toLocaleString("id-ID")}</strong></div>
                  {selectedMethod?.type === "bank" && <div style={{ fontSize:13, color:"#555", marginTop:4 }}>📋 No. Rekening: <strong>1234-5678-9012</strong> a.n. WAN'S HOTEL</div>}
                  {selectedMethod?.name === "QRIS" && <div style={{ fontSize:40, textAlign:"center", marginTop:8 }}>▦</div>}
                </div>
                {error && <div className="alert alert-danger py-2" style={{ fontSize:13, borderRadius:10 }}>⚠️ {error}</div>}
                <form onSubmit={handleUpload}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ fontSize:13 }}>📸 Bukti Pembayaran *</label>
                    <div style={{ border:"2px dashed #c5cae9", borderRadius:12, padding:24, textAlign:"center", cursor:"pointer", background:"#f9f9ff" }}
                      onClick={() => document.getElementById("proofInput").click()}>
                      {proofFile ? (
                        <div>
                          <div style={{ fontSize:32 }}>✅</div>
                          <div style={{ fontSize:13, color:"#555" }}>{proofFile.name}</div>
                          <div style={{ fontSize:12, color:"#888" }}>Klik untuk ganti</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize:40 }}>📎</div>
                          <div style={{ fontSize:14, color:"#888" }}>Klik untuk upload foto bukti bayar</div>
                          <div style={{ fontSize:12, color:"#aaa" }}>JPG, PNG, PDF — maks 5MB</div>
                        </div>
                      )}
                    </div>
                    <input id="proofInput" type="file" accept="image/*,.pdf" className="d-none" onChange={e => setProofFile(e.target.files[0])} />
                  </div>
                  <button type="submit" disabled={submitting} className="btn w-100 fw-bold py-3"
                    style={{ background:"linear-gradient(135deg,#ff9800,#f57c00)", color:"white", border:"none", borderRadius:12, fontSize:15 }}>
                    {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Mengupload...</> : "📤 Kirim Bukti Pembayaran"}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3: Success */}
            {step === 3 && (
              <div className="card border-0 p-5 text-center" style={{ borderRadius:20, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
                <div style={{ fontSize:72 }}>🎉</div>
                <h4 className="fw-bold mt-3 mb-2" style={{ color:"#1a237e" }}>Booking Berhasil!</h4>
                <p className="text-muted mb-1">Kode Booking: <strong style={{ color:"#1a237e" }}>{booking?.booking_code}</strong></p>
                <p className="text-muted" style={{ fontSize:14 }}>Bukti pembayaran Anda sudah dikirim. Admin akan memverifikasi dalam 1x24 jam.</p>
                <div className="d-flex gap-3 justify-content-center mt-4">
                  <button onClick={() => navigate("/history")} className="btn px-4 fw-semibold" style={{ background:"linear-gradient(135deg,#1a237e,#283593)", color:"white", borderRadius:10, border:"none" }}>Lihat Riwayat</button>
                  <button onClick={() => navigate("/")} className="btn btn-outline-secondary px-4 fw-semibold" style={{ borderRadius:10 }}>Kembali ke Home</button>
                </div>
              </div>
            )}
          </div>

          {/* Room Summary */}
          {room && step < 3 && (
            <div className="col-lg-4">
              <div className="card border-0 p-3" style={{ borderRadius:16, boxShadow:"0 4px 20px rgba(0,0,0,0.06)", position:"sticky", top:80 }}>
                <img src={imgSrc} alt={room.name} style={{ width:"100%", height:160, objectFit:"cover", borderRadius:12, marginBottom:12 }} onError={e => { e.target.src=fallbackImages[room.type]; }} />
                <h6 className="fw-bold mb-1" style={{ color:"#1a237e" }}>{room.name}</h6>
                <div style={{ fontSize:13, color:"#666", marginBottom:8 }}>No. {room.room_number} · {room.type} · {room.capacity} tamu</div>
                <hr />
                <div className="d-flex justify-content-between" style={{ fontSize:13 }}>
                  <span>Harga/malam</span><span>Rp {Number(room.price).toLocaleString("id-ID")}</span>
                </div>
                <div className="d-flex justify-content-between" style={{ fontSize:13, marginTop:4 }}>
                  <span>Durasi</span><span>{totalDays()} malam</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span><span style={{ color:"#e65100" }}>Rp {totalPrice().toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
