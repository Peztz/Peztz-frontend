import { useState } from "react";

function AdminDevicesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [devices, setDevices] = useState([
    {
      id: "RP-001",
      mac: "B8:27:EB:12:34:01",
      ip: "192.168.0.21",
      facility: "A 펫호텔",
      cage: "1번 케이지",
      status: "ONLINE",
      lastPing: "방금 전",
    },
    {
      id: "RP-002",
      mac: "B8:27:EB:12:34:02",
      ip: "192.168.0.22",
      facility: "A 펫호텔",
      cage: "2번 케이지",
      status: "ONLINE",
      lastPing: "1분 전",
    },
    {
      id: "RP-005",
      mac: "B8:27:EB:12:34:05",
      ip: "192.168.0.25",
      facility: "A 펫호텔",
      cage: "5번 케이지",
      status: "OFFLINE",
      lastPing: "8분 전",
    },
  ]);

  const [mac, setMac] = useState("");
  const [ip, setIp] = useState("");
  const [facility, setFacility] = useState("A 펫호텔");
  const [cage, setCage] = useState("");

  const handleCreateDevice = (e) => {
    e.preventDefault();

    if (!mac.trim() || !ip.trim()) {
      alert("MAC 주소와 IP 주소를 입력해주세요.");
      return;
    }

    const newDevice = {
      id: `RP-${String(devices.length + 1).padStart(3, "0")}`,
      mac: mac.trim(),
      ip: ip.trim(),
      facility,
      cage: cage || "미연결",
      status: "ONLINE",
      lastPing: "방금 전",
    };

    setDevices([newDevice, ...devices]);
    setMac("");
    setIp("");
    setFacility("A 펫호텔");
    setCage("");
    setIsFormOpen(false);
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
              <p>기기 MAC 주소, IP 주소, 설치 시설, 연결 케이지를 등록합니다.</p>
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
                  placeholder="예: 192.168.0.21"
                />
              </div>

              <div className="form-field">
                <label>설치 시설</label>
                <select value={facility} onChange={(e) => setFacility(e.target.value)}>
                  <option>A 펫호텔</option>
                  <option>B 펫호텔</option>
                  <option>C 애견유치원</option>
                </select>
              </div>

              <div className="form-field">
                <label>연결 케이지</label>
                <input
                  value={cage}
                  onChange={(e) => setCage(e.target.value)}
                  placeholder="예: 1번 케이지"
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
            <p>라즈베리파이의 MAC 주소, IP, 시설, 케이지, 마지막 통신 상태입니다.</p>
          </div>
        </div>

        <div className="device-grid">
          {devices.map((device) => (
            <article className="device-card" key={device.id}>
              <div className="device-card-top">
                <div>
                  <h3>{device.id}</h3>
                  <p>{device.facility} / {device.cage}</p>
                </div>
                <span
                  className={
                    device.status === "ONLINE" ? "badge green" : "badge red"
                  }
                >
                  {device.status}
                </span>
              </div>

              <div className="device-info-list">
                <div>
                  <span>MAC 주소</span>
                  <strong>{device.mac}</strong>
                </div>
                <div>
                  <span>최근 IP</span>
                  <strong>{device.ip}</strong>
                </div>
                <div>
                  <span>마지막 통신</span>
                  <strong>{device.lastPing}</strong>
                </div>
              </div>

              <button className="mini-button full">연결 정보 수정</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDevicesPage;