import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/api/v1/auth/register", data),
  login: (data) => api.post("/api/v1/auth/login", data),
  getCurrentUser: () => api.get("/api/v1/auth/me"),
};

// Chats API
export const chatsAPI = {
  createChat: (formData) =>
    api.post("/api/v1/chats/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  listChats: () => api.get("/api/v1/chats/"),
  getChat: (id) => api.get(`/api/v1/chats/${id}`),
  updateChat: (id, data) => api.put(`/api/v1/chats/${id}`, data),
  deleteChat: (id) => api.delete(`/api/v1/chats/${id}`),
  sendMessage: (id, data) => api.post(`/api/v1/chats/${id}/messages`, data),
  getMessages: (id) => api.get(`/api/v1/chats/${id}/messages`),
  uploadToChat: (id, formData) =>
    api.post(`/api/v1/chats/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Collections API
export const collectionsAPI = {
  createCollection: (data) => api.post("/api/v1/documents/collections", data),
  listCollections: () => api.get("/api/v1/documents/collections"),
  getCollection: (id) => api.get(`/api/v1/documents/collections/${id}`),
  deleteCollection: (id) => api.delete(`/api/v1/documents/collections/${id}`),
  uploadDocuments: (id, formData) =>
    api.post(`/api/v1/documents/collections/${id}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  listDocuments: (id) =>
    api.get(`/api/v1/documents/collections/${id}/documents`),
  deleteDocument: (id) => api.delete(`/api/v1/documents/${id}`),
};

export default api;
