import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as registerApi } from "../../api/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (form.password.length < 6) { setError("Password minimal 6 karakter."); return; }
    setLoading(true);
    try {
      await registerApi(form);
      setSuccess("Registrasi berhasil! Silakan login.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name",     label: "Nama Lengkap", type: "text",     icon: "👤", placeholder: "Nama lengkap Anda", required: true },
    { name: "username", label: "Username",      type: "text",     icon: "🆔", placeholder: "Username unik Anda", required: true },
    { name: "email",    label: "Email",         type: "email",    icon: "✉️",  placeholder: "email@contoh.com",  required: true },
    { name: "phone",    label: "No. Telepon",   type: "tel",      icon: "📞", placeholder: "08xxxxxxxxxx",      required: false },
    { name: "address",  label: "Alamat",        type: "text",     icon: "📍", placeholder: "Alamat lengkap",    required: false },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0d0d2b 0%, #1a237e 60%, #283593 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ background: "rgba(255,255,255,0.97)", borderRadius: 24, padding: 40, boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
          {/* Header */}
          <div className="text-center mb-4">
            <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #ff9800, #f57c00)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px" }}>🏨</div>
            <h4 className="fw-bold mb-1" style={{ color: "#1a237e" }}>Buat Akun Baru</h4>
            <p className="text-muted mb-0" style={{ fontSize: 14 }}>Daftar dan nikmati kemudahan booking</p>
          </div>

          {error   && <div className="alert alert-danger d-flex gap-2 py-2 mb-3" style={{ fontSize: 13, borderRadius: 10 }}><span>⚠️</span>{error}</div>}
          {success && <div className="alert alert-success d-flex gap-2 py-2 mb-3" style={{ fontSize: 13, borderRadius: 10 }}><span>✅</span>{success}</div>}

          <form onSubmit={handleSubmit}>
            {fields.map(f => (
              <div className="mb-3" key={f.name}>
                <label className="form-label fw-semibold" style={{ fontSize: 13, color: "#333" }}>{f.label}{f.required && <span className="text-danger ms-1">*</span>}</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: "#f5f7ff", border: "1.5px solid #e8eaf6", borderRight: 0 }}>{f.icon}</span>
                  <input type={f.type} name={f.name} className="form-control" placeholder={f.placeholder}
                    value={form[f.name]} onChange={handleChange} required={f.required}
                    style={{ border: "1.5px solid #e8eaf6", borderLeft: 0, fontSize: 14 }} />
                </div>
              </div>
            ))}

            {/* Password */}
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: 13, color: "#333" }}>Password <span className="text-danger">*</span></label>
              <div className="input-group">
                <span className="input-group-text" style={{ background: "#f5f7ff", border: "1.5px solid #e8eaf6", borderRight: 0 }}>🔒</span>
                <input type={showPass ? "text" : "password"} name="password" className="form-control" placeholder="Min. 6 karakter"
                  value={form.password} onChange={handleChange} required
                  style={{ border: "1.5px solid #e8eaf6", borderLeft: 0, borderRight: 0, fontSize: 14 }} />
                <button type="button" className="input-group-text" style={{ background: "#f5f7ff", border: "1.5px solid #e8eaf6", borderLeft: 0, cursor: "pointer" }} onClick={() => setShowPass(!showPass)}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn w-100 fw-bold py-2 mb-3"
              style={{ background: "linear-gradient(135deg, #ff9800, #f57c00)", color: "white", border: "none", borderRadius: 12, fontSize: 15 }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2" />Mendaftar...</> : "🚀 Daftar Sekarang"}
            </button>
          </form>

          <div className="text-center">
            <p className="mb-0" style={{ fontSize: 13, color: "#666" }}>
              Sudah punya akun?{" "}
              <Link to="/login" className="fw-semibold" style={{ color: "#1a237e", textDecoration: "none" }}>Masuk di sini</Link>
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
