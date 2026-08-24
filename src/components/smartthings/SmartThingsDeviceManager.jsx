import { useCallback, useEffect, useMemo, useState } from "react";
import StatusChip from "../StatusChip";
import { disconnectSmartThingsDevice, getSmartThingsDevices, registerSmartThingsDevice, syncSmartThingsDevice } from "../../api/smartthings";

const TYPE_LABELS = { CONTACT: "문열림 센서", ILLUMINANCE: "조도 센서", TEMPERATURE_HUMIDITY: "온습도 센서" };

function toArray(value) {
  if (Array.isArray(value)) return value;
  return value?.content ?? value?.items ?? value?.data ?? [];
}
function cageId(cage) { return cage.cageId ?? cage.id; }
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
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}
function apiError(error, fallback) { return error?.response?.data?.message || error?.response?.data?.code || fallback; }
function offlineError(error) {
  const value = `${error?.response?.data?.message ?? ""} ${error?.response?.data?.code ?? ""}`.toLowerCase();
  return value.includes("offline") || value.includes("station");
}

function SmartThingsDeviceManager({ loadCages }) {
  const [devices, setDevices] = useState([]);
  const [cages, setCages] = useState([]);
  const [forms, setForms] = useState({});
  const [actions, setActions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const [deviceData, cageData] = await Promise.all([getSmartThingsDevices(), loadCages()]);
      setDevices(deviceData.filter((device) => device.supportedTypes?.length));
      setCages(toArray(cageData));
    } catch (requestError) {
      setError(apiError(requestError, "SmartThings 센서 목록을 불러오지 못했습니다"));
    } finally { setLoading(false); }
  }, [loadCages]);

  useEffect(() => {
    const timeoutId = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timeoutId);
  }, [refresh]);
  const cageMap = useMemo(() => new Map(cages.map((cage) => [String(cageId(cage)), cage])), [cages]);
  const setAction = (id, action) => setActions((current) => ({ ...current, [id]: action }));
  function updateForm(device, field, value) {
    const types = device.supportedTypes ?? [];
    setForms((current) => ({ ...current, [device.deviceId]: { cageId: "", deviceType: types.length === 1 ? types[0] : "", label: "", ...current[device.deviceId], [field]: value } }));
  }

  async function register(device) {
    const form = forms[device.deviceId] ?? {};
    try {
      setAction(device.deviceId, "register"); setNotice("");
      await registerSmartThingsDevice(form.cageId, { deviceId: device.deviceId, deviceType: form.deviceType, label: form.label?.trim() || undefined });
      setNotice(`${device.displayName} 센서를 등록했습니다.`); await refresh();
    } catch (requestError) { setError(apiError(requestError, "센서 등록에 실패했습니다")); }
    finally { setAction(device.deviceId, ""); }
  }
  async function sync(device) {
    try {
      setAction(device.deviceId, "sync"); setNotice("");
      await syncSmartThingsDevice(device.deviceId); setNotice(`${device.displayName} 센서를 동기화했습니다.`); await refresh();
    } catch (requestError) {
      setError(offlineError(requestError) ? "센서가 오프라인입니다. Station 연결 상태를 확인해주세요." : apiError(requestError, "센서 동기화에 실패했습니다"));
    } finally { setAction(device.deviceId, ""); }
  }
  async function disconnect(device) {
    if (!window.confirm("센서 연결을 해제하시겠습니까? 기존 측정 이력은 유지됩니다")) return;
    try {
      setAction(device.deviceId, "disconnect"); setNotice("");
      await disconnectSmartThingsDevice(device.mapping.cageId, device.deviceId);
      setNotice(`${device.displayName} 센서 연결을 해제했습니다. 측정 이력은 유지됩니다.`); await refresh();
    } catch (requestError) { setError(apiError(requestError, "센서 연결 해제에 실패했습니다")); }
    finally { setAction(device.deviceId, ""); }
  }

  return <section className="smartthings-manager">
    <div className="section-header"><div><h2>SmartThings 센서 관리</h2><p>지원 센서를 케이지에 등록하고 연결 상태를 동기화합니다.</p></div><span className="count-badge">{devices.length}개</span></div>
    {notice && <p className="smartthings-notice success">{notice}</p>}
    {error && <p className="smartthings-notice error">{error}</p>}
    {loading && <p className="smartthings-empty">센서 목록을 불러오는 중...</p>}
    {!loading && !error && devices.length === 0 && <p className="smartthings-empty">사용 가능한 SmartThings 센서가 없습니다.</p>}
    {!loading && devices.length > 0 && <div className="smartthings-grid">{devices.map((device) => {
      const mapping = device.mapping;
      const registered = device.registered === true || Boolean(mapping);
      const types = device.supportedTypes ?? [];
      const form = forms[device.deviceId] ?? { cageId: "", deviceType: types.length === 1 ? types[0] : "", label: "" };
      const action = actions[device.deviceId];
      return <article className="device-card smartthings-device-card" key={device.deviceId}>
        <div className="device-card-top"><div><span className="eyebrow">SmartThings Sensor</span><h3>{device.displayName}</h3><p className="smartthings-device-id" title={device.deviceId}>{device.deviceId}</p></div><StatusChip tone={registered ? "info" : "neutral"}>{registered ? "등록됨" : "미등록"}</StatusChip></div>
        <div className="smartthings-type-list">{types.map((type) => <span className="badge blue" key={type}>{TYPE_LABELS[type] ?? type}</span>)}</div>
        {registered ? <>
          <div className="device-info-list">
            <div><span>연결 케이지</span><strong>{cageLabel(cageMap.get(String(mapping?.cageId)), mapping?.cageName ?? mapping?.cageId)}</strong></div>
            <div><span>센서 타입</span><strong>{TYPE_LABELS[mapping?.deviceType] ?? mapping?.deviceType ?? "-"}</strong></div>
            <div><span>연결 상태</span><StatusChip dot tone={mapping?.online ? "success" : "neutral"}>{mapping?.online ? "온라인" : "오프라인"}</StatusChip></div>
            <div><span>배터리</span><strong>{mapping?.battery == null ? "확인 불가" : `${mapping.battery}%`}</strong></div>
            <div><span>마지막 확인</span><strong>{formatTime(mapping?.lastSeenAt)}</strong></div>
          </div>
          <div className="smartthings-actions"><button className="secondary-button" disabled={Boolean(action)} onClick={() => sync(device)}>{action === "sync" ? "동기화 중..." : "즉시 동기화"}</button><button className="mini-button danger" disabled={Boolean(action)} onClick={() => disconnect(device)}>{action === "disconnect" ? "해제 중..." : "연결 해제"}</button></div>
        </> : <div className="smartthings-register-form">
          <label>케이지<select value={form.cageId} onChange={(event) => updateForm(device, "cageId", event.target.value)}><option value="">케이지 선택</option>{cages.map((cage) => <option key={cageId(cage)} value={cageId(cage)}>{cageLabel(cage, cageId(cage))}</option>)}</select></label>
          <label>센서 타입<select value={form.deviceType} onChange={(event) => updateForm(device, "deviceType", event.target.value)}><option value="">타입 선택</option>{types.map((type) => <option key={type} value={type}>{TYPE_LABELS[type] ?? type}</option>)}</select></label>
          <label className="full">라벨 (선택)<input value={form.label} onChange={(event) => updateForm(device, "label", event.target.value)} placeholder="예: 1번 케이지 문 센서" /></label>
          <button className="primary-button full" disabled={!form.cageId || !form.deviceType || Boolean(action)} onClick={() => register(device)}>{action === "register" ? "등록 중..." : "센서 등록"}</button>
        </div>}
      </article>;
    })}</div>}
    <p className="device-assignment-note">오프라인 센서도 등록할 수 있습니다. Station이 꺼져 있다면 연결 상태를 확인해주세요.</p>
  </section>;
}

export default SmartThingsDeviceManager;
