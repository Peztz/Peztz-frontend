import { buildPlaybackUrl, springApi } from "./client";

export function normalizeCamera(camera = {}) {
  return {
    ...camera,
    id: camera.cameraId ?? camera.id,
    cameraId: camera.cameraId ?? camera.id,
    name: camera.name || camera.cameraName || "카메라",
    status: camera.status || "UNKNOWN",
    streamStatus: camera.streamStatus || "UNKNOWN",
  };
}

export function normalizeCameraRuntimeStatus(status = {}) {
  return {
    ...status,
    cameraId: status.cameraId,
    status: status.status || "UNKNOWN",
    streamStatus: status.streamStatus || status.status || "UNKNOWN",
    playbackUrl: buildPlaybackUrl(status.playbackUrl),
    message: status.message || "",
  };
}

export async function getMyCameras() {
  const { data } = await springApi.get("/api/cameras/my");

  return (Array.isArray(data) ? data : []).map(normalizeCamera);
}

export async function getCameraRuntimeStatus(cameraId) {
  const { data } = await springApi.get(
    `/api/cameras/${cameraId}/runtime-status`
  );

  return normalizeCameraRuntimeStatus(data);
}

export async function getMyCamerasWithRuntime() {
  const cameras = await getMyCameras();

  return Promise.all(
    cameras.map(async (camera) => {
      try {
        const runtime = await getCameraRuntimeStatus(camera.cameraId);
        return { ...camera, runtime };
      } catch {
        return {
          ...camera,
          runtime: normalizeCameraRuntimeStatus({
            cameraId: camera.cameraId,
            status: camera.streamStatus || "OFFLINE",
          }),
        };
      }
    })
  );
}
