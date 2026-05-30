import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { courseApi } from "../api/courseApi";
import { useAuth } from "../context/AuthContext";
import "./AdminPanel.css";

const InstructorPanel = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    price: "",
    is_free: false,
  });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    duration: "",
    is_preview: false,
  });
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    due_date: "",
  });
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [uploadingVideoLesson, setUploadingVideoLesson] = useState(null);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const { data } = await courseApi.myCourses();
        setCourses(data);
      } catch (err) {
        console.error("Failed to load instructor courses:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const refreshCourses = async () => {
    try {
      const { data } = await courseApi.myCourses();
      setCourses(data);
    } catch (err) {
      console.error("Failed to refresh instructor courses:", err.response?.data || err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setMessage("Please provide a course title.");
      return;
    }
    setLoading(true);
    try {
      await courseApi.create({
        title: form.title,
        description: form.description || "",
        category: form.category || "General",
        level: form.level,
        price: parseFloat(form.price) || 0,
        is_free: form.is_free,
      });
      setMessage("Course created successfully.");
      setForm({ title: "", description: "", category: "", level: "beginner", price: "", is_free: false });
      await refreshCourses();
    } catch (err) {
      console.error("Course creation error:", err.response?.data || err.message);
      setMessage("Failed to create course.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const loadCourseDetails = async (courseId) => {
    setLoading(true);
    try {
      const { data } = await courseApi.getOne(courseId);
      setSelectedCourse(data);
    } catch (err) {
      console.error("Failed to load course details:", err.response?.data || err.message);
      setMessage("Could not load course details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (course) => {
    await loadCourseDetails(course.id);
    setStudents([]);
  };

  const handleViewStudents = async (course) => {
    await handleSelectCourse(course);
    setLoadingStudents(true);
    try {
      const { data } = await courseApi.getCourseStudents(course.id);
      setStudents(data);
    } catch (err) {
      console.error("Failed to load enrolled students:", err.response?.data || err.message);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleLessonChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLessonForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) {
      setMessage("Please provide a lesson title.");
      return;
    }
    setSavingLesson(true);
    try {
      await courseApi.addLesson(selectedCourse.id, {
        title: lessonForm.title,
        description: lessonForm.description || "",
        duration: parseInt(lessonForm.duration, 10) || 0,
        is_preview: lessonForm.is_preview,
      });
      setMessage("Lesson added successfully.");
      setLessonForm({ title: "", description: "", duration: "", is_preview: false });
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      console.error("Failed to add lesson:", err.response?.data || err.message);
      setMessage("Could not add lesson.");
    } finally {
      setSavingLesson(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleUploadVideo = async (lessonId, file) => {
    if (!file) return;
    setUploadingVideoLesson(lessonId);
    try {
      await courseApi.uploadVideo(selectedCourse.id, lessonId, file);
      setMessage("Video uploaded successfully.");
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      console.error("Video upload failed:", err.response?.data || err.message);
      setMessage("Could not upload video.");
    } finally {
      setUploadingVideoLesson(null);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentForm.title.trim()) {
      setMessage("Please provide an assignment title.");
      return;
    }
    setSavingAssignment(true);
    try {
      await courseApi.createAssignment(selectedCourse.id, {
        title: assignmentForm.title,
        description: assignmentForm.description || "",
        due_date: assignmentForm.due_date || undefined,
      });
      setMessage("Assignment added successfully.");
      setAssignmentForm({ title: "", description: "", due_date: "" });
      await loadCourseDetails(selectedCourse.id);
    } catch (err) {
      console.error("Failed to create assignment:", err.response?.data || err.message);
      setMessage("Could not create assignment.");
    } finally {
      setSavingAssignment(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div className="admin-page page-wrap">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Instructor dashboard</h1>
            <p className="admin-sub">Manage your courses, upload lessons, and track student progress.</p>
          </div>
          <span className="badge badge-navy">Instructor</span>
        </div>

        <div className="admin-stats">
          <div className="astat-card">
            <div className="astat-icon">🎓</div>
            <div className="astat-val">{courses.length}</div>
            <div className="astat-label">Courses created</div>
          </div>
          <div className="astat-card">
            <div className="astat-icon">📥</div>
            <div className="astat-val">{selectedCourse ? selectedCourse.lessons?.length || 0 : 0}</div>
            <div className="astat-label">Lessons in selected course</div>
          </div>
          <div className="astat-card">
            <div className="astat-icon">📈</div>
            <div className="astat-val">{loadingStudents ? "..." : students.length}</div>
            <div className="astat-label">Students tracked</div>
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 className="tab-section-title">Create a new course</h3>
          {message && <div className="alert alert-info">{message}</div>}
          <form onSubmit={handleCreate} className="course-create-form">
            <div className="form-group">
              <label className="form-label">Course title *</label>
              <input className="input" name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="input" name="description" value={form.description} onChange={handleChange} rows={3} />
            </div>
            <div className="cf-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="input" name="category" value={form.category} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Level</label>
                <select className="input" name="level" value={form.level} onChange={handleChange}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="cf-row">
              <div className="form-group">
                <label className="form-label">Price</label>
                <input className="input" type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" disabled={form.is_free} />
              </div>
              <div className="form-group" style={{ alignItems: "center" }}>
                <label className="free-check">
                  <input type="checkbox" name="is_free" checked={form.is_free} onChange={handleChange} />
                  <span>Free course</span>
                </label>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Creating..." : "Create course"}
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 className="tab-section-title">Your courses</h3>
          {loading ? (
            <div className="grid-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="dash-empty">
              <div className="empty-icon">📚</div>
              <h3>No instructor courses yet</h3>
              <p>Create your first course to start publishing lectures.</p>
            </div>
          ) : (
            <div className="course-grid">
              {courses.map((course) => (
                <div key={course.id} className="course-card">
                  <div>
                    <h3>{course.title}</h3>
                    <p>{course.description || "No description."}</p>
                  </div>
                  <div className="course-card-meta">
                    <span>{course.lessons?.length || 0} lessons</span>
                    <span>{course.is_published ? "Published" : "Draft"}</span>
                  </div>
                  <div className="course-card-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => handleSelectCourse(course)}>
                      Manage course
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => handleViewStudents(course)}>
                      View students
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCourse && (
          <div className="card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
            <h3 className="tab-section-title">Manage course: {selectedCourse.title}</h3>
            <div className="course-detail-grid" style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
              <div style={{ flex: 1, minWidth: 320 }}>
                <h4>Lessons</h4>
                {selectedCourse.lessons?.length ? (
                  <div className="lesson-list-panel">
                    {selectedCourse.lessons.map((lesson) => (
                      <div key={lesson.id} className="lesson-row" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "1rem", borderBottom: "1px solid #eef2f7" }}>
                        <div>
                          <strong>{lesson.title}</strong>
                          <p style={{ margin: "0.25rem 0" }}>{lesson.description || "No description."}</p>
                          <small>{lesson.duration || 0} sec · {lesson.is_preview ? "Preview" : "Locked"}</small>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                          <label className="btn btn-outline" style={{ cursor: "pointer", margin: 0 }}>
                            Upload video
                            <input
                              type="file"
                              accept="video/*"
                              hidden
                              onChange={(e) => handleUploadVideo(lesson.id, e.target.files?.[0])}
                            />
                          </label>
                          {uploadingVideoLesson === lesson.id ? <span>Uploading…</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dash-empty" style={{ padding: "1rem" }}>
                    <div className="empty-icon">🎬</div>
                    <h3>No lessons yet</h3>
                    <p>Add lessons below to start building your course.</p>
                  </div>
                )}

                <div className="card" style={{ marginTop: "1rem", padding: "1rem" }}>
                  <h4>Add lesson</h4>
                  <form onSubmit={handleAddLesson}>
                    <div className="form-group">
                      <label className="form-label">Lesson title</label>
                      <input className="input" name="title" value={lessonForm.title} onChange={handleLessonChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="input" name="description" value={lessonForm.description} onChange={handleLessonChange} rows={2} />
                    </div>
                    <div className="cf-row">
                      <div className="form-group">
                        <label className="form-label">Duration (seconds)</label>
                        <input className="input" name="duration" value={lessonForm.duration} onChange={handleLessonChange} type="number" min="0" />
                      </div>
                      <div className="form-group" style={{ alignItems: "center" }}>
                        <label className="free-check">
                          <input type="checkbox" name="is_preview" checked={lessonForm.is_preview} onChange={handleLessonChange} />
                          <span>Preview lesson</span>
                        </label>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={savingLesson}>
                      {savingLesson ? "Saving…" : "Add lesson"}
                    </button>
                  </form>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 320 }}>
                <h4>Assignments</h4>
                {selectedCourse.assignments?.length ? (
                  <div className="assignment-list-panel">
                    {selectedCourse.assignments.map((assignment) => (
                      <div key={assignment.id} className="assignment-row" style={{ padding: "1rem", borderBottom: "1px solid #eef2f7" }}>
                        <strong>{assignment.title}</strong>
                        <p style={{ margin: "0.25rem 0" }}>{assignment.description || "No description."}</p>
                        <small>{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "No due date"}</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dash-empty" style={{ padding: "1rem" }}>
                    <div className="empty-icon">📝</div>
                    <h3>No assignments yet</h3>
                    <p>Create a new assignment for this course.</p>
                  </div>
                )}

                <div className="card" style={{ marginTop: "1rem", padding: "1rem" }}>
                  <h4>Add assignment</h4>
                  <form onSubmit={handleCreateAssignment}>
                    <div className="form-group">
                      <label className="form-label">Assignment title</label>
                      <input className="input" name="title" value={assignmentForm.title} onChange={handleAssignmentChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="input" name="description" value={assignmentForm.description} onChange={handleAssignmentChange} rows={2} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Due date</label>
                      <input className="input" type="date" name="due_date" value={assignmentForm.due_date} onChange={handleAssignmentChange} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={savingAssignment}>
                      {savingAssignment ? "Saving…" : "Add assignment"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorPanel;
