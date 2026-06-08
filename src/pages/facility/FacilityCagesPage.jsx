function FacilityCagesPage() {
  const cages = [
    {
      id: "CAGE-001",
      name: "1번 케이지",
      status: "OCCUPIED",
      petName: "초코",
      device: "RP-001",
      deviceStatus: "ONLINE",
      assignedAt: "2026-05-01",
    },
    {
      id: "CAGE-002",
      name: "2번 케이지",
      status: "AVAILABLE",
      petName: "-",
      device: "RP-002",
      deviceStatus: "ONLINE",
      assignedAt: "2026-05-01",
    },
    {
      id: "CAGE-003",
      name: "3번 케이지",
      status: "OCCUPIED",
      petName: "콩이",
      device: "RP-003",
      deviceStatus: "ONLINE",
      assignedAt: "2026-05-01",
    },
    {
      id: "CAGE-005",
      name: "5번 케이지",
      status: "UNAVAILABLE",
      petName: "보리",
      device: "RP-005",
      deviceStatus: "OFFLINE",
      assignedAt: "2026-05-03",
    },
  ];

  const getStatusBadge = (status) => {
    if (status === "AVAILABLE") return "badge green";
    if (status === "OCCUPIED") return "badge blue";
    return "badge red";
  };

  return (
    <div className="facility-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Cage Management</span>
          <h1>케이지 관리</h1>
          <p>
            시스템 관리자가 시설에 할당한 케이지 목록과 현재 운영 상태를
            확인합니다.
          </p>
        </div>
      </section>

      <section className="facility-summary-grid">
        <div className="facility-stat-card">
          <span>배정 케이지</span>
          <strong>4</strong>
          <p>시설에 할당된 케이지</p>
        </div>
        <div className="facility-stat-card">
          <span>사용 가능</span>
          <strong>1</strong>
          <p>입실 배정 가능</p>
        </div>
        <div className="facility-stat-card">
          <span>입실 중</span>
          <strong>2</strong>
          <p>현재 세션 활성화</p>
        </div>
        <div className="facility-stat-card danger">
          <span>확인 필요</span>
          <strong>1</strong>
          <p>장비 또는 운영 상태 확인</p>
        </div>
      </section>

      <section className="facility-card">
        <div className="section-header">
          <div>
            <h2>배정된 케이지 목록</h2>
            <p>
              케이지 추가와 삭제는 시스템 관리자 권한이며, 시설 관리자는
              배정된 케이지의 상태를 확인합니다.
            </p>
          </div>
        </div>

        <div className="facility-table-wrap">
          <table className="facility-table">
            <thead>
              <tr>
                <th>케이지 ID</th>
                <th>케이지명</th>
                <th>상태</th>
                <th>입실 반려동물</th>
                <th>연결 장비</th>
                <th>장비 상태</th>
                <th>배정일</th>
              </tr>
            </thead>
            <tbody>
              {cages.map((cage) => (
                <tr key={cage.id}>
                  <td>{cage.id}</td>
                  <td>
                    <strong>{cage.name}</strong>
                  </td>
                  <td>
                    <span className={getStatusBadge(cage.status)}>
                      {cage.status}
                    </span>
                  </td>
                  <td>{cage.petName}</td>
                  <td>{cage.device}</td>
                  <td>
                    <span
                      className={
                        cage.deviceStatus === "ONLINE"
                          ? "badge green"
                          : "badge red"
                      }
                    >
                      {cage.deviceStatus}
                    </span>
                  </td>
                  <td>{cage.assignedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default FacilityCagesPage;