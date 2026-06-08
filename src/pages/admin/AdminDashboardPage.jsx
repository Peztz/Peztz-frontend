import { useNavigate } from "react-router-dom";

function AdminDashboardPage() {
  const navigate = useNavigate();

  const facilityStatus = [
    {
      id: "FAC-001",
      name: "A 펫호텔",
      cages: 12,
      activeSessions: 8,
      offlineDevices: 1,
      status: "운영 중",
    },
    {
      id: "FAC-002",
      name: "B 펫호텔",
      cages: 7,
      activeSessions: 3,
      offlineDevices: 0,
      status: "운영 중",
    },
    {
      id: "FAC-003",
      name: "C 애견유치원",
      cages: 5,
      activeSessions: 0,
      offlineDevices: 0,
      status: "준비 중",
    },
  ];

  const recentEvents = [
    {
      id: 1,
      type: "DEVICE",
      message: "A 펫호텔 5번 케이지 장비 OFFLINE 감지",
      time: "5분 전",
      level: "WARNING",
    },
    {
      id: 2,
      type: "CAGE",
      message: "B 펫호텔에 CAGE-014 할당 완료",
      time: "22분 전",
      level: "NORMAL",
    },
    {
      id: 3,
      type: "USER",
      message: "신규 시설 관리자 계정 생성",
      time: "1시간 전",
      level: "NORMAL",
    },
  ];

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <span className="eyebrow">System Admin</span>
          <h1>시스템 관리자 대시보드</h1>
          <p>
            전체 회원, 시설, 케이지, 장비 상태를 통합 관리하고 시설별 운영
            현황을 확인합니다.
          </p>
        </div>

        <div className="hero-actions">
          <button
            className="secondary-button"
            onClick={() => navigate("/admin/facilities")}
          >
            시설 관리
          </button>
          <button
            className="primary-button"
            onClick={() => navigate("/admin/cages")}
          >
            케이지 할당
          </button>
        </div>
      </section>

      <section className="admin-summary-grid">
        <div className="admin-stat-card">
          <span>전체 회원</span>
          <strong>128</strong>
          <p>견주, 시설 관리자, 시스템 관리자</p>
        </div>
        <div className="admin-stat-card">
          <span>등록 시설</span>
          <strong>12</strong>
          <p>서비스 이용 시설</p>
        </div>
        <div className="admin-stat-card">
          <span>전체 케이지</span>
          <strong>48</strong>
          <p>시설에 배정된 케이지</p>
        </div>
        <div className="admin-stat-card danger">
          <span>장비 이상</span>
          <strong>2</strong>
          <p>점검 필요한 장비</p>
        </div>
      </section>

      <section className="admin-grid-2">
        <div className="admin-card">
          <div className="section-header">
            <div>
              <h2>시설별 운영 현황</h2>
              <p>시설별 케이지 수, 입실 세션, 장비 이상 여부를 확인합니다.</p>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>시설 ID</th>
                  <th>시설명</th>
                  <th>케이지</th>
                  <th>입실 중</th>
                  <th>장비 이상</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {facilityStatus.map((facility) => (
                  <tr key={facility.id}>
                    <td>{facility.id}</td>
                    <td>
                      <strong>{facility.name}</strong>
                    </td>
                    <td>{facility.cages}</td>
                    <td>{facility.activeSessions}</td>
                    <td>
                      <span
                        className={
                          facility.offlineDevices > 0 ? "badge red" : "badge green"
                        }
                      >
                        {facility.offlineDevices}건
                      </span>
                    </td>
                    <td>
                      <span className="badge blue">{facility.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <div className="section-header">
            <div>
              <h2>최근 시스템 이벤트</h2>
              <p>회원, 시설, 케이지, 기기 변경 이력입니다.</p>
            </div>
          </div>

          <div className="admin-event-list">
            {recentEvents.map((event) => (
              <article className="admin-event-item" key={event.id}>
                <div
                  className={
                    event.level === "WARNING"
                      ? "admin-event-icon warning"
                      : "admin-event-icon normal"
                  }
                >
                  !
                </div>
                <div>
                  <strong>{event.message}</strong>
                  <p>
                    {event.type} · {event.time}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;