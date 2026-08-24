import { useEffect, useState } from "react";
import { getAdminCages, getAdminDevices } from "../../api/admin";
import SmartThingsDeviceManager from "../../components/smartthings/SmartThingsDeviceManager";

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function displayValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "" || value === "-") {
    return fallback;
  }

  return value;
}

function displayStatus(status) {
  if (status === "OCCUPIED") return "입실 중";
  if (status === "AVAILABLE") return "사용 가능";
  if (status === "정상") return "정상";
  return displayValue(status);
}

function getDeviceId(device) {
  return device.deviceId ?? device.raspberryPiId ?? device.id;
}

function getFacilityName(device) {
  return device.facilityName ?? device.facility?.facilityName ?? device.facility?.name;
}

function getCageRawName(device) {
  return device.cageName ?? device.cage?.name;
}

function getCageNumber(device) {
  return device.cageNumber ?? device.cage?.cageNumber;
}

function getCageLabel(device) {
  const cageNumber = getCageNumber(device);

  if (cageNumber) {
    return {
      label: cageNumber,
      title: String(cageNumber),
    };
  }

  const cageName = getCageRawName(device);

  if (!cageName) {
    return {
      label: "미지정 케이지",
      title: "미지정 케이지",
    };
  }

  const cageNameText = String(cageName);
  const uuidMatch = cageNameText.match(UUID_PATTERN);

  if (uuidMatch) {
    const shortId = uuidMatch[0].slice(0, 8);

    return {
      label: `케이지 ${shortId}...`,
      title: cageNameText,
    };
  }

  if (cageNameText.length > 24) {
    return {
      label: `${cageNameText.slice(0, 20)}...`,
      title: cageNameText,
    };
  }

  return {
    label: cageNameText,
    title: cageNameText,
  };
}

function getDeviceStatus(device) {
  const rawStatus = displayValue(device.status, "");

  if (rawStatus) {
    const normalizedStatus = String(rawStatus).toUpperCase();

    if (["ONLINE", "ACTIVE", "CONNECTED", "RUNNING"].includes(normalizedStatus)) {
      return "정상";
    }

    if (
      ["OFFLINE", "INACTIVE", "DISCONNECTED", "STOPPED", "ERROR"].includes(
        normalizedStatus
      )
    ) {
      return "점검 필요";
    }

    return rawStatus;
  }

  if (device.isActive === true || device.isActive === "true") return "정상";
  if (device.isActive === false || device.isActive === "false") return "점검 필요";

  return "-";
}

function getStatusBadge(status) {
  if (status === "AVAILABLE" || status === "ACTIVE" || status === "정상") {
    return "badge green";
  }
  if (status === "OCCUPIED" || status === "IN_USE") return "badge blue";
  if (status === "점검 필요") return "badge red";
  return "badge blue";
}

function TruncatedValue({ value, fallback = "-" }) {
  const displayText = displayValue(value, fallback);

  return (
    <strong className="truncate-value" title={String(displayText)}>
      {displayText}
    </strong>
  );
}

function AdminDevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchDevices() {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getAdminDevices();
        setDevices(toArray(data));
      } catch (error) {
        console.error("관리자 장비 조회 실패:", error);
        setErrorMessage("데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchDevices();
  }, []);

  return (
    <div className="admin-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Device Management</span>
          <h1>전체 장비 관리</h1>
          <p>관리자 API에서 조회한 라즈베리파이 장비 정보를 표시합니다.</p>
        </div>

        <button className="primary-button" disabled>
          기기 등록
        </button>
      </section>

      <section className="admin-card">
        <div className="section-header">
          <div>
            <h2>전체 장비 목록</h2>
            <p>라즈베리파이 장비의 연결 시설, 케이지, 상태를 확인합니다.</p>
          </div>
          <span className="count-badge">{devices.length}개</span>
        </div>

        {loading && <p>불러오는 중...</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}

        {!loading && !errorMessage && devices.length === 0 && (
          <p>등록된 장비가 없습니다.</p>
        )}

        {!loading && !errorMessage && devices.length > 0 && (
          <div className="device-grid">
            {devices.map((device, index) => {
              const status = getDeviceStatus(device);
              const deviceId = getDeviceId(device);
              const cageLabel = getCageLabel(device);

              return (
                <article
                  className="device-card"
                  key={deviceId ?? `device-${index}`}
                >
                  <div className="device-card-top">
                    <div>
                      <span className="eyebrow">Device</span>
                      <h3 title={String(displayValue(deviceId))}>
                        {displayValue(deviceId)}
                      </h3>
                    </div>

                    <span className={getStatusBadge(status)}>
                      {displayStatus(status)}
                    </span>
                  </div>

                  <div className="device-info-list">
                    <div>
                      <span>장비 ID</span>
                      <TruncatedValue value={deviceId} />
                    </div>
                    <div>
                      <span>연결 시설</span>
                      <strong>{displayValue(getFacilityName(device), "시설 미연결")}</strong>
                    </div>
                    <div>
                      <span>연결 케이지</span>
                      <strong className="truncate-value" title={cageLabel.title}>
                        {cageLabel.label}
                      </strong>
                    </div>
                    <div>
                      <span>MAC 주소</span>
                      <TruncatedValue value={device.macAddress} />
                    </div>
                    <div>
                      <span>최근 IP</span>
                      <strong>{displayValue(device.lastIp ?? device.ipAddress)}</strong>
                    </div>
                    <div>
                      <span>마지막 통신</span>
                      <strong>
                        {displayValue(
                          device.lastPing ??
                            device.lastSeenAt ??
                            device.updatedAt ??
                            device.createdAt
                        )}
                      </strong>
                    </div>
                    <div>
                      <span>상태</span>
                      <strong>{displayStatus(status)}</strong>
                    </div>
                  </div>

                  <p className="device-assignment-note">
                    연결 정보는 케이지 관리에서 수정할 수 있습니다.
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="admin-card">
        <SmartThingsDeviceManager loadCages={getAdminCages} />
      </section>
    </div>
  );
}

export default AdminDevicesPage;
