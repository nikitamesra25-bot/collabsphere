const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

const api = {
  register: (userData) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (userData) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getMe: () => request("/auth/me"),

  getProjects: () => request("/projects"),

  createProject: (projectData) =>
    request("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    }),

  getProject: (id) => request(`/projects/${id}`),

  updateProject: (id, projectData) =>
    request(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(projectData),
    }),

  deleteProject: (id) =>
    request(`/projects/${id}`, {
      method: "DELETE",
    }),

  getPublicProject: (slug) =>
    request(`/projects/public/${slug}`),

  getNotes: (projectId) =>
    request(`/notes/${projectId}`),

  createNote: (noteData) =>
    request("/notes", {
      method: "POST",
      body: JSON.stringify(noteData),
    }),

  updateNote: (id, noteData) =>
    request(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(noteData),
    }),

  deleteNote: (id) =>
    request(`/notes/${id}`, {
      method: "DELETE",
    }),

  getFiles: (projectId) =>
    request(`/files/${projectId}`),

  uploadFile: (formData) =>
    request("/files/upload", {
      method: "POST",
      body: formData,
    }),

  deleteFile: (id) =>
    request(`/files/${id}`, {
      method: "DELETE",
    }),

  askGemini: (prompt) =>
    request("/gemini/ask", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),
};

export default api;