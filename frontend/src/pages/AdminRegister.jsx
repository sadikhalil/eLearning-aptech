import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminRegister.css";

const AdminRegister = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    full_name:  "",
    email:      "",
    password:   "",
    admin_code: ""
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleChange = e =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (!form.full_name || !form.email || !form.password || !form.admin_code) {
      setError("All fields are required.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register({
        full_name:  form.full_name,
        email:      form.email,
        password:   form.password,
        role:       "student",
        admin_code: form.admin_code
      });
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Check your admin code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ar-page">
      {/* Left — form */}
      <div className="ar-card">

        {/* Header */}
        <div className="ar-header">
          <div className="ar-logo">L</div>
          <h1 className="ar-title">Admin Registration</h1>
          <p className="ar-subtitle">This page is for administrators only</p>
        </div>

        {/* Warning */}
        <div className="ar-warning">
          <span className="ar-warning-icon">⚠</span>
          <span>
            You need a valid admin secret code to register here.
            Contact your organization administrator to get one.
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ar-form">

          {/* Full name */}
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              type="text"
              name="full_name"
              className="input"
              placeholder="Admin Full Name"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email"
              name="email"
              className="input"
              placeholder="admin@organization.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                className="input"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowPwd(p => !p)}
                tabIndex={-1}
              >
                {showPwd ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Admin secret code */}
          <div className="form-group">
            <label className="form-label">
              Admin secret code
              <span className="ar-label-hint">
                (provided by your organization)
              </span>
            </label>
            <div className="input-wrap">
              <input
                type={showCode ? "text" : "password"}
                name="admin_code"
                className="input"
                placeholder="Enter the admin secret code"
                value={form.admin_code}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="pwd-toggle"
                onClick={() => setShowCode(p => !p)}
                tabIndex={-1}
              >
                {showCode ? "🙈" : "👁"}
              </button>
            </div>
            <span className="ar-code-hint">
              If the code is correct, your account will automatically be created as admin.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg ar-submit"
            disabled={loading}
          >
            {loading
              ? <><div className="spinner" /> Creating admin account...</>
              : "Create admin account"
            }
          </button>
        </form>

        {/* Footer links */}
        <div className="ar-footer">
          <p className="ar-switch">
            Not an admin?{" "}
            <Link to="/register" className="ar-link">Register as student or instructor</Link>
          </p>
          <p className="ar-switch" style={{ marginTop: 6 }}>
            Already have an account?{" "}
            <Link to="/login" className="ar-link">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right — decorative side */}
      <div className="ar-side">
        <div className="ar-side-content">
          {/* Shield icon */}
          <div className="ar-shield">🛡️</div>
          <h2 className="ar-side-title">Admin Portal</h2>
          <p className="ar-side-desc">
            As an admin you have full control over the platform —
            manage users, create courses, view analytics, and more.
          </p>

          {/* Admin capabilities */}
          <div className="ar-capabilities">
            {[
              { icon: "📊", label: "View platform analytics"       },
              { icon: "👥", label: "Manage all users"              },
              { icon: "📚", label: "Create and manage courses"     },
              { icon: "🎓", label: "Issue certificates"            },
              { icon: "💰", label: "View revenue and payments"     },
              { icon: "⚙️",  label: "Configure platform settings"  },
            ].map((c, i) => (
              <div key={i} className="ar-cap-item">
                <span className="ar-cap-icon">{c.icon}</span>
                <span className="ar-cap-label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;