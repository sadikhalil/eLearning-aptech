import { useState } from "react";
import { courseApi } from "../api/courseApi";
import "./AdminPanel.css";

const MOCK_USERS = [
  { name: "Alex Johnson",  email: "alex@mail.com",  role: "student",    courses: 4, status: "active",   joined: "May 1, 2025" },
  { name: "Sara Lee",      email: "sara@mail.com",  role: "student",    courses: 2, status: "active",   joined: "Apr 28, 2025" },
  { name: "Dr. Amy Chen",  email: "amy@mail.com",   role: "instructor", courses: 0, status: "active",   joined: "Jan 10, 2025" },
  { name: "Mike Torres",   email: "mike@mail.com",  role: "student",    courses: 1, status: "inactive", joined: "May 12, 2025" },
  { name: "James Liu",     email: "james@mail.com", role: "instructor", courses: 0, status: "active",   joined: "Feb 5, 2025"  },
];

const CHART = [42, 67, 55, 89, 73, 95, 81];
const DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MAX   = Math.max(...CHART);

const AdminPanel = () => {
  const [form,    setForm]    = useState({ title: "", category: "", level: "beginner", price: "", is_free: false });
  const [msg,     setMsg]     = useState("");
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState("overview");

  const handleCreate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await courseApi.create({ ...form, price: parseFloat(form.price) || 0 });
      setMsg("success");
      setForm({ title: "", category: "", level: "beginner", price: "", is_free: false });
    } catch {
      setMsg("error");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  return (
    <div className="admin-page page-wrap">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Admin dashboard</h1>
            <p className="admin-sub">Platform analytics and management</p>
          </div>
          <span className="badge badge-coral">Admin</span>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {["overview", "courses", "users"].map(t => (
            <button key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === "overview" && (
          <>
            <div className="admin-stats">
              {[
                { icon: "👥", val: "1,247", label: "Total users",    color: "var(--navy)" },
                { icon: "📚", val: "38",    label: "Active courses", color: "var(--sage)" },
                { icon: "💰", val: "$12,480", label: "Revenue (MTD)", color: "var(--coral)" },
                { icon: "🎓", val: "89%",   label: "Completion rate", color: "var(--navy-muted)" },
              ].map((s, i) => (
                <div key={i} className="astat-card">
                  <div className="astat-icon">{s.icon}</div>
                  <div className="astat-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="astat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="card admin-chart-card">
              <h3 className="chart-title">Enrollments — last 7 days</h3>
              <div className="chart-wrap">
                {CHART.map((v, i) => (
                  <div key={i} className="chart-col">
                    <div className="chart-val">{v}</div>
                    <div
                      className="chart-bar"
                      style={{ height: `${(v / MAX) * 120}px` }}
                      title={`${v} enrollments`}
                    />
                    <div className="chart-day">{DAYS[i]}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Courses tab ── */}
        {tab === "courses" && (
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 className="tab-section-title">Create new course</h3>
            {msg === "success" && <div className="alert alert-success">✅ Course created successfully!</div>}
            {msg === "error"   && <div className="alert alert-error">⚠ Failed to create course.</div>}
            <form onSubmit={handleCreate} className="course-create-form">
              <div className="cf-row">
                <div className="form-group">
                  <label className="form-label">Course title *</label>
                  <input className="input" placeholder="e.g. Advanced TypeScript"
                    value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select category</option>
                    {["Programming","Data Science","Design","DevOps","Business"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="cf-row">
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select className="input" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input className="input" type="number" min="0" placeholder="0 for free"
                    value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                </div>
              </div>
              <label className="free-check">
                <input type="checkbox" checked={form.is_free}
                  onChange={e => setForm(p => ({ ...p, is_free: e.target.checked }))} />
                <span>Mark as free course</span>
              </label>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><div className="spinner" /> Creating...</> : "Create course"}
              </button>
            </form>
          </div>
        )}

        {/* ── Users tab ── */}
        {tab === "users" && (
          <div className="card" style={{ padding: "1.5rem", overflowX: "auto" }}>
            <h3 className="tab-section-title">All users</h3>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th>
                  <th>Courses</th><th>Status</th><th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map((u, i) => (
                  <tr key={i}>
                    <td><strong>{u.name}</strong></td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === "instructor" ? "badge-navy" : "badge-sage"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>{u.courses || "—"}</td>
                    <td>
                      <span className={`status-dot ${u.status === "active" ? "dot-green" : "dot-gray"}`} />
                      {u.status}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;