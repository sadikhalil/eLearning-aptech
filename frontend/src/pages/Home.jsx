import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { courseApi } from "../api/courseApi";
import CourseCard from "../components/courses/CourseCard";
import "./Home.css";

const STATS = [
  { value: "12,000+", label: "Active students"   },
  { value: "200+",    label: "Expert courses"     },
  { value: "98%",     label: "Satisfaction rate"  },
  { value: "50+",     label: "Instructors"        },
];

const HOW = [
  { icon: "🔍", title: "Browse courses",    desc: "Explore our catalog of 200+ courses across tech, design, and business." },
  { icon: "📝", title: "Enroll instantly",  desc: "One click enrollment. Free courses are always free, no credit card needed." },
  { icon: "🎓", title: "Learn & grow",      desc: "Watch at your pace, track progress, and earn verified certificates." },
];

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseApi.list({ limit: 6 })
      .then(r => setCourses(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page page-wrap">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text fade-in">
            <span className="hero-eyebrow">🎓 Online Learning Platform</span>
            <h1 className="hero-title">
              Learn without<br />
              <span className="hero-title-accent">limits.</span>
            </h1>
            <p className="hero-desc">
              Unlock your potential with world-class courses taught by expert instructors.
              Study at your own pace and earn certificates that matter.
            </p>
            <div className="hero-ctas">
              <Link to="/courses"  className="btn btn-primary btn-lg">Browse courses</Link>
              <Link to="/register" className="btn btn-outline btn-lg hero-outline">Start for free</Link>
            </div>
          </div>
          <div className="hero-visual fade-in">
            <div className="hero-card-stack">
              <div className="hcard hcard-1">
                <div className="hcard-icon">🐍</div>
                <div>
                  <div className="hcard-title">Python for Data Science</div>
                  <div className="progress-track" style={{ marginTop: 6 }}>
                    <div className="progress-fill" style={{ width: "72%" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--sage)", marginTop: 4 }}>72% complete</div>
                </div>
              </div>
              <div className="hcard hcard-2">
                <div className="hcard-icon">⚛️</div>
                <div>
                  <div className="hcard-title">React Advanced Patterns</div>
                  <div className="progress-track" style={{ marginTop: 6 }}>
                    <div className="progress-fill" style={{ width: "35%" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--sage)", marginTop: 4 }}>35% complete</div>
                </div>
              </div>
              <div className="hcard hcard-3">
                <span style={{ fontSize: 18 }}>🏆</span>
                <div>
                  <div className="hcard-title">Certificate earned!</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>JavaScript Fundamentals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-strip">
        <div className="container stats-inner">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className="section container">
        <div className="section-head">
          <div>
            <h2 className="section-title">Featured courses</h2>
            <p className="section-sub">Hand-picked by our team of educators</p>
          </div>
          <Link to="/courses" className="btn btn-outline btn-sm">View all →</Link>
        </div>

        {loading ? (
          <div className="grid-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 300, borderRadius: 16 }} />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid-3">
            {courses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p>No courses available yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* ── How it works ── */}
      <section className="how-section">
        <div className="container">
          <div className="section-head" style={{ justifyContent: "center", textAlign: "center", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <h2 className="section-title">How it works</h2>
            <p className="section-sub">Get started in three simple steps</p>
          </div>
          <div className="how-grid">
            {HOW.map((h, i) => (
              <div key={i} className="how-card">
                <div className="how-num">{i + 1}</div>
                <div className="how-icon">{h.icon}</div>
                <h3 className="how-title">{h.title}</h3>
                <p className="how-desc">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <div className="container cta-inner">
          <div>
            <h2 className="cta-title">Ready to start learning?</h2>
            <p className="cta-sub">Join thousands of students already on LearnFlow.</p>
          </div>
          <Link to="/register" className="btn btn-primary btn-lg">Get started — it's free</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
