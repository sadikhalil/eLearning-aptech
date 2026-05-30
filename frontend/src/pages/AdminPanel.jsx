import { useEffect, useState } from "react";
import { courseApi } from "../api/courseApi";
import api from "../api/axiosInstance";
import "./AdminPanel.css";

const MOCK_USERS = [
  { name: "Alex Johnson",  email: "alex@mail.com",  role: "student",    courses: 4, status: "active",   joined: "May 1, 2025"  },
  { name: "Sara Lee",      email: "sara@mail.com",  role: "student",    courses: 2, status: "active",   joined: "Apr 28, 2025" },
  { name: "Dr. Amy Chen",  email: "amy@mail.com",   role: "instructor", courses: 0, status: "active",   joined: "Jan 10, 2025" },
  { name: "Mike Torres",   email: "mike@mail.com",  role: "student",    courses: 1, status: "inactive", joined: "May 12, 2025" },
  { name: "James Liu",     email: "james@mail.com", role: "instructor", courses: 0, status: "active",   joined: "Feb 5, 2025"  },
];

const CHART = [42, 67, 55, 89, 73, 95, 81];
const DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MAX   = Math.max(...CHART);

const AdminPanel = () => {
  const [form, setForm] = useState({
    title:       "",
    description: "",
    category:    "",
    level:       "beginner",
    price:       "",
    is_free:     false
  });
  const [msg,     setMsg]     = useState("");
  const [loading, setLoading] = useState(false);
  const [users,   setUsers]   = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [tab,     setTab]     = useState("overview");

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const { data } = await api.get("/users");
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err.response?.data || err.message);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (tab === "users") {
      fetchUsers();
    }
  }, [tab]);

  const handleCreate = async e => {
    e.preventDefault();
    if (!form.title.trim()) {
      setMsg("error");
      return;
    }
    setLoading(true);
    try {
      await courseApi.create({
        title:       form.title,
        description: form.description || "",
        category:    form.category    || "General",
        level:       form.level,
        price:       parseFloat(form.price) || 0,
        is_free:     form.is_free,
      });
      setMsg("success");
      setForm({
        title: "", description: "", category: "",
        level: "beginner", price: "", is_free: false
      });
    } catch (err) {
      console.error("Course creation error:", err.response?.data || err.message);
      setMsg("error");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  return (
    <div className="admin-page page-wrap">
      <div className="container">

        {/* Header */}
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
            <button
              key={t}
              className={`admin-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === "overview" && (
          <>
            <div className="admin-stats">
              {[
                { icon: "👥", val: "1,247", label: "Total users",     color: "var(--navy)"        },
                { icon: "📚", val: "38",    label: "Active courses",  color: "var(--sage)"        },
                { icon: "💰", val: "$12,480",label: "Revenue (MTD)", color: "var(--coral)"       },
                { icon: "🎓", val: "89%",   label: "Completion rate", color: "var(--navy-muted)"  },
              ].map((s, i) => (
                <div key={i} className="astat-card">
                  <div className="astat-icon">{s.icon}</div>
                  <div className="astat-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="astat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Enrollment chart */}
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

            {msg === "success" && (
              <div className="alert alert-success">
                ✅ Course created successfully! Check the Courses page.
              </div>
            )}
            {msg === "error" && (
              <div className="alert alert-error">
                ⚠ Failed to create course. Make sure you are logged in as admin/instructor.
              </div>
            )}

            <form onSubmit={handleCreate} className="course-create-form">

              {/* Title */}
              <div className="form-group">
                <label className="form-label">Course title *</label>
                <input
                  className="input"
                  name="title"
                  placeholder="e.g. Advanced TypeScript"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="input"
                  name="description"
                  placeholder="What will students learn in this course?"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>

              {/* Category + Level */}
              <div className="cf-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="input"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="">Select category</option>
                    {["Programming","Data Science","Design","DevOps","Business"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select
                    className="input"
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Price + Free toggle */}
              <div className="cf-row">
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    className="input"
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 49.99"
                    value={form.price}
                    onChange={handleChange}
                    disabled={form.is_free}
                  />
                </div>
                <div className="form-group" style={{ justifyContent: "flex-end" }}>
                  <label className="free-check">
                    <input
                      type="checkbox"
                      name="is_free"
                      checked={form.is_free}
                      onChange={handleChange}
                    />
                    <span>Mark as free course</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              >
                {loading
                  ? <><div className="spinner" style={{ borderTopColor: "white" }} /> Creating...</>
                  : "Create & publish course"
                }
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                      Loading users...
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.full_name}</strong></td>
                      <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{u.email}</td>
                      <td>
                        <span className={`badge ${
                          u.role === "instructor" ? "badge-navy" :
                          u.role === "admin"      ? "badge-coral" : "badge-sage"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-dot ${u.is_active ? "dot-green" : "dot-gray"}`} />
                        {u.is_active ? "active" : "inactive"}
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;