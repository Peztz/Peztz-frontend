import { useNavigate } from "react-router-dom";

function FacilityDashboardPage() {
  const navigate = useNavigate();

  const activePets = [
    {
      id: 1,
      petName: "초코",
      ownerName: "김민지",
      cageName: "1번 케이지",
      status: "입실 중",
      deviceStatus: "ONLINE",
    },
    {
      id: 2,
      petName: "콩이",
      ownerName: "박서준",
      cageName: "3번 케이지",
      status: "입실 중",
      deviceStatus: "ONLINE",
    },
    {
      id: 3,
      petName: "보리",
      ownerName: "이하늘",
      cageName: "5번 케이지",
      status: "입실 중",
      deviceStatus: "OFFLINE",
    },
  ];

  const alerts = [
    {
      id: 1,
      type: "NETWORK",
      message: "5번 케이지 장비 통신 지연",
      time: "5분 전",
      level: "warning",
    },
    {
      id: 2,
      type: "SESSION",
      message: "초코 입실 세션 활성화",
      time: "18분 전",
      level: "normal",
    },
    {
      id: 3,
      type: "ACCESS",
      message: "콩이 보호자 접근 코드 발급 완료",
      time: "32분 전",
      level: "normal",
    },
  ];

  return (
    <div className="facility-page">
      <section className="facility-hero">
        <div>
          <span className="eyebrow">Facility Dashboard</span>
          <h1>A 펫호텔 운영 대시보드</h1>
          <p>
            시설에 배정된 케이지의 입실 상태, 장비 연결 상태, 최근 이벤트를
            한눈에 확인할 수 있습니다.
          </p>
        </div>

        <div className="hero-actions">
          <button
            className="secondary-button"
            onClick={() => navigate("/facility/sessions")}
          >
            입실 세션 보기
          </button>
          <button
            className="primary-button"
            onClick={() => navigate("/facility/cages")}
          >
            케이지 현황 보기
          </button>
        </div>
      </section>

      <section className="facility-summary-grid">
        <div className="facility-stat-card">
          <span>배정 케이지</span>
          <strong>12</strong>
          <p>시설에 할당된 전체 케이지</p>
        </div>
        <div className="facility-stat-card">
          <span>입실 중</span>
          <strong>8</strong>
          <p>현재 반려동물 입실</p>
        </div>
        <div className="facility-stat-card">
          <span>사용 가능</span>
          <strong>3</strong>
          <p>즉시 배정 가능</p>
        </div>
        <div className="facility-stat-card danger">
          <span>장비 이상</span>
          <strong>1</strong>
          <p>점검 필요</p>
        </div>
      </section>

      <section className="facility-grid-2">
        <div className="facility-card">
          <div className="section-header">
            <div>
              <h2>현재 입실 현황</h2>
              <p>입실 중인 반려동물과 케이지 연결 상태입니다.</p>
            </div>
            <button
              className="secondary-button"
              onClick={() => navigate("/facility/sessions")}
            >
              전체 보기
            </button>
          </div>

          <div className="facility-table-wrap">
            <table className="facility-table">
              <thead>
                <tr>
                  <th>반려동물</th>
                  <th>보호자</th>
                  <th>케이지</th>
                  <th>세션</th>
                  <th>장비</th>
                </tr>
              </thead>
              <tbody>
                {activePets.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.petName}</strong>
                    </td>
                    <td>{item.ownerName}</td>
                    <td>{item.cageName}</td>
                    <td>
                      <span className="badge blue">{item.status}</span>
                    </td>
                    <td>
                      <span
                        className={
                          item.deviceStatus === "ONLINE"
                            ? "badge green"
                            : "badge red"
                        }
                      >
                        {item.deviceStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="facility-card">
          <div className="section-header">
            <div>
              <h2>최근 알림</h2>
              <p>케이지 운영 중 발생한 주요 이벤트입니다.</p>
            </div>
          </div>

          <div className="alert-list">
            {alerts.map((alert) => (
              <div className="alert-item" key={alert.id}>
                <div
                  className={
                    alert.level === "warning"
                      ? "alert-icon warning"
                      : "alert-icon normal"
                  }
                >
                  !
                </div>
                <div>
                  <strong>{alert.message}</strong>
                  <p>
                    {alert.type} · {alert.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default FacilityDashboardPage;