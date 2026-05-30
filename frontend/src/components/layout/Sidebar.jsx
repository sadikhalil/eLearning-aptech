import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const studentLinks = [
  { to: "/dashboard",   icon: "🏠", label: "Dashboard"    },
  { to: "/my-courses",  icon: "📚", label: "My Courses"   },
  { to: "/courses",     icon: "🔍", label: "Browse"       },
  { to: "/profile",     icon: "👤", label: "Profile"      },
];

const instructorLinks = [
  { to: "/dashboard",   icon: "🏠", label: "Dashboard"    },
  { to: "/instructor",  icon: "🎓", label: "My Courses"   },
  { to: "/courses",     icon: "🔍", label: "Browse"       },
  { to: "/profile",     icon: "👤", label: "Profile"      },
];

const adminLinks = [
  { to: "/dashboard",   icon: "🏠", label: "Dashboard"    },
  { to: "/admin",       icon: "⚙️",  label: "Admin Panel"  },
  { to: "/courses",     icon: "📚", label: "Courses"      },
  { to: "/profile",     icon: "👤", label: "Profile"      },
];

const Sidebar = () => {
  const { user, isAdmin, isInstructor, logout } = useAuth();

  const links = isAdmin
    ? adminLinks
    : isInstructor
    ? instructorLinks
    : studentLinks;

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <aside className="sidebar">
      {/* User info */}
      <div className="sb-user">
        <div className="sb-avatar">{initials}</div>
        <div className="sb-user-info">
          <div className="sb-name">{user?.full_name}</div>
          <div className="sb-role">{user?.role}</div>
        </div>
      </div>

      <div className="sb-divider" />

      {/* Nav links */}
      <nav className="sb-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sb-link ${isActive ? "sb-link-active" : ""}`
            }
          >
            <span className="sb-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sb-divider" />

      {/* Logout */}
      <button className="sb-logout" onClick={logout}>
        <span>🚪</span>
        <span>Sign out</span>
      </button>
    </aside>
  );
};

export default Sidebar;
