import { springApi, toBackendRole } from "./client";

export async function signup(payload) {
  const { data } = await springApi.post("/api/auth/signup", {
    ...payload,
    role: toBackendRole(payload.role),
  });
  return data;
}

export async function login(payload) {
  const { data } = await springApi.post("/api/auth/login", payload);
  return data;
}

export async function getMe() {
  const { data } = await springApi.get("/api/auth/me");
  return data;
}
