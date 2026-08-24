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

export async function getCageSmartThingsDevices(cageId) {
  const { data } = await springApi.get(
    `/api/smartthings/cages/${cageId}/devices`
  );
  return data;
}

export async function getLatestCageSmartThingsReadings(cageId) {
  const { data } = await springApi.get(
    `/api/smartthings/cages/${cageId}/readings/latest`
  );
  return {
    ...data,
    cageId: data?.cageId || cageId,
    readings: Array.isArray(data?.readings) ? data.readings : [],
  };
}

export function indexLatestSmartThingsReadings(readings = []) {
  return readings.reduce((latest, reading) => {
    if (!reading?.attribute) return latest;

    const previous = latest[reading.attribute];
    const previousTime = previous?.measuredAt
      ? new Date(previous.measuredAt).getTime()
      : Number.NEGATIVE_INFINITY;
    const currentTime = reading.measuredAt
      ? new Date(reading.measuredAt).getTime()
      : Number.NEGATIVE_INFINITY;

    if (!previous || currentTime > previousTime) {
      latest[reading.attribute] = reading;
    }
    return latest;
  }, {});
}

export async function registerSmartThingsDevice(cageId, payload) {
  const { data } = await springApi.post(
    `/api/smartthings/cages/${cageId}/devices`,
    payload
  );
  return data;
}

export async function disconnectSmartThingsDevice(cageId, deviceId) {
  const { data } = await springApi.delete(
    `/api/smartthings/cages/${cageId}/devices/${deviceId}`
  );
  return data;
}

export async function syncSmartThingsDevice(deviceId) {
  const { data } = await springApi.post(
    `/api/smartthings/devices/${deviceId}/sync`
  );
  return data;
}
