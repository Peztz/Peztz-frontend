import { springApi } from "./client";

export function normalizeSmartThingsDevice(device = {}) {
  return {
    ...device,
    id: device.deviceId ?? device.id,
    deviceId: device.deviceId ?? device.id,
    displayName: device.label || device.name || "SmartThings 장치",
    manufacturerName: device.manufacturerName || "",
  };
}

export async function getSmartThingsDevices() {
  const { data } = await springApi.get("/api/smartthings/devices");
  const items = Array.isArray(data) ? data : data?.items;
  return (Array.isArray(items) ? items : []).map(normalizeSmartThingsDevice);
}

export async function getSmartThingsDeviceStatus(deviceId) {
  const { data } = await springApi.get(`/api/smartthings/devices/${deviceId}/status`);
  return { ...data, deviceId: data?.deviceId || deviceId, components: data?.components || {} };
}
