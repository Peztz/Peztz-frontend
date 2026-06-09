import axios from "axios";

export const TOKEN_KEY = "peztz_access_token";
export const USER_KEY = "peztz_user";
export const ROLE_KEY = "peztz_role";

export const springApi = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_SPRING_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function normalizeRole(role) {
  if (["HOSPITAL", "FACILITY", "FACILITY_MANAGER"].includes(role)) {
    return "FACILITY";
  }

  return role || "OWNER";
}

export function toBackendRole(role) {
  if (role === "FACILITY") return "FACILITY_MANAGER";
  return role;
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function saveAuth(accessToken, user) {
  if (accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
  }

  if (user) {
    const normalizedUser = {
      ...user,
      role: normalizeRole(user.role),
      backendRole: user.role,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    localStorage.setItem(ROLE_KEY, normalizedUser.role);
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function buildVideoUrl({ deviceId, videoUrl } = {}) {
  const videoBaseUrl =
    import.meta.env.VITE_VIDEO_BASE_URL ||
    import.meta.env.VITE_VIDEO_API_BASE_URL;
  const sourceUrl = videoUrl || "";
  const match = sourceUrl.match(/\/video\/([^/?#]+)/);

  if (deviceId) {
    return `${videoBaseUrl}/video/${deviceId}`;
  }

  if (match?.[1]) {
    return `${videoBaseUrl}/video/${match[1]}`;
  }

  return sourceUrl;
}

springApi.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

springApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default springApi;
