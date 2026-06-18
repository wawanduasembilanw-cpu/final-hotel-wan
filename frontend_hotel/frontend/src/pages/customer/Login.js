import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as loginApi } from "../../api/api";
import { saveAuth } from "../../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginApi(form);
      saveAuth(res.data.token, res.data.user);
      if (res.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal. Periksa kembali username dan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0d0d2b 0%, #1a237e 60%, #283593 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {/* BG Decorations */}
      <div style={{ position: "fixed", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,152,0,0.05)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -100, left: -100, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.97)", borderRadius: 24, padding: 40, boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
          {/* Header */}
          <div className="text-center mb-4">
            <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #1a237e, #283593)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px" }}>🏨</div>
            <h4 className="fw-bold mb-1" style={{ color: "#1a237e" }}>Selamat Datang</h4>
            <p className="text-muted mb-0" style={{ fontSize: 14 }}>Masuk ke akun Anda</p>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2" style={{ fontSize: 13, borderRadius: 10 }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: 13, color: "#333" }}>Username</label>
              <div className="input-group">
                <span className="input-group-text" style={{ background: "#f5f7ff", border: "1.5px solid #e8eaf6", borderRight: 0 }}>👤</span>
                <input
                  type="text" className="form-control" placeholder="Masukkan username"
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                  required style={{ border: "1.5px solid #e8eaf6", borderLeft: 0, fontSize: 14 }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: 13, color: "#333" }}>Password</label>
              <div className="input-group">
                <span className="input-group-text" style={{ background: "#f5f7ff", border: "1.5px solid #e8eaf6", borderRight: 0 }}>🔒</span>
                <input
                  type={showPass ? "text" : "password"} className="form-control" placeholder="Masukkan password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  required style={{ border: "1.5px solid #e8eaf6", borderLeft: 0, borderRight: 0, fontSize: 14 }}
                />
                <button type="button" className="input-group-text" style={{ background: "#f5f7ff", border: "1.5px solid #e8eaf6", borderLeft: 0, cursor: "pointer" }} onClick={() => setShowPass(!showPass)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn w-100 fw-bold py-2 mb-3"
              style={{ background: "linear-gradient(135deg, #1a237e, #283593)", color: "white", border: "none", borderRadius: 12, fontSize: 15, transition: "opacity 0.2s" }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Memproses...</> : "🔑 Masuk"}
            </button>
          </form>

          <div className="text-center">
            <p className="mb-0" style={{ fontSize: 13, color: "#666" }}>
              Belum punya akun?{" "}
              <Link to="/register" className="fw-semibold" style={{ color: "#1a237e", textDecoration: "none" }}>Daftar Sekarang</Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-3">
          <Link to="/" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}>← Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
