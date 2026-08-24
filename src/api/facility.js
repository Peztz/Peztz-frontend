import { springApi } from "./client";

// TODO: Replace this test default with the facilityId assigned to the logged-in facility account.
export const DEFAULT_FACILITY_ID = "11111111-1111-1111-1111-111111111111";

function normalizeFacilityLog(log = {}) {
  return {
    ...log,
    id: log.logId ?? log.id,
    logId: log.logId ?? log.id,
    type: String(log.type || "OTHER").toUpperCase(),
    category: String(log.category || "OTHER").toUpperCase(),
    level: String(log.level || "NORMAL").toUpperCase(),
    message: log.message || "",
    createdAt: log.createdAt || "",
  };
}

export async function getAllCages() {
  const { data } = await springApi.get("/api/cages");
  return data;
}

export async function getFacilityCages(facilityId = DEFAULT_FACILITY_ID) {
  const { data } = await springApi.get(`/api/facilities/${facilityId}/cages`);
  return data;
}

export async function getFacilityLogs(
  facilityId = DEFAULT_FACILITY_ID,
  limit = 100
) {
  const { data } = await springApi.get(`/api/facilities/${facilityId}/logs`, {
    params: { limit },
  });
  return (Array.isArray(data) ? data : []).map(normalizeFacilityLog);
}

export async function createFacilityCage(
  payload,
  facilityId = DEFAULT_FACILITY_ID
) {
  const { data } = await springApi.post(
    `/api/facilities/${facilityId}/cages`,
    payload
  );
  return data;
}

export async function updateFacilityCage(
  facilityId = DEFAULT_FACILITY_ID,
  cageId,
  payload
) {
  const { data } = await springApi.patch(
    `/api/facilities/${facilityId}/cages/${cageId}`,
    payload
  );
  return data;
}

export async function getFacilityCameras(facilityId = DEFAULT_FACILITY_ID) {
  const { data } = await springApi.get(`/api/facilities/${facilityId}/cameras`);
  return data;
}

export async function upsertFacilityCamera(
  cageId,
  payload,
  facilityId = DEFAULT_FACILITY_ID
) {
  const { data } = await springApi.put(
    `/api/facilities/${facilityId}/cages/${cageId}/camera`,
    payload
  );
  return data;
}

export async function getFacilityCameraRuntimeStatus(
  cameraId,
  facilityId = DEFAULT_FACILITY_ID
) {
  const { data } = await springApi.get(
    `/api/facilities/${facilityId}/cameras/${cameraId}/runtime-status`
  );
  return data;
}

export async function getOwnerPetsByEmail(
  ownerEmail,
  facilityId = DEFAULT_FACILITY_ID
) {
  const { data } = await springApi.get(
    `/api/facilities/${facilityId}/owners/pets`,
    { params: { email: ownerEmail } }
  );
  return data;
}

export async function createFacilityAdmissionSession(
  payload,
  facilityId = DEFAULT_FACILITY_ID
) {
  const { data } = await springApi.post(
    `/api/facilities/${facilityId}/admission-sessions`,
    {
      ownerEmail: String(payload.ownerEmail),
      petId: payload.petId,
      cageId: payload.cageId,
    }
  );
  return {
    ...data,
    sessionId: Number(data.sessionId),
    accessCode: String(data.accessCode),
  };
}

export async function getFacilityActiveAdmissions(
  facilityId = DEFAULT_FACILITY_ID
) {
  const { data } = await springApi.get(
    `/api/facilities/${facilityId}/admission-sessions`,
    { params: { status: "ACTIVE" } }
  );

  return data.map((session) => ({
    ...session,
    sessionId: Number(session.sessionId),
    accessCode: String(session.accessCode),
  }));
}

export async function getFacilityEndedAdmissions(
  facilityId = DEFAULT_FACILITY_ID
) {
  const { data } = await springApi.get(
    `/api/facilities/${facilityId}/admission-sessions`,
    { params: { status: "ENDED" } }
  );

  return data.map((session) => ({
    ...session,
    sessionId: Number(session.sessionId),
    accessCode: String(session.accessCode),
  }));
}

export async function endFacilityAdmissionSession(
  sessionId,
  facilityId = DEFAULT_FACILITY_ID
) {
  const { data } = await springApi.patch(
    `/api/facilities/${facilityId}/admission-sessions/${Number(sessionId)}/end`
  );

  return {
    ...data,
    sessionId: Number(data.sessionId),
    accessCode: String(data.accessCode),
  };
}
