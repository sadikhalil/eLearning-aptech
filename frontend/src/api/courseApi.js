import api from "./axiosInstance";

export const courseApi = {
  // Public
  list:   (params)        => api.get("/courses", { params }),
  getOne: (id)            => api.get(`/courses/${id}`),
  myCourses: ()            => api.get("/courses/my-courses"),
  getCourseStudents: (courseId) => api.get(`/courses/${courseId}/students`),

  // Instructor / Admin
  create: (data)          => api.post("/courses", data),
  update: (id, data)      => api.put(`/courses/${id}`, data),
  delete: (id)            => api.delete(`/courses/${id}`),

  // File uploads
  uploadThumbnail: (id, file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/courses/${id}/thumbnail`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Lessons
  addLesson: (courseId, data)            => api.post(`/courses/${courseId}/lessons`, data),
  uploadVideo: (courseId, lessonId, file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/courses/${courseId}/lessons/${lessonId}/video`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Assignments
  getAssignments: (courseId)           => api.get(`/courses/${courseId}/assignments`),
  createAssignment: (courseId, data)   => api.post(`/courses/${courseId}/assignments`, data),
};
