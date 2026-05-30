import api from "./axiosInstance";

export const progressApi = {
  // Called by video player every few seconds
  update: (lessonId, data) =>
    api.post(`/progress/${lessonId}`, data),

  // Full course progress breakdown
  getCourse: (courseId) =>
    api.get(`/progress/course/${courseId}`),
};

export const enrollmentApi = {
  enroll:       (courseId) => api.post(`/enrollments/${courseId}`),
  unenroll:     (courseId) => api.delete(`/enrollments/${courseId}`),
  myCourses:    ()         => api.get("/enrollments/my-courses"),
  checkStatus:  (courseId) => api.get(`/enrollments/check/${courseId}`),
};
