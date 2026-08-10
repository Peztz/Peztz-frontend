import { springApi } from "./client";

export async function getMyCameras() {
  const { data } = await springApi.get("/api/cameras/my");
  return data;
}

export async function getCameraRuntimeStatus(cameraId) {
  const { data } = await springApi.get(
    `/api/cameras/${cameraId}/runtime-status`
  );
  return data;
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
          runtime: {
            cameraId: camera.cameraId,
            status: camera.streamStatus || "OFFLINE",
            playbackUrl: null,
          },
        };
      }
    })
  );
}
