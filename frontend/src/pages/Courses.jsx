import { useEffect, useState } from "react";
import { courseApi } from "../api/courseApi";
import CourseCard from "../components/courses/CourseCard";
import "./Courses.css";

const CATEGORIES = ["All", "Programming", "Data Science", "Design", "DevOps", "Business"];
const LEVELS     = ["All", "beginner", "intermediate", "advanced"];

const Courses = () => {
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");
  const [level,    setLevel]    = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (debouncedSearch)      params.search   = debouncedSearch;
    if (category !== "All")   params.category = category;
    if (level    !== "All")   params.level    = level;

    courseApi.list(params)
      .then(r => setCourses(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch, category, level]);

  return (
    <div className="courses-page page-wrap">
      <div className="container">

        {/* Header */}
        <div className="courses-header">
          <div>
            <h1 className="courses-title">Course catalog</h1>
            <p className="courses-sub">Expand your skills with expert-led courses</p>
          </div>
          <div className="courses-count badge badge-navy">{courses.length} courses</div>
        </div>

        {/* Search */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search courses, topics, instructors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* Filters */}
        <div className="filters-row">
          <div className="filter-group">
            <span className="filter-label">Category</span>
            <div className="filter-chips">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`chip ${category === c ? "active" : ""}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Level</span>
            <div className="filter-chips">
              {LEVELS.map(l => (
                <button
                  key={l}
                  className={`chip ${level === l ? "active" : ""}`}
                  onClick={() => setLevel(l)}
                >
                  {l === "All" ? "All levels" : l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 310, borderRadius: 16 }} />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid-3 fade-in">
            {courses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔎</div>
            <p>No courses found for your filters.</p>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }}
              onClick={() => { setSearch(""); setCategory("All"); setLevel("All"); }}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
