import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosInstance";
import "./Profile.css";

const Profile = () => {
  const { user, isAdmin, isInstructor } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({ full_name: user?.full_name || "", bio: user?.bio || "" });
  const [msg,     setMsg]     = useState("");
  const [loading, setLoading] = useState(false);

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleSave = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/users/me", form);
      setMsg("success");
      setEditing(false);
    } catch {
      setMsg("error");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  return (
    <div className="profile-page page-wrap">
      <div className="container">
        <div className="profile-wrap">

          {/* Left — Avatar card */}
          <div className="profile-left">
            <div className="profile-avatar-card card">
              <div className="profile-avatar">{initials}</div>
              <h2 className="profile-name">{user?.full_name}</h2>
              <p className="profile-email">{user?.email}</p>
              <span className={`badge ${
                isAdmin ? "badge-coral" : isInstructor ? "badge-navy" : "badge-sage"
              }`} style={{ marginTop: 8 }}>
                {user?.role}
              </span>
              {user?.bio && <p className="profile-bio">{user.bio}</p>}
              <div className="profile-since">
                Member since {new Date(user?.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Right — Edit form */}
          <div className="profile-right">
            <div className="card profile-form-card">
              <div className="profile-form-header">
                <h3 className="profile-form-title">Profile information</h3>
                {!editing && (
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                    Edit profile
                  </button>
                )}
              </div>

              {msg === "success" && <div className="alert alert-success">✅ Profile updated!</div>}
              {msg === "error"   && <div className="alert alert-error">⚠ Failed to update profile.</div>}

              {editing ? (
                <form onSubmit={handleSave} className="profile-form">
                  <div className="form-group">
                    <label className="form-label">Full name</label>
                    <input
                      className="input"
                      value={form.full_name}
                      onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="input profile-textarea"
                      value={form.bio}
                      onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell us a bit about yourself..."
                      rows={4}
                    />
                  </div>
                  <div className="profile-form-btns">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? <><div className="spinner" /> Saving...</> : "Save changes"}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-view">
                  <div className="pv-row">
                    <span className="pv-label">Full name</span>
                    <span className="pv-val">{user?.full_name}</span>
                  </div>
                  <div className="pv-row">
                    <span className="pv-label">Email</span>
                    <span className="pv-val">{user?.email}</span>
                  </div>
                  <div className="pv-row">
                    <span className="pv-label">Role</span>
                    <span className="pv-val" style={{ textTransform: "capitalize" }}>{user?.role}</span>
                  </div>
                  <div className="pv-row">
                    <span className="pv-label">Bio</span>
                    <span className="pv-val">{user?.bio || <em style={{ color: "var(--text-muted)" }}>No bio yet</em>}</span>
                  </div>
                  <div className="pv-row">
                    <span className="pv-label">Account status</span>
                    <span className="pv-val">
                      <span className="badge badge-sage">Active</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Security card */}
            <div className="card profile-form-card" style={{ marginTop: "1rem" }}>
              <h3 className="profile-form-title">Security</h3>
              <div className="profile-view">
                <div className="pv-row">
                  <span className="pv-label">Password</span>
                  <span className="pv-val">••••••••</span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: "1rem" }}>
                Change password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
