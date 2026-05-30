import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseApi } from "../api/courseApi";
import { enrollmentApi, progressApi } from "../api/progressApi";
import { useAuth } from "../context/AuthContext";
import VideoPlayer from "../components/courses/VideoPlayer";
import "./CourseDetail.css";

const fmt = s => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const CourseDetail = () => {
  const { id }       = useParams();
  const { isLoggedIn, user } = useAuth();
  const navigate     = useNavigate();
  const [course,    setCourse]    = useState(null);
  const [enrolled,  setEnrolled]  = useState(false);
  const [progress,  setProgress]  = useState(null);
  const [activeLesson, setActive] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error,     setError]     = useState("");

  useEffect(() => {
    Promise.all([
      courseApi.getOne(id),
      isLoggedIn ? enrollmentApi.checkStatus(id) : Promise.resolve(null),
    ]).then(([cr, er]) => {
      setCourse(cr.data);
      const isEnrolled = er?.data?.enrolled || false;
      setEnrolled(isEnrolled);
      if (cr.data.lessons?.length) setActive(cr.data.lessons[0]);
      if (isEnrolled) {
        progressApi.getCourse(id)
          .then(pr => setProgress(pr.data))
          .catch(() => {});
      }
    }).catch(() => setError("Course not found."))
      .finally(() => setLoading(false));
  }, [id, isLoggedIn]);

  const handleEnroll = async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    setEnrolling(true);
    try {
      await enrollmentApi.enroll(id);
      setEnrolled(true);
    } catch (e) {
      setError(e.response?.data?.detail || "Enrollment failed.");
    } finally {
      setEnrolling(false);
    }
  };

  const lessonProgress = (lessonId) =>
    progress?.lessons?.find(l => l.id === lessonId);

  if (loading) return (
    <div className="page-wrap container" style={{ paddingTop: 100 }}>
      <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
    </div>
  );
  if (error || !course) return (
    <div className="page-wrap container" style={{ paddingTop: 100 }}>
      <div className="alert alert-error">{error || "Course not found."}</div>
    </div>
  );

  return (
    <div className="detail-page page-wrap">
      <div className="container">
        <div className="detail-grid">

          {/* ── Left: Video + Lessons ── */}
          <div className="detail-main">
            {enrolled && activeLesson?.video_url ? (
              <VideoPlayer
                lessonId={activeLesson.id}
                videoUrl={activeLesson.video_url}
                initialProgress={lessonProgress(activeLesson.id)?.watched_percent || 0}
                onComplete={() => progressApi.getCourse(id).then(r => setProgress(r.data))}
              />
            ) : (
              <div className="detail-thumb">
                {course.thumbnail_url
                  ? <img src={course.thumbnail_url} alt={course.title} />
                  : <div className="thumb-placeholder">{course.title?.charAt(0)}</div>
                }
                {!enrolled && (
                  <div className="thumb-overlay">
                    <div className="lock-icon">🔒</div>
                    <p>Enroll to start watching</p>
                  </div>
                )}
              </div>
            )}

            {/* Active lesson info */}
            {enrolled && activeLesson && (
              <div className="active-lesson-info">
                <h2 className="active-lesson-title">{activeLesson.title}</h2>
                <p className="active-lesson-desc">{activeLesson.description}</p>
              </div>
            )}

            {/* Overall progress */}
            {enrolled && progress && (
              <div className="overall-progress card" style={{ padding: "1.25rem", marginTop: "1rem" }}>
                <div className="op-row">
                  <span className="op-label">Course progress</span>
                  <span className="op-pct">{progress.overall_percent}%</span>
                </div>
                <div className="progress-track" style={{ marginTop: 8 }}>
                  <div className="progress-fill" style={{ width: `${progress.overall_percent}%` }} />
                </div>
                <div className="op-meta">
                  {progress.completed_lessons} of {progress.total_lessons} lessons completed
                </div>
              </div>
            )}

            {/* Lesson list */}
            <div className="lessons-wrap card" style={{ marginTop: "1rem" }}>
              <h3 className="lessons-heading">Course content</h3>
              <div className="lessons-meta">
                {course.lessons?.length} lessons · {fmt(course.total_duration || 0)} total
              </div>
              <ul className="lesson-list">
                {course.lessons?.map((lesson, i) => {
                  const lp     = lessonProgress(lesson.id);
                  const done   = lp?.is_completed;
                  const active = activeLesson?.id === lesson.id;
                  return (
                    <li
                      key={lesson.id}
                      className={`lesson-item ${active ? "active" : ""} ${!enrolled && !lesson.is_preview ? "locked" : ""}`}
                      onClick={() => (enrolled || lesson.is_preview) && setActive(lesson)}
                    >
                      <div className={`lesson-status ${done ? "done" : active ? "playing" : ""}`}>
                        {done ? "✓" : active ? "▶" : i + 1}
                      </div>
                      <div className="lesson-info">
                        <span className="lesson-name">{lesson.title}</span>
                        {lesson.is_preview && !enrolled && (
                          <span className="preview-tag">Preview</span>
                        )}
                      </div>
                      <div className="lesson-right">
                        {lp && (
                          <div className="lesson-prog-mini">
                            <div className="progress-track" style={{ width: 50, height: 4 }}>
                              <div className="progress-fill" style={{ width: `${lp.watched_percent}%` }} />
                            </div>
                          </div>
                        )}
                        <span className="lesson-dur">{fmt(lesson.duration || 0)}</span>
                        {!enrolled && !lesson.is_preview && <span className="lock-icon-sm">🔒</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* ── Right: Course info sidebar ── */}
          <div className="detail-sidebar">
            <div className="sidebar-sticky">
              <div className="card sidebar-card">
                <div className="sidebar-price">
                  {course.is_free
                    ? <span className="price-free">Free</span>
                    : <span className="price-paid">${course.price?.toFixed(2)}</span>
                  }
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {enrolled ? (
                  <div className="enrolled-badge">✅ You're enrolled</div>
                ) : (
                  <button
                    className="btn btn-primary btn-lg"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? <><div className="spinner" /> Enrolling...</> : "Enroll now"}
                  </button>
                )}

                <div className="sidebar-meta">
                  <div className="sm-row"><span>📖</span><span>{course.lessons?.length} lessons</span></div>
                  <div className="sm-row"><span>🕐</span><span>{fmt(course.total_duration || 0)}</span></div>
                  <div className="sm-row"><span>📊</span><span style={{ textTransform: "capitalize" }}>{course.level}</span></div>
                  <div className="sm-row"><span>🏷</span><span>{course.category || "General"}</span></div>
                </div>
              </div>

              {/* Instructor */}
              <div className="card" style={{ padding: "1.25rem", marginTop: "1rem" }}>
                <h4 className="sidebar-section-title">Instructor</h4>
                <div className="instructor-row">
                  <div className="instructor-avatar">
                    {course.instructor?.full_name?.charAt(0) || "I"}
                  </div>
                  <div>
                    <div className="instructor-name">{course.instructor?.full_name}</div>
                    <div className="instructor-bio">{course.instructor?.bio || "Expert instructor"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course description */}
        <div className="card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--navy)", marginBottom: "1rem" }}>
            About this course
          </h3>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: 14 }}>
            {course.description || "No description provided."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
