import { useState, useEffect, useCallback } from "react";
import { courseApi } from "../api/courseApi";

/**
 * Hook to fetch and manage course list with filters.
 * Usage:
 *   const { courses, loading, error, refetch } = useCourses({ category: "Design" });
 */
export const useCourses = (filters = {}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    courseApi.list(filters)
      .then(r => setCourses(r.data))
      .catch(e => setError(e.response?.data?.detail || "Failed to load courses."))
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { courses, loading, error, refetch: fetch };
};

/**
 * Hook to fetch a single course by ID.
 * Usage:
 *   const { course, loading, error } = useCourse(id);
 */
export const useCourse = (id) => {
  const [course,  setCourse]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    courseApi.getOne(id)
      .then(r => setCourse(r.data))
      .catch(e => setError(e.response?.data?.detail || "Course not found."))
      .finally(() => setLoading(false));
  }, [id]);

  return { course, loading, error };
};
