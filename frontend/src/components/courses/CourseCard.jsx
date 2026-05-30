import { Link } from "react-router-dom";
import "./CourseCard.css";

const levelColors = {
  beginner:     { bg: "#d6e8d7", color: "#2d6a31" },
  intermediate: { bg: "#fef3cd", color: "#856404" },
  advanced:     { bg: "#fde8e3", color: "#c0392b" },
};

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const CourseCard = ({ course, enrolled = false, progress = 0 }) => {
  const level = levelColors[course.level] || levelColors.beginner;

  return (
    <Link to={`/courses/${course.id}`} className="course-card">
      {/* Thumbnail */}
      <div className="course-thumb">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} />
        ) : (
          <div className="course-thumb-placeholder">
            <span>{course.title?.charAt(0) || "C"}</span>
          </div>
        )}
        {/* Level badge */}
        <span
          className="course-level-badge"
          style={{ background: level.bg, color: level.color }}
        >
          {course.level}
        </span>
        {/* Free badge */}
        {course.is_free && (
          <span className="course-free-badge">FREE</span>
        )}
      </div>

      {/* Body */}
      <div className="course-body">
        {/* Category */}
        {course.category && (
          <span className="course-category">{course.category}</span>
        )}

        <h3 className="course-title">{course.title}</h3>

        <p className="course-instructor">
          by {course.instructor?.full_name || "Instructor"}
        </p>

        {/* Meta row */}
        <div className="course-meta">
          {course.total_duration > 0 && (
            <span className="meta-item">
              🕐 {formatDuration(course.total_duration)}
            </span>
          )}
          {course.lessons_count > 0 && (
            <span className="meta-item">
              📖 {course.lessons_count} lessons
            </span>
          )}
        </div>

        {/* Progress bar if enrolled */}
        {enrolled && (
          <div className="course-progress-wrap">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="course-progress-label">{Math.round(progress)}% complete</span>
          </div>
        )}

        {/* Footer */}
        <div className="course-footer">
          <div className="course-price">
            {course.is_free ? (
              <span className="price-free">Free</span>
            ) : (
              <span className="price-paid">${course.price?.toFixed(2)}</span>
            )}
          </div>
          <span className={`course-cta ${enrolled ? "enrolled" : ""}`}>
            {enrolled ? "Continue →" : "View course →"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
