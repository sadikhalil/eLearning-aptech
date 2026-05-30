import { useState } from "react";
import CourseCard from "./CourseCard";
import { useCourses } from "../../hooks/useCourses";
import "./CourseCatalog.css";

const CATEGORIES = ["All","Programming","Data Science","Design","DevOps","Business"];
const LEVELS     = ["All","beginner","intermediate","advanced"];

/**
 * Reusable course catalog component.
 * Can be embedded in any page — already used standalone in Courses.jsx.
 * Props:
 *   title       — section heading (optional)
 *   limit       — max courses to show (optional)
 *   showFilters — show search/filter bar (default true)
 *   enrolledIds — array of course IDs the user is enrolled in
 *   progressMap — { courseId: percent } map for enrolled courses
 */
const CourseCatalog = ({
  title       = "Course catalog",
  limit,
  showFilters = true,
  enrolledIds = [],
  progressMap = {},
}) => {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");
  const [level,    setLevel]    = useState("All");
  const [debounced, setDebounced] = useState("");

  // Debounce search
  const handleSearch = e => {
    setSearch(e.target.value);
    clearTimeout(window._searchTimer);
    window._searchTimer = setTimeout(() => setDebounced(e.target.value), 400);
  };

  const filters = {};
  if (debounced)          filters.search   = debounced;
  if (category !== "All") filters.category = category;
  if (level    !== "All") filters.level    = level;
  if (limit)              filters.limit    = limit;

  const { courses, loading, error } = useCourses(filters);

  return (
    <div className="catalog-wrap">
      {title && <h2 className="catalog-title">{title}</h2>}

      {showFilters && (
        <div className="catalog-filters">
          {/* Search */}
          <div className="catalog-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search courses..."
              value={search}
              onChange={handleSearch}
            />
            {search && (
              <button className="search-clear" onClick={() => { setSearch(""); setDebounced(""); }}>✕</button>
            )}
          </div>

          {/* Category chips */}
          <div className="catalog-chip-row">
            {CATEGORIES.map(c => (
              <button key={c} className={`chip ${category === c ? "active" : ""}`}
                onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>

          {/* Level chips */}
          <div className="catalog-chip-row">
            {LEVELS.map(l => (
              <button key={l} className={`chip ${level === l ? "active" : ""}`}
                onClick={() => setLevel(l)}>
                {l === "All" ? "All levels" : l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="catalog-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 310, borderRadius: 16 }} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <p>No courses found. Try adjusting your filters.</p>
          <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }}
            onClick={() => { setSearch(""); setDebounced(""); setCategory("All"); setLevel("All"); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="catalog-grid fade-in">
          {courses.map(c => (
            <CourseCard
              key={c.id}
              course={c}
              enrolled={enrolledIds.includes(c.id)}
              progress={progressMap[c.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
