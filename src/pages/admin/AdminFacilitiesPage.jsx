import { useState } from "react";

function AdminFacilitiesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [facilities, setFacilities] = useState([
    {
      id: "FAC-001",
      name: "A 펫호텔",
      phone: "052-111-1111",
      type: "PET_HOTEL",
      status: "ACTIVE",
      cages: 12,
    },
    {
      id: "FAC-002",
      name: "B 펫호텔",
      phone: "052-222-2222",
      type: "PET_HOTEL",
      status: "ACTIVE",
      cages: 7,
    },
  ]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("PET_HOTEL");

  const handleCreateFacility = (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      alert("시설명과 연락처를 입력해주세요.");
      return;
    }

    const newFacility = {
      id: `FAC-${String(facilities.length + 1).padStart(3, "0")}`,
      name: name.trim(),
      phone: phone.trim(),
      type,
      status: "ACTIVE",
      cages: 0,
    };

    setFacilities([newFacility, ...facilities]);
    setName("");
    setPhone("");
    setType("PET_HOTEL");
    setIsFormOpen(false);
  };

  return (
    <div className="admin-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Facility Management</span>
          <h1>시설 관리</h1>
          <p>서비스를 이용하는 펫호텔, 위탁시설, 병원형 시설을 관리합니다.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setIsFormOpen((prev) => !prev)}
        >
          {isFormOpen ? "닫기" : "시설 추가"}
        </button>
      </section>

      {isFormOpen && (
        <section className="admin-card">
          <div className="section-header">
            <div>
              <h2>시설 정보 등록</h2>
              <p>시설명, 연락처, 시설 유형을 등록합니다.</p>
            </div>
          </div>

          <form className="clean-form" onSubmit={handleCreateFacility}>
            <div className="form-grid">
              <div className="form-field">
                <label>시설명</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: A 펫호텔"
                />
              </div>

              <div className="form-field">
                <label>연락처</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="예: 052-000-0000"
                />
              </div>

              <div className="form-field">
                <label>시설 유형</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="PET_HOTEL">펫호텔</option>
                  <option value="DAYCARE">애견유치원</option>
                  <option value="HOSPITAL">동물병원</option>
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
                등록
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-card">
        <div className="section-header">
          <div>
            <h2>시설 목록</h2>
            <p>시설별 상태와 할당된 케이지 수를 확인합니다.</p>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>시설 ID</th>
                <th>시설명</th>
                <th>연락처</th>
                <th>유형</th>
                <th>케이지 수</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((facility) => (
                <tr key={facility.id}>
                  <td>{facility.id}</td>
                  <td>
                    <strong>{facility.name}</strong>
                  </td>
                  <td>{facility.phone}</td>
                  <td>{facility.type}</td>
                  <td>{facility.cages}</td>
                  <td>
                    <span className="badge green">{facility.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminFacilitiesPage;