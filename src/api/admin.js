import springApi from "./client";

export async function getAdminDevices() {
  const { data } = await springApi.get("/api/raspberrypis");
  return data;
}

export async function registerDevice(payload) {
  const { data } = await springApi.post("/api/raspberrypis/register", payload);
  return data;
}

export async function getAdminFacilities() {
  const { data } = await springApi.get("/api/facilities");
  return data;
}

export async function getAdminCages() {
  const { data } = await springApi.get("/api/cages");
  return data;
}