import "./AdminStats.css";

/**
 * Reusable admin stat cards grid.
 * Props:
 *   stats — array of { icon, value, label, trend, trendUp }
 *
 * Usage:
 *   <AdminStats stats={[
 *     { icon: "👥", value: "1,247", label: "Total users", trend: "+12%", trendUp: true },
 *     { icon: "📚", value: "38",    label: "Courses",     trend: "+3",   trendUp: true },
 *   ]} />
 */
const AdminStats = ({ stats = [] }) => {
  return (
    <div className="astats-grid">
      {stats.map((s, i) => (
        <div key={i} className="astats-card">
          <div className="astats-top">
            <div className="astats-icon">{s.icon}</div>
            {s.trend && (
              <span className={`astats-trend ${s.trendUp ? "trend-up" : "trend-down"}`}>
                {s.trendUp ? "↑" : "↓"} {s.trend}
              </span>
            )}
          </div>
          <div className="astats-val">{s.value}</div>
          <div className="astats-label">{s.label}</div>
          {s.sub && <div className="astats-sub">{s.sub}</div>}
        </div>
      ))}
    </div>
  );
};

export default AdminStats;
