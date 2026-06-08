import { springApi } from "./client";

export async function getMyCages() {
  const { data } = await springApi.get("/api/owners/me/cages");
  return data;
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
  return data;
}

export async function getSessionDailyReport(sessionId, date) {
  const { data } = await springApi.get(
    `/api/admission-sessions/${Number(sessionId)}/daily-report`,
    { params: { date } }
  );
  return data;
}
