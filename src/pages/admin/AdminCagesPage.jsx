import { useEffect, useState } from "react";
import { getAdminCages } from "../../api/admin";

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function displayValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "" || value === "-") {
    return fallback;
  }

  return value;
}

function getStatusBadge(status) {
  if (status === "AVAILABLE" || status === "ACTIVE") return "badge green";
  if (status === "OCCUPIED" || status === "IN_USE") return "badge blue";
  if (!status || status === "-") return "badge";
  return "badge red";
}

function AdminCagesPage() {
  const [cages, setCages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchCages() {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getAdminCages();
        setCages(toArray(data));
      } catch (error) {
        console.error("관리자 케이지 조회 실패:", error);
        setErrorMessage("데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchCages();
  }, []);

  const handleAssignCage = () => {
    alert("준비 중입니다.");
  };

  return (
    <div className="admin-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Cage Assignment</span>
          <h1>전체 케이지 관리</h1>
          <p>백엔드 관리자 API에서 조회한 전체 케이지 정보를 표시합니다.</p>
        </div>

        <button className="primary-button" onClick={handleAssignCage}>
          케이지 할당
        </button>
      </section>

      <section className="admin-card">
        <div className="section-header">
          <div>
            <h2>전체 케이지 목록</h2>
            <p>시설별 케이지와 연결 장비, 현재 상태를 확인합니다.</p>
          </div>
          <span className="count-badge">{cages.length}개</span>
        </div>

        {loading && <p>불러오는 중...</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}

        {!loading && !errorMessage && cages.length === 0 && (
          <p>조회된 케이지가 없습니다.</p>
        )}

        {!loading && !errorMessage && cages.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>케이지 ID</th>
                  <th>케이지 번호</th>
                  <th>시설</th>
                  <th>연결 장비</th>
                  <th>상태</th>
                  <th>입실 반려동물</th>
                </tr>
              </thead>
              <tbody>
                {cages.map((cage, index) => {
                  const status = displayValue(cage.status);

                  return (
                    <tr key={cage.cageId ?? cage.id ?? `cage-${index}`}>
                      <td>{displayValue(cage.cageId ?? cage.id)}</td>
                      <td>
                        <strong>
                          {displayValue(
                            cage.cageNumber ?? cage.number ?? cage.name
                          )}
                        </strong>
                      </td>
                      <td>
                        {displayValue(
                          cage.facilityName ?? cage.facility?.name,
                          "시설 미연결"
                        )}
                      </td>
                      <td>
                        {displayValue(
                          cage.deviceId ??
                            cage.raspberryPiId ??
                            cage.deviceName ??
                            cage.device?.deviceId,
                          "미연결"
                        )}
                      </td>
                      <td>
                        <span className={getStatusBadge(status)}>{status}</span>
                      </td>
                      <td>
                        {displayValue(
                          cage.petName ?? cage.currentPetName ?? cage.pet?.name
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminCagesPage;
