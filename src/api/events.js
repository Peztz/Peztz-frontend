import { springApi } from "./client";

export function normalizePetEvent(event = {}) {
  return {
    ...event,
    id: event.eventId ?? event.id,
    eventId: event.eventId ?? event.id,
    type: event.eventType || event.type || "기타",
    eventType: event.eventType || event.type || "기타",
    confidence: event.confidence ?? null,
    occurredAt: event.occurredAt || event.createdAt || event.clipStartAt || "",
    createdAt: event.createdAt || event.occurredAt || event.clipStartAt || "",
    thumbnailUrl: event.thumbnailUrl || "",
    videoUrl: event.videoUrl || "",
    petName: event.petName || "반려동물",
    cameraName: event.cameraName || "카메라 정보 없음",
  };
}

export async function getMyPetEvents(petId) {
  const { data } = await springApi.get("/api/pet-events/my", {
    params: petId ? { petId } : undefined,
  });
  return (Array.isArray(data) ? data : []).map(normalizePetEvent);
}

export async function getPetEvent(eventId) {
  const { data } = await springApi.get(`/api/pet-events/${eventId}`);
  return normalizePetEvent(data);
}
