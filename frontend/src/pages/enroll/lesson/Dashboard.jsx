import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { enrollmentApi } from "../api/progressApi";
import { progressApi } from "../api/progressApi";
import { useAuth } from "../context/AuthContext";
import CourseCard from "../components/courses/CourseCard";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [courses,  setCourses]  = useState([]);
  const [progMap,  setProgMap]  = useState({});
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    enrollmentApi.myCourses()
      .then(async r => {
        setCourses(r.data);
        const map = {};
        await Promise.all(
          r.data.map(c =>
            progressApi.getCourse(c.id)
              .then(pr => { map[c.id] = pr.data; })
              .catch(() => {})
          )
        );
        setProgMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed  = courses.filter(c => progMap[c.id]?.overall_percent === 100);
  const inProgress = courses.filter(c => {
    const p = progMap[c.id]?.overall_percent || 0;
    return p > 0 && p < 100;
  });
  const notStarted = courses.filter(c => !(progMap[c.id]?.overall_percent > 0));

  const totalHours = Object.values(progMap).reduce((acc, p) => {
    return acc + (p?.lessons?.reduce((s, l) => s + (l.watch_time_seconds || 0), 0) || 0);
  }, 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="dashboard-page page-wrap">
      <div className="container">

        {/* Header */}
        <div className="dash-header">
          <div>
            <p className="dash-greeting">{greeting()},</p>
            <h1 className="dash-name">{user?.full_name} 👋</h1>
            <p className="dash-sub">Here's your learning overview</p>
          </div>
          <Link to="/courses" className="btn btn-primary">+ Explore courses</Link>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dstat-card">
            <div className="dstat-icon">📚</div>
            <div className="dstat-val">{courses.length}</div>
            <div className="dstat-label">Enrolled</div>
          </div>
          <div className="dstat-card">
            <div className="dstat-icon">▶️</div>
            <div className="dstat-val">{inProgress.length}</div>
            <div className="dstat-label">In progress</div>
          </div>
          <div className="dstat-card">
            <div className="dstat-icon">✅</div>
            <div className="dstat-val">{completed.length}</div>
            <div className="dstat-label">Completed</div>
          </div>
          <div className="dstat-card">
            <div className="dstat-icon">🕐</div>
            <div className="dstat-val">{Math.round(totalHours / 3600)}h</div>
            <div className="dstat-label">Hours learned</div>
          </div>
        </div>

        {loading ? (
          <div className="grid-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 300, borderRadius: 16 }} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="dash-empty">
            <div className="empty-icon">🎓</div>
            <h3>No courses yet</h3>
            <p>Start your learning journey by enrolling in a course.</p>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>
              Browse courses
            </Link>
          </div>
        ) : (
          <>
            {/* In Progress */}
            {inProgress.length > 0 && (
              <div className="dash-section">
                <h2 className="dash-section-title">Continue learning</h2>
                <div className="grid-3">
                  {inProgress.map(c => (
                    <CourseCard
                      key={c.id}
                      course={c}
                      enrolled
                      progress={progMap[c.id]?.overall_percent || 0}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Not Started */}
            {notStarted.length > 0 && (
              <div className="dash-section">
                <h2 className="dash-section-title">Start watching</h2>
                <div className="grid-3">
                  {notStarted.map(c => (
                    <CourseCard key={c.id} course={c} enrolled progress={0} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <div className="dash-section">
                <h2 className="dash-section-title">🏆 Completed</h2>
                <div className="grid-3">
                  {completed.map(c => (
                    <CourseCard key={c.id} course={c} enrolled progress={100} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;