import springApi from "./client";

export async function getAdminSummary() {
  const { data } = await springApi.get("/api/admin/summary");
  return data;
}

export async function getAdminFacilities() {
  const { data } = await springApi.get("/api/admin/facilities");
  return data;
}

export async function getAdminCages() {
  const { data } = await springApi.get("/api/admin/cages");
  return data;
}

export async function updateAdminCageAssignment(cageId, payload) {
  const { data } = await springApi.patch(
    `/api/admin/cages/${cageId}/assignment`,
    payload
  );
  return data;
}

export async function getAdminDevices() {
  const { data } = await springApi.get("/api/admin/devices");
  return data;
}

export async function getAdminUsers() {
  const { data } = await springApi.get("/api/admin/users");
  return data;
}
