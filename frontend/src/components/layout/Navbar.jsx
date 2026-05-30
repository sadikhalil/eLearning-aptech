import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, isLoggedIn, logout, isAdmin, isInstructor } = useAuth();
  const navigate = useNavigate();
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <nav className="navbar">
      <div className="navbar-inner container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">L</div>
          <span>Learn<strong>Flow</strong></span>
        </Link>

        {/* Desktop links */}
        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <NavLink to="/courses"   className="nav-link" onClick={() => setMenuOpen(false)}>Courses</NavLink>
          {isLoggedIn && (
            <NavLink to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
          )}
          {isInstructor && (
            <NavLink to="/instructor" className="nav-link" onClick={() => setMenuOpen(false)}>My Courses</NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className="nav-link nav-link-admin" onClick={() => setMenuOpen(false)}>Admin</NavLink>
          )}
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {!isLoggedIn ? (
            <div className="auth-btns">
              <Link to="/login"    className="btn btn-outline btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </div>
          ) : (
            <div className="user-menu" onMouseLeave={() => setDropOpen(false)}>
              <button
                className="user-avatar"
                onClick={() => setDropOpen(p => !p)}
                aria-label="User menu"
              >
                {initials}
              </button>
              {dropOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{user?.full_name}</div>
                    <div className="dropdown-role">{user?.role}</div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropOpen(false)}>
                    👤 My Profile
                  </Link>
                  <Link to="/my-courses" className="dropdown-item" onClick={() => setDropOpen(false)}>
                    📚 My Courses
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    🚪 Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger */}
          <button
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
