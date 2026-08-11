import { springApi } from "./client";

export function normalizeOwnerCage(cage = {}) {
  return {
    ...cage,
    id: String(cage.sessionId ?? cage.cageId ?? ""),
    sessionId: cage.sessionId == null ? null : Number(cage.sessionId),
    petName: cage.petName || cage.pet?.name || "반려동물",
    petBreed: cage.petBreed || cage.breed || cage.pet?.breed || "",
    birthDate: cage.birthDate || cage.pet?.birthDate || "",
    medicalNote: cage.medicalNote || cage.pet?.medicalNote || "",
    cageName: cage.cageName || cage.name || "케이지 정보 없음",
    facilityName: cage.facilityName || "시설 정보 없음",
    status: cage.status || "UNKNOWN",
  };
}

export function normalizeSessionLog(log = {}) {
  return {
    ...log,
    id: log.id ?? `${log.type || "LOG"}-${log.createdAt || "unknown"}`,
    type: log.type || "LOG",
    message: log.message || "로그 메시지가 없습니다.",
    temperature: log.temperature ?? null,
    humidity: log.humidity ?? null,
    createdAt: log.createdAt || "",
  };
}

export async function getMyCages() {
  const { data } = await springApi.get("/api/owners/me/cages");
  return (Array.isArray(data) ? data : []).map(normalizeOwnerCage);
}

export async function verifyAccessCode(accessCode) {
  const { data } = await springApi.post(
    "/api/admission-sessions/access-code/verify",
    { accessCode: String(accessCode) }
  );
  return data;
}

export async function getSessionLogs(sessionId) {
  const { data } = await springApi.get(
    `/api/admission-sessions/${Number(sessionId)}/logs`
  );
  return (Array.isArray(data) ? data : []).map(normalizeSessionLog);
}
