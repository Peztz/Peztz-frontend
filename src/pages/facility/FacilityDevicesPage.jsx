function FacilityDevicesPage() {
  const devices = [
    {
      id: "RP-001",
      mac: "B8:27:EB:12:34:01",
      ip: "192.168.0.21",
      cage: "1번 케이지",
      status: "ONLINE",
      lastPing: "방금 전",
      videoStatus: "정상",
      sensorStatus: "정상",
    },
    {
      id: "RP-002",
      mac: "B8:27:EB:12:34:02",
      ip: "192.168.0.22",
      cage: "2번 케이지",
      status: "ONLINE",
      lastPing: "1분 전",
      videoStatus: "정상",
      sensorStatus: "정상",
    },
    {
      id: "RP-005",
      mac: "B8:27:EB:12:34:05",
      ip: "192.168.0.25",
      cage: "5번 케이지",
      status: "OFFLINE",
      lastPing: "8분 전",
      videoStatus: "연결 끊김",
      sensorStatus: "확인 필요",
    },
  ];

  return (
    <div className="facility-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Equipment Status</span>
          <h1>장비 상태 확인</h1>
          <p>
            시설에 배정된 케이지 장비의 영상, 센서, 네트워크 연결 상태를
            확인합니다.
          </p>
        </div>
      </section>

      <section className="facility-card">
        <div className="section-header">
          <div>
            <h2>케이지 장비 연결 상태</h2>
            <p>
              장비 등록과 케이지 연결 관리는 시스템 관리자가 수행하며, 시설
              관리자는 상태를 확인하고 점검을 요청할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="device-grid">
          {devices.map((device) => (
            <article className="device-card" key={device.id}>
              <div className="device-card-top">
                <div>
                  <h3>{device.cage}</h3>
                  <p>{device.id}</p>
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
                <div>
                  <span>영상 상태</span>
                  <strong>{device.videoStatus}</strong>
                </div>
                <div>
                  <span>센서 상태</span>
                  <strong>{device.sensorStatus}</strong>
                </div>
              </div>

              <button
                className="mini-button full"
                onClick={() => alert(`${device.cage} 점검 요청 화면입니다.`)}
              >
                점검 요청
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default FacilityDevicesPage;