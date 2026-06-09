import { useEffect, useState } from "react";
import { getAdminDevices, registerDevice } from "../../api/admin";

function AdminDevicesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [mac, setMac] = useState("");
  const [ip, setIp] = useState("");
  const [facility, setFacility] = useState("미연결");
  const [cage, setCage] = useState("");

  const fetchDevices = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getAdminDevices();
      setDevices(data);
    } catch (error) {
      console.error("기기 목록 조회 실패:", error);
      setErrorMessage("기기 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleCreateDevice = async (e) => {
    e.preventDefault();

    if (!mac.trim() || !ip.trim()) {
      alert("MAC 주소와 IP 주소를 입력해주세요.");
      return;
    }

    try {
      await registerDevice({
        macAddress: mac.trim(),
        lastIp: ip.trim(),
      });

      setMac("");
      setIp("");
      setFacility("미연결");
      setCage("");
      setIsFormOpen(false);

      await fetchDevices();
    } catch (error) {
      console.error("기기 등록 실패:", error);
      alert("기기 등록에 실패했습니다.");
    }
  };

  const getDeviceStatus = (device) => {
    if (device.isActive === true || device.isActive === "true") {
      return "ONLINE";
    }

    return "OFFLINE";
  };

  const formatLastPing = (lastPing) => {
    if (!lastPing) return "정보 없음";
    return lastPing;
  };

  return (
    <div className="admin-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Device Management</span>
          <h1>기기 관리</h1>
          <p>
            시스템 관리자는 라즈베리파이 기기를 등록하고 시설 및 케이지와의
            연결 상태를 관리합니다.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setIsFormOpen((prev) => !prev)}
        >
          {isFormOpen ? "닫기" : "기기 등록"}
        </button>
      </section>

      {isFormOpen && (
        <section className="admin-card">
          <div className="section-header">
            <div>
              <h2>라즈베리파이 기기 등록</h2>
              <p>
                백엔드에는 현재 MAC 주소와 최근 IP 주소가 등록됩니다.
              </p>
            </div>
          </div>

          <form className="clean-form" onSubmit={handleCreateDevice}>
            <div className="form-grid">
              <div className="form-field">
                <label>MAC 주소</label>
                <input
                  value={mac}
                  onChange={(e) => setMac(e.target.value)}
                  placeholder="예: B8:27:EB:12:34:01"
                />
              </div>

              <div className="form-field">
                <label>최근 IP 주소</label>
                <input
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="예: 100.x.x.x 또는 192.168.0.21"
                />
              </div>

              <div className="form-field">
                <label>설치 시설</label>
                <select
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  disabled
                >
                  <option>미연결</option>
                </select>
              </div>

              <div className="form-field">
                <label>연결 케이지</label>
                <input
                  value={cage}
                  onChange={(e) => setCage(e.target.value)}
                  placeholder="현재 API에서는 기기 등록 시 케이지 연결 미지원"
                  disabled
                />
              </div>
            </div>

            <div className="button-row">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsFormOpen(false)}
              >
                취소
              </button>
              <button type="submit" className="primary-button">
                등록
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-card">
        <div className="section-header">
          <div>
            <h2>전체 기기 목록</h2>
            <p>
              라즈베리파이의 MAC 주소, IP, 마지막 통신 상태입니다.
            </p>
          </div>
        </div>

        {loading && <p>기기 목록을 불러오는 중입니다...</p>}

        {errorMessage && <p className="error-text">{errorMessage}</p>}

        {!loading && !errorMessage && devices.length === 0 && (
          <p>등록된 기기가 없습니다.</p>
        )}

        {!loading && !errorMessage && devices.length > 0 && (
          <div className="device-grid">
            {devices.map((device) => {
              const status = getDeviceStatus(device);

              return (
                <article className="device-card" key={device.deviceId}>
                  <div className="device-card-top">
                    <div>
                      <h3>{device.deviceId}</h3>
                      <p>시설 미연결 / 케이지 미연결</p>
                    </div>

                    <span
                      className={
                        status === "ONLINE" ? "badge green" : "badge red"
                      }
                    >
                      {status}
                    </span>
                  </div>

                  <div className="device-info-list">
                    <div>
                      <span>MAC 주소</span>
                      <strong>{device.macAddress}</strong>
                    </div>
                    <div>
                      <span>최근 IP</span>
                      <strong>{device.lastIp || "정보 없음"}</strong>
                    </div>
                    <div>
                      <span>마지막 통신</span>
                      <strong>{formatLastPing(device.lastPing)}</strong>
                    </div>
                  </div>

                  <button className="mini-button full" disabled>
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