import { useState } from "react";

function AdminCagesPage() {
  const facilities = ["A 펫호텔", "B 펫호텔", "C 애견유치원"];
  const devices = ["RP-001", "RP-002", "RP-003", "RP-004", "RP-005"];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [facility, setFacility] = useState(facilities[0]);
  const [cageName, setCageName] = useState("");
  const [deviceId, setDeviceId] = useState(devices[0]);

  const [cages, setCages] = useState([
    {
      id: "CAGE-001",
      name: "1번 케이지",
      facility: "A 펫호텔",
      device: "RP-001",
      status: "OCCUPIED",
      petName: "초코",
    },
    {
      id: "CAGE-002",
      name: "2번 케이지",
      facility: "A 펫호텔",
      device: "RP-002",
      status: "AVAILABLE",
      petName: "-",
    },
    {
      id: "CAGE-003",
      name: "1번 케이지",
      facility: "B 펫호텔",
      device: "RP-003",
      status: "AVAILABLE",
      petName: "-",
    },
  ]);

  const handleAssignCage = (e) => {
    e.preventDefault();

    if (!cageName.trim()) {
      alert("케이지명을 입력해주세요.");
      return;
    }

    const newCage = {
      id: `CAGE-${String(cages.length + 1).padStart(3, "0")}`,
      name: cageName.trim(),
      facility,
      device: deviceId,
      status: "AVAILABLE",
      petName: "-",
    };

    setCages([newCage, ...cages]);
    setCageName("");
    setDeviceId(devices[0]);
    setFacility(facilities[0]);
    setIsFormOpen(false);
  };

  const getStatusBadge = (status) => {
    if (status === "AVAILABLE") return "badge green";
    if (status === "OCCUPIED") return "badge blue";
    return "badge red";
  };

  return (
    <div className="admin-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Cage Assignment</span>
          <h1>케이지 관리</h1>
          <p>
            시스템 관리자는 케이지를 생성하고 특정 시설과 장비에 할당합니다.
            시설 관리자는 할당된 케이지 목록만 확인합니다.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setIsFormOpen((prev) => !prev)}
        >
          {isFormOpen ? "닫기" : "케이지 할당"}
        </button>
      </section>

      {isFormOpen && (
        <section className="admin-card">
          <div className="section-header">
            <div>
              <h2>케이지 시설 할당</h2>
              <p>케이지명, 시설, 연결 장비를 선택하여 케이지를 배정합니다.</p>
            </div>
          </div>

          <form className="clean-form" onSubmit={handleAssignCage}>
            <div className="form-grid">
              <div className="form-field">
                <label>케이지명</label>
                <input
                  value={cageName}
                  onChange={(e) => setCageName(e.target.value)}
                  placeholder="예: 1번 케이지"
                />
              </div>

              <div className="form-field">
                <label>할당 시설</label>
                <select value={facility} onChange={(e) => setFacility(e.target.value)}>
                  {facilities.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>연결 장비</label>
                <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
                  {devices.map((device) => (
                    <option key={device}>{device}</option>
                  ))}
                </select>
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
                할당
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-card">
        <div className="section-header">
          <div>
            <h2>전체 케이지 목록</h2>
            <p>시설별 케이지와 연결 장비, 현재 상태를 확인합니다.</p>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>케이지 ID</th>
                <th>케이지명</th>
                <th>시설</th>
                <th>연결 장비</th>
                <th>상태</th>
                <th>입실 반려동물</th>
              </tr>
            </thead>
            <tbody>
              {cages.map((cage) => (
                <tr key={cage.id}>
                  <td>{cage.id}</td>
                  <td>
                    <strong>{cage.name}</strong>
                  </td>
                  <td>{cage.facility}</td>
                  <td>{cage.device}</td>
                  <td>
                    <span className={getStatusBadge(cage.status)}>
                      {cage.status}
                    </span>
                  </td>
                  <td>{cage.petName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminCagesPage;