import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AuthForms.css";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || "/dashboard";

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">L</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue learning</p>
        </div>

        {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className={`input ${error ? "error" : ""}`} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="form-group">
            <div className="label-row">
              <label className="form-label">Password</label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>
            <div className="input-wrap">
              <input type={showPwd ? "text" : "password"} name="password" value={form.password}
                onChange={handleChange} className={`input ${error ? "error" : ""}`}
                placeholder="••••••••" autoComplete="current-password" />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p => !p)} tabIndex={-1}>
                {showPwd ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? <><div className="spinner" /> Signing in...</> : "Sign in"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>
        <p className="auth-switch">
          Don't have an account? <Link to="/register" className="auth-link">Create one for free</Link>
        </p>
      </div>

      <div className="auth-side">
        <div className="auth-side-content">
          <div className="quote-mark">"</div>
          <p className="auth-quote">Education is the most powerful weapon which you can use to change the world.</p>
          <p className="auth-quote-author">— Nelson Mandela</p>
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

export default LoginForm;
