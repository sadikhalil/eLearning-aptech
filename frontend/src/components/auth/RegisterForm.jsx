import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AuthForms.css";

const RegisterForm = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "", role: "student" });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.full_name.trim())         e.full_name = "Name is required.";
    if (!form.email)                    e.email     = "Email is required.";
    if (form.password.length < 6)       e.password  = "Minimum 6 characters.";
    if (form.password !== form.confirm) e.confirm   = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async ev => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      await register({ full_name: form.full_name, email: form.email, password: form.password, role: form.role });
      navigate("/dashboard");
    } catch (err) {
      setErrors({ api: err.response?.data?.detail || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-logo">L</div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start learning today — it's free</p>
        </div>

        {errors.api && <div className="alert alert-error"><span>⚠</span> {errors.api}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input type="text" name="full_name" value={form.full_name} onChange={handleChange}
                className={`input ${errors.full_name ? "error" : ""}`} placeholder="Alex Johnson" />
              {errors.full_name && <span className="field-error">{errors.full_name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">I want to</label>
              <div className="role-selector">
                {[
  { value: "student",    icon: "📖", label: "Student",    sub: "I want to learn" },
  { value: "instructor", icon: "🎓", label: "Instructor",  sub: "I want to teach" },
].map(r => (
  <button key={r.value} type="button"
    className={`role-btn ${form.role === r.value ? "active" : ""}`}
    onClick={() => setForm(p => ({ ...p, role: r.value }))}>
    <span style={{ fontSize: 22 }}>{r.icon}</span>
    <span style={{ fontWeight: 600, fontSize: 13 }}>{r.label}</span>
    <span style={{ fontSize: 10, opacity: 0.75 }}>{r.sub}</span>
  </button>
))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className={`input ${errors.email ? "error" : ""}`} placeholder="you@example.com" />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <input type={showPwd ? "text" : "password"} name="password" value={form.password}
                  onChange={handleChange} className={`input ${errors.password ? "error" : ""}`}
                  placeholder="Min 6 characters" />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p => !p)} tabIndex={-1}>
                  {showPwd ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input type="password" name="confirm" value={form.confirm} onChange={handleChange}
                className={`input ${errors.confirm ? "error" : ""}`} placeholder="Repeat password" />
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? <><div className="spinner" /> Creating account...</> : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>

      <div className="auth-side">
        <div className="auth-side-content">
          <div className="quote-mark">"</div>
          <p className="auth-quote">The beautiful thing about learning is that no one can take it away from you.</p>
          <p className="auth-quote-author">— B.B. King</p>
          <div className="auth-stats">
            <div className="auth-stat"><strong>12k+</strong><span>Students</span></div>
            <div className="auth-stat"><strong>200+</strong><span>Courses</span></div>
            <div className="auth-stat"><strong>98%</strong><span>Satisfaction</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
