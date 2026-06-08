import { useState } from "react";

function FacilitySessionsPage() {
  const assignedCages = [
    { id: "CAGE-002", name: "2번 케이지" },
    { id: "CAGE-004", name: "4번 케이지" },
    { id: "CAGE-006", name: "6번 케이지" },
  ];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [petName, setPetName] = useState("");
  const [cageId, setCageId] = useState(assignedCages[0].id);
  const [accessCode, setAccessCode] = useState("");

  const [sessions, setSessions] = useState([
    {
      id: "SES-001",
      petName: "초코",
      ownerName: "김민지",
      cageName: "1번 케이지",
      status: "ACTIVE",
      accessCode: "PEZTZ-3A7Q",
      startTime: "2026-05-15 10:20",
    },
    {
      id: "SES-002",
      petName: "콩이",
      ownerName: "박서준",
      cageName: "3번 케이지",
      status: "ACTIVE",
      accessCode: "PEZTZ-7B2K",
      startTime: "2026-05-15 11:05",
    },
  ]);

  function makeCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";

    for (let i = 0; i < 4; i += 1) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    return `PEZTZ-${result}`;
  }

  function generateUniqueCode() {
    let newCode = makeCode();

    const existingCodes = sessions.map((session) => session.accessCode);

    while (existingCodes.includes(newCode)) {
      newCode = makeCode();
    }

    setAccessCode(newCode);
  }

  const selectedCage = assignedCages.find((cage) => cage.id === cageId);

  const handleCreateSession = (e) => {
    e.preventDefault();

    if (!ownerName.trim()) {
      alert("보호자 이름을 입력해주세요.");
      return;
    }

    if (!petName.trim()) {
      alert("반려동물 이름을 입력해주세요.");
      return;
    }

    if (!accessCode) {
      alert("접근 코드를 먼저 발급해주세요.");
      return;
    }

    const newSession = {
      id: `SES-${String(sessions.length + 1).padStart(3, "0")}`,
      petName: petName.trim(),
      ownerName: ownerName.trim(),
      cageName: selectedCage.name,
      status: "ACTIVE",
      accessCode,
      startTime: "방금 전",
    };

    setSessions([newSession, ...sessions]);

    setOwnerName("");
    setPetName("");
    setCageId(assignedCages[0].id);
    setAccessCode("");
    setIsFormOpen(false);

    alert("입실 세션 화면 껍데기 생성 완료입니다. 나중에 백엔드 API와 연결됩니다.");
  };

  const getStatusBadge = (status) => {
    if (status === "ACTIVE") return "badge blue";
    if (status === "REQUESTED") return "badge gray";
    if (status === "COMPLETED") return "badge green";
    return "badge red";
  };

  return (
    <div className="facility-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Admission Session</span>
          <h1>입실 세션 관리</h1>
          <p>
            보호자 정보와 반려동물 정보를 입력하고, 시설에 배정된 케이지를
            선택한 뒤 견주용 접근 코드를 발급합니다.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setIsFormOpen((prev) => !prev)}
        >
          {isFormOpen ? "생성 취소" : "입실 세션 생성"}
        </button>
      </section>

      {isFormOpen && (
        <section className="facility-card">
          <div className="section-header">
            <div>
              <h2>입실 세션 생성</h2>
              <p>
                보호자와 반려동물은 직접 입력하고, 케이지는 시설에 배정된
                케이지 중에서 선택합니다.
              </p>
            </div>
          </div>

          <form className="clean-form" onSubmit={handleCreateSession}>
            <div className="form-grid">
              <div className="form-field">
                <label>보호자 이름</label>
                <input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="예: 김민지"
                />
              </div>

              <div className="form-field">
                <label>반려동물 이름</label>
                <input
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="예: 초코"
                />
              </div>

              <div className="form-field">
                <label>배정 케이지</label>
                <select
                  value={cageId}
                  onChange={(e) => setCageId(e.target.value)}
                >
                  {assignedCages.map((cage) => (
                    <option key={cage.id} value={cage.id}>
                      {cage.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>접근 코드</label>
                <div className="code-input-row">
                  <input
                    value={accessCode}
                    readOnly
                    placeholder="발급 버튼을 누르면 코드가 생성됩니다"
                  />
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={generateUniqueCode}
                  >
                    {accessCode ? "재발급" : "발급"}
                  </button>
                </div>
              </div>
            </div>

            <div className="notice-box">
              <strong>생성 시 연결되는 정보</strong>
              <p>
                실제 백엔드 연결 시에는 보호자 정보, 반려동물 정보, 케이지 ID,
                접근 코드, 세션 상태가 하나의 입실 세션으로 저장됩니다.
              </p>
            </div>

            <div className="button-row">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setIsFormOpen(false);
                  setOwnerName("");
                  setPetName("");
                  setCageId(assignedCages[0].id);
                  setAccessCode("");
                }}
              >
                취소
              </button>
              <button type="submit" className="primary-button">
                세션 생성
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="facility-card">
        <div className="section-header">
          <div>
            <h2>세션 목록</h2>
            <p>
              REQUESTED, ACTIVE, COMPLETED, EXPIRED, CANCELED 상태로 관리합니다.
            </p>
          </div>
        </div>

        <div className="facility-table-wrap">
          <table className="facility-table">
            <thead>
              <tr>
                <th>세션 ID</th>
                <th>반려동물</th>
                <th>보호자</th>
                <th>케이지</th>
                <th>상태</th>
                <th>접근 코드</th>
                <th>입실 시간</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.id}</td>
                  <td>
                    <strong>{session.petName}</strong>
                  </td>
                  <td>{session.ownerName}</td>
                  <td>{session.cageName}</td>
                  <td>
                    <span className={getStatusBadge(session.status)}>
                      {session.status}
                    </span>
                  </td>
                  <td>{session.accessCode}</td>
                  <td>{session.startTime}</td>
                  <td>
                    <button className="mini-button">관리</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="facility-card">
        <div className="section-header">
          <div>
            <h2>입실 처리 흐름</h2>
            <p>시설 관리자가 실제로 처리하는 업무 순서입니다.</p>
          </div>
        </div>

        <div className="process-grid">
          <div>
            <strong>1</strong>
            <span>보호자 입력</span>
          </div>
          <div>
            <strong>2</strong>
            <span>반려동물 입력</span>
          </div>
          <div>
            <strong>3</strong>
            <span>케이지 선택</span>
          </div>
          <div>
            <strong>4</strong>
            <span>접근 코드 발급</span>
          </div>
          <div>
            <strong>5</strong>
            <span>세션 생성</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FacilitySessionsPage;