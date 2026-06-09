import { useEffect, useState } from "react";
import { getAdminDevices } from "../../api/admin";

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
  if (status === "정상") return "badge green";
  if (status === "점검 필요") return "badge red";
  return "badge blue";
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

  const handleRegisterDevice = () => {
    alert("준비 중입니다.");
  };

  return (
    <div className="admin-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Device Management</span>
          <h1>전체 장비 관리</h1>
          <p>백엔드 관리자 API에서 조회한 라즈베리파이 장비 정보를 표시합니다.</p>
        </div>

        <button className="primary-button" onClick={handleRegisterDevice}>
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

              return (
                <article
                  className="device-card"
                  key={device.deviceId ?? device.id ?? `device-${index}`}
                >
                  <div className="device-card-top">
                    <div>
                      <h3>
                        {displayValue(
                          device.deviceId ?? device.raspberryPiId ?? device.id
                        )}
                      </h3>
                      <p>
                        {displayValue(
                          device.facilityName ?? device.facility?.name,
                          "시설 미연결"
                        )}{" "}
                        / 케이지{" "}
                        {displayValue(
                          device.cageNumber ??
                            device.cageName ??
                            device.cage?.cageNumber
                        )}
                      </p>
                    </div>

                    <span className={getStatusBadge(status)}>{status}</span>
                  </div>

                  <div className="device-info-list">
                    <div>
                      <span>MAC 주소</span>
                      <strong>{displayValue(device.macAddress)}</strong>
                    </div>
                    <div>
                      <span>최근 IP</span>
                      <strong>
                        {displayValue(device.lastIp ?? device.ipAddress)}
                      </strong>
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
                  </div>

                  <button
                    className="mini-button full"
                    onClick={handleRegisterDevice}
                  >
                    연결 정보 수정
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDevicesPage;
