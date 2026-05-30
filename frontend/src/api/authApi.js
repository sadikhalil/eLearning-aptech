import api from "./axiosInstance";

export const authApi = {
  register: (data)        => api.post("/auth/register", data),
  login:    (data)        => api.post("/auth/login",    data),
  refresh:  (token)       => api.post("/auth/refresh",  { refresh_token: token }),
  getMe:    ()            => api.get("/auth/me"),
  logout:   ()            => api.post("/auth/logout"),
};
