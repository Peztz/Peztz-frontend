import { springApi } from "./client";

export async function getMyPets() {
  const { data } = await springApi.get("/api/pets/my");
  return data;
}

export async function createPet(payload) {
  const { data } = await springApi.post("/api/pets", payload);
  return data;
}

export async function updatePet(petId, payload) {
  const { data } = await springApi.put(`/api/pets/${petId}`, payload);
  return data;
}

export async function deletePet(petId) {
  await springApi.delete(`/api/pets/${petId}`);
}
