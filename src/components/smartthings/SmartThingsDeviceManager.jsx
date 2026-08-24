import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  disconnectSmartThingsDevice,
  getCageSmartThingsDevices,
  getLatestCageSmartThingsReadings,
  getSmartThingsDevices,
  registerSmartThingsDevice,
  syncSmartThingsDevice,
} from "../../api/smartthings";
import StatusChip from "../StatusChip";

const SENSOR_REFRESH_INTERVAL_MS = 15_000;
const TYPE_LABELS = {
  CONTACT: "문열림 센서",
  ILLUMINANCE: "조도 센서",
  TEMPERATURE_HUMIDITY: "온습도 센서",
};
const TYPE_ATTRIBUTES = {
  CONTACT: [{ attribute: "contact", label: "문 상태" }],
  ILLUMINANCE: [{ attribute: "illuminance", label: "현재 조도" }],
  TEMPERATURE_HUMIDITY: [
    { attribute: "temperature", label: "현재 온도" },
    { attribute: "humidity", label: "현재 습도" },
  ],
};
const CONTACT_LABELS = { open: "열림", closed: "닫힘" };

function toArray(value) {
  if (Array.isArray(value)) return value;
  return value?.content ?? value?.items ?? value?.data ?? [];
}

function cageId(cage) {
  return cage.cageId ?? cage.id;
}

function cageLabel(cage, fallback = "") {
  if (!cage) return fallback;
  const number = cage.cageNumber ?? cage.number;
  const name = cage.name ?? cage.cageName;
  return number && name ? `${number} · ${name}` : String(number ?? name ?? fallback);
}

function formatTime(value) {
  if (!value) return "확인 기록 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function apiError(error, fallback) {
  return error?.response?.data?.message || error?.response?.data?.code || fallback;
}

function offlineError(error) {
  const value = `${error?.response?.data?.message ?? ""} ${
    error?.response?.data?.code ?? ""
  }`.toLowerCase();
  return value.includes("offline") || value.includes("station");
}

function isRegistered(device) {
  return device.registered === true || Boolean(device.mapping);
}

function managementLabel(device) {
  return String(device.mapping?.label || device.displayName || "SmartThings 센서").trim();
}

function shortDeviceId(value) {
  const id = String(value || "");
  return id.length <= 16 ? id : `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function readingKey(deviceId, attribute) {
  return `${deviceId}:${attribute}`;
}

function formatReadingValue(attribute, reading) {
  if (!reading) return "측정값 없음";

  if (attribute === "contact") {
    const value = String(reading.stringValue ?? "").toLowerCase();
    return CONTACT_LABELS[value] ?? reading.stringValue ?? "측정값 없음";
  }

  if (reading.numericValue === null || reading.numericValue === undefined) {
    return reading.stringValue ?? "측정값 없음";
  }

  if (attribute === "temperature") return `${reading.numericValue}°C`;
  if (attribute === "humidity") return `${reading.numericValue}%`;
  if (attribute === "illuminance") return `${reading.numericValue} lux`;

  return `${reading.numericValue}${reading.unit ? ` ${reading.unit}` : ""}`;
}

function SensorReadingPanel({ device, latestReadings, loading }) {
  const deviceType = device.mapping?.deviceType;
  const attributes = TYPE_ATTRIBUTES[deviceType] ?? [];

  if (attributes.length === 0) return null;

  return (
    <section className="smartthings-reading-panel" aria-label="최신 센서 측정값">
      <div className="smartthings-reading-head">
        <strong>최신 측정값</strong>
        <span>{loading ? "확인 중..." : "15초 자동 갱신"}</span>
      </div>
      <div className="smartthings-reading-grid">
        {attributes.map(({ attribute, label }) => {
          const reading = latestReadings[readingKey(device.deviceId, attribute)];
          return (
            <div className="smartthings-reading-item" key={attribute}>
              <span>{label}</span>
              <strong>{formatReadingValue(attribute, reading)}</strong>
              <small>{reading ? formatTime(reading.measuredAt) : "측정 기록 없음"}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SmartThingsDeviceManager({ loadCages }) {
  const [devices, setDevices] = useState([]);
  const [cages, setCages] = useState([]);
  const [latestReadings, setLatestReadings] = useState({});
  const [forms, setForms] = useState({});
  const [actions, setActions] = useState({});
  const [loading, setLoading] = useState(true);
  const [readingsLoading, setReadingsLoading] = useState(false);
  const [error, setError] = useState("");
  const [readingsError, setReadingsError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [notice, setNotice] = useState("");
  const readingsRequestInFlight = useRef(false);
  const statusRequestInFlight = useRef(false);

  const loadLatestReadings = useCallback(async (deviceList, showLoading = false) => {
    if (readingsRequestInFlight.current) return;

    const registeredDevices = deviceList.filter(
      (device) => isRegistered(device) && device.mapping?.cageId
    );
    const activeDeviceIds = new Set(
      registeredDevices.map((device) => String(device.deviceId))
    );
    const cageIds = [
      ...new Set(
        registeredDevices.map((device) => String(device.mapping.cageId))
      ),
    ];

    if (cageIds.length === 0) {
      setLatestReadings({});
      setReadingsError("");
      return;
    }

    readingsRequestInFlight.current = true;
    if (showLoading) setReadingsLoading(true);

    try {
      const results = await Promise.allSettled(
        cageIds.map((id) => getLatestCageSmartThingsReadings(id))
      );
      const successfulResults = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      if (successfulResults.length === 0) {
        const firstFailure = results.find((result) => result.status === "rejected");
        throw firstFailure?.reason;
      }

      const nextReadings = {};
      successfulResults
        .flatMap((result) => result.readings)
        .filter((reading) => activeDeviceIds.has(String(reading.deviceId)))
        .forEach((reading) => {
          const key = readingKey(reading.deviceId, reading.attribute);
          const previous = nextReadings[key];
          if (
            !previous ||
            new Date(reading.measuredAt).getTime() >
              new Date(previous.measuredAt).getTime()
          ) {
            nextReadings[key] = reading;
          }
        });

      setLatestReadings(nextReadings);
      setReadingsError(
        successfulResults.length === results.length
          ? ""
          : "일부 케이지의 최신 측정값을 불러오지 못했습니다."
      );
    } catch (requestError) {
      setReadingsError(
        apiError(requestError, "최신 센서 측정값을 불러오지 못했습니다")
      );
    } finally {
      readingsRequestInFlight.current = false;
      if (showLoading) setReadingsLoading(false);
    }
  }, []);

  const loadDeviceStatuses = useCallback(async (deviceList) => {
    if (statusRequestInFlight.current) return;

    const cageIds = [
      ...new Set(
        deviceList
          .filter((device) => isRegistered(device) && device.mapping?.cageId)
          .map((device) => String(device.mapping.cageId))
      ),
    ];

    if (cageIds.length === 0) {
      setStatusError("");
      return;
    }

    statusRequestInFlight.current = true;
    try {
      const results = await Promise.allSettled(
        cageIds.map((id) => getCageSmartThingsDevices(id))
      );
      const fulfilledResults = results.filter(
        (result) => result.status === "fulfilled"
      );

      if (fulfilledResults.length === 0) {
        const firstFailure = results.find((result) => result.status === "rejected");
        throw firstFailure?.reason;
      }

      const successfulResults = fulfilledResults.flatMap((result) =>
        toArray(result.value)
      );

      const mappings = new Map(
        successfulResults.map((mapping) => [String(mapping.deviceId), mapping])
      );
      setDevices((current) =>
        current.map((device) => {
          const mapping = mappings.get(String(device.deviceId));
          if (!mapping) return device;
          return {
            ...device,
            registered: true,
            mapping: { ...device.mapping, ...mapping },
          };
        })
      );
      setStatusError(
        results.every((result) => result.status === "fulfilled")
          ? ""
          : "일부 센서의 연결 상태를 갱신하지 못했습니다."
      );
    } catch (requestError) {
      setStatusError(
        apiError(requestError, "센서 연결 상태를 갱신하지 못했습니다")
      );
    } finally {
      statusRequestInFlight.current = false;
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [deviceData, cageData] = await Promise.all([
        getSmartThingsDevices(),
        loadCages(),
      ]);
      const supportedDevices = deviceData.filter(
        (device) => device.supportedTypes?.length
      );
      setDevices(supportedDevices);
      setCages(toArray(cageData));
      await loadLatestReadings(supportedDevices, true);
    } catch (requestError) {
      setError(apiError(requestError, "SmartThings 센서 목록을 불러오지 못했습니다"));
    } finally {
      setLoading(false);
    }
  }, [loadCages, loadLatestReadings]);

  useEffect(() => {
    const timeoutId = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  useEffect(() => {
    if (loading || devices.length === 0) return undefined;

    const intervalId = window.setInterval(() => {
      loadLatestReadings(devices);
      loadDeviceStatuses(devices);
    }, SENSOR_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [devices, loadDeviceStatuses, loadLatestReadings, loading]);

  const cageMap = useMemo(
    () => new Map(cages.map((cage) => [String(cageId(cage)), cage])),
    [cages]
  );
  const setAction = (id, action) =>
    setActions((current) => ({ ...current, [id]: action }));

  function updateForm(device, field, value) {
    const types = device.supportedTypes ?? [];
    setForms((current) => ({
      ...current,
      [device.deviceId]: {
        cageId: "",
        deviceType: types.length === 1 ? types[0] : "",
        label: "",
        ...current[device.deviceId],
        [field]: value,
      },
    }));
  }

  async function register(device) {
    const form = forms[device.deviceId] ?? {};
    try {
      setAction(device.deviceId, "register");
      setNotice("");
      await registerSmartThingsDevice(form.cageId, {
        deviceId: device.deviceId,
        deviceType: form.deviceType,
        label: form.label?.trim() || undefined,
      });
      setNotice(`${device.displayName} 센서를 등록했습니다.`);
      await refresh();
    } catch (requestError) {
      setError(apiError(requestError, "센서 등록에 실패했습니다"));
    } finally {
      setAction(device.deviceId, "");
    }
  }

  async function sync(device) {
    try {
      setAction(device.deviceId, "sync");
      setNotice("");
      await syncSmartThingsDevice(device.deviceId);
      setNotice(`${device.displayName} 센서를 동기화했습니다.`);
      await refresh();
    } catch (requestError) {
      setError(
        offlineError(requestError)
          ? "센서가 오프라인입니다. Station 연결 상태를 확인해주세요."
          : apiError(requestError, "센서 동기화에 실패했습니다")
      );
      await loadDeviceStatuses(devices);
    } finally {
      setAction(device.deviceId, "");
    }
  }

  async function disconnect(device) {
    if (!window.confirm("센서 연결을 해제하시겠습니까? 기존 측정 이력은 유지됩니다")) {
      return;
    }
    try {
      setAction(device.deviceId, "disconnect");
      setNotice("");
      await disconnectSmartThingsDevice(device.mapping.cageId, device.deviceId);
      setNotice(`${device.displayName} 센서 연결을 해제했습니다. 측정 이력은 유지됩니다.`);
      await refresh();
    } catch (requestError) {
      setError(apiError(requestError, "센서 연결 해제에 실패했습니다"));
    } finally {
      setAction(device.deviceId, "");
    }
  }

  async function copyDeviceId(device) {
    try {
      await navigator.clipboard.writeText(device.deviceId);
      setError("");
      setNotice(`${managementLabel(device)} 기기 ID를 복사했습니다.`);
    } catch {
      setNotice("");
      setError("기기 ID를 복사하지 못했습니다. 브라우저 권한을 확인해주세요.");
    }
  }

  return (
    <section className="smartthings-manager">
      <div className="section-header">
        <div>
          <h2>SmartThings 센서 관리</h2>
          <p>지원 센서를 케이지에 등록하고 최신 측정값을 확인합니다.</p>
        </div>
        <div className="smartthings-header-actions">
          <span className="count-badge">{devices.length}개</span>
          <button className="mini-button" disabled={loading} onClick={refresh}>
            {loading ? "불러오는 중..." : "목록 새로고침"}
          </button>
        </div>
      </div>
      {notice && <p className="smartthings-notice success">{notice}</p>}
      {error && <p className="smartthings-notice error">{error}</p>}
      {readingsError && <p className="smartthings-notice error">{readingsError}</p>}
      {statusError && <p className="smartthings-notice error">{statusError}</p>}
      {loading && <p className="smartthings-empty">센서 목록을 불러오는 중...</p>}
      {!loading && !error && devices.length === 0 && (
        <p className="smartthings-empty">사용 가능한 SmartThings 센서가 없습니다.</p>
      )}
      {!loading && devices.length > 0 && (
        <div className="smartthings-grid">
          {devices.map((device) => {
            const mapping = device.mapping;
            const registered = isRegistered(device);
            const types = device.supportedTypes ?? [];
            const form = forms[device.deviceId] ?? {
              cageId: "",
              deviceType: types.length === 1 ? types[0] : "",
              label: "",
            };
            const action = actions[device.deviceId];
            const title = managementLabel(device);

            return (
              <article
                className="device-card smartthings-device-card"
                key={device.deviceId}
              >
                <div className="device-card-top">
                  <div>
                    <span className="eyebrow">SmartThings Sensor</span>
                    <h3 title={title}>{title}</h3>
                    <div className="smartthings-device-id-row" title={device.deviceId}>
                      <span>기기 ID</span>
                      <code>{shortDeviceId(device.deviceId)}</code>
                      <button
                        type="button"
                        className="smartthings-copy-button"
                        aria-label={`${title} 기기 ID 복사`}
                        onClick={() => copyDeviceId(device)}
                      >
                        복사
                      </button>
                    </div>
                  </div>
                  <StatusChip tone={registered ? "info" : "neutral"}>
                    {registered ? "등록됨" : "미등록"}
                  </StatusChip>
                </div>
                <div className="smartthings-type-list">
                  {types.map((type) => (
                    <span className="badge blue" key={type}>
                      {TYPE_LABELS[type] ?? type}
                    </span>
                  ))}
                </div>
                {registered ? (
                  <>
                    <SensorReadingPanel
                      device={device}
                      latestReadings={latestReadings}
                      loading={readingsLoading}
                    />
                    <div className="device-info-list">
                      <div>
                        <span>연결 케이지</span>
                        <strong>
                          {cageLabel(
                            cageMap.get(String(mapping?.cageId)),
                            mapping?.cageName ?? mapping?.cageId
                          )}
                        </strong>
                      </div>
                      <div>
                        <span>센서 타입</span>
                        <strong>
                          {TYPE_LABELS[mapping?.deviceType] ??
                            mapping?.deviceType ??
                            "-"}
                        </strong>
                      </div>
                      <div>
                        <span>연결 상태</span>
                        <StatusChip
                          className="smartthings-connection-chip"
                          dot
                          tone={mapping?.online ? "success" : "neutral"}
                        >
                          {mapping?.online ? "온라인" : "오프라인"}
                        </StatusChip>
                      </div>
                      <div>
                        <span>배터리</span>
                        <strong>
                          {mapping?.battery == null
                            ? "확인 불가"
                            : `${mapping.battery}%`}
                        </strong>
                      </div>
                      <div>
                        <span>마지막 확인</span>
                        <strong>{formatTime(mapping?.lastSeenAt)}</strong>
                      </div>
                    </div>
                    <div className="smartthings-actions">
                      <button
                        className="secondary-button"
                        disabled={Boolean(action)}
                        onClick={() => sync(device)}
                      >
                        {action === "sync" ? "동기화 중..." : "즉시 동기화"}
                      </button>
                      <button
                        className="mini-button danger"
                        disabled={Boolean(action)}
                        onClick={() => disconnect(device)}
                      >
                        {action === "disconnect" ? "해제 중..." : "연결 해제"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="smartthings-register-form">
                    <label>
                      케이지
                      <select
                        value={form.cageId}
                        onChange={(event) =>
                          updateForm(device, "cageId", event.target.value)
                        }
                      >
                        <option value="">케이지 선택</option>
                        {cages.map((cage) => (
                          <option key={cageId(cage)} value={cageId(cage)}>
                            {cageLabel(cage, cageId(cage))}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      센서 타입
                      <select
                        value={form.deviceType}
                        onChange={(event) =>
                          updateForm(device, "deviceType", event.target.value)
                        }
                      >
                        <option value="">타입 선택</option>
                        {types.map((type) => (
                          <option key={type} value={type}>
                            {TYPE_LABELS[type] ?? type}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="full">
                      라벨 (선택)
                      <input
                        value={form.label}
                        onChange={(event) =>
                          updateForm(device, "label", event.target.value)
                        }
                        placeholder="예: 1번 케이지 문 센서"
                      />
                    </label>
                    <button
                      className="primary-button full"
                      disabled={
                        !form.cageId || !form.deviceType || Boolean(action)
                      }
                      onClick={() => register(device)}
                    >
                      {action === "register" ? "등록 중..." : "센서 등록"}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
      <p className="device-assignment-note">
        측정값은 15초마다 자동으로 갱신됩니다. 오프라인 센서는 마지막 저장값을
        표시하며, Station이 꺼져 있다면 연결 상태를 확인해주세요.
      </p>
    </section>
  );
}

export default SmartThingsDeviceManager;
