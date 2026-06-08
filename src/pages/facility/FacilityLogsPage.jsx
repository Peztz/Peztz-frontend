function FacilityLogsPage() {
  const logs = [
    {
      id: "LOG-001",
      type: "NETWORK",
      message: "RP-005 마지막 핑 5분 이상 지연",
      cage: "5번 케이지",
      time: "2026-05-15 12:20",
      level: "WARNING",
    },
    {
      id: "LOG-002",
      type: "ACCESS",
      message: "초코 보호자 접근 코드 인증 성공",
      cage: "1번 케이지",
      time: "2026-05-15 12:02",
      level: "NORMAL",
    },
    {
      id: "LOG-003",
      type: "SESSION",
      message: "콩이 입실 세션 ACTIVE 전환",
      cage: "3번 케이지",
      time: "2026-05-15 11:05",
      level: "NORMAL",
    },
    {
      id: "LOG-004",
      type: "TEMP",
      message: "케이지 내부 온도 기준값 초과",
      cage: "2번 케이지",
      time: "2026-05-15 10:44",
      level: "WARNING",
    },
  ];

  return (
    <div className="facility-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Event Log</span>
          <h1>로그/이벤트 관리</h1>
          <p>
            센서, 네트워크, 접근 코드, 세션, 리포트 관련 이벤트를 조회합니다.
          </p>
        </div>
      </section>

      <section className="facility-summary-grid">
        <div className="facility-stat-card">
          <span>오늘 이벤트</span>
          <strong>24</strong>
          <p>전체 발생 건수</p>
        </div>
        <div className="facility-stat-card danger">
          <span>경고 이벤트</span>
          <strong>2</strong>
          <p>확인 필요</p>
        </div>
        <div className="facility-stat-card">
          <span>접근 기록</span>
          <strong>9</strong>
          <p>보호자 인증</p>
        </div>
        <div className="facility-stat-card">
          <span>세션 기록</span>
          <strong>6</strong>
          <p>입실/퇴실 처리</p>
        </div>
      </section>

      <section className="facility-card">
        <div className="section-header">
          <div>
            <h2>이벤트 목록</h2>
            <p>SENSOR, NETWORK, ACCESS, SESSION, TEMP 등의 이벤트를 확인합니다.</p>
          </div>
        </div>

        <div className="log-list">
          {logs.map((log) => (
            <article className="log-item" key={log.id}>
              <div
                className={
                  log.level === "WARNING"
                    ? "log-type warning"
                    : "log-type normal"
                }
              >
                {log.type}
              </div>

              <div className="log-content">
                <strong>{log.message}</strong>
                <p>
                  {log.cage} · {log.time}
                </p>
              </div>

              <span
                className={log.level === "WARNING" ? "badge red" : "badge green"}
              >
                {log.level}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default FacilityLogsPage;