import { useEffect, useState } from "react";
import { getAdminFacilities } from "../../api/admin";

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

function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchFacilities() {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getAdminFacilities();
        setFacilities(toArray(data));
      } catch (error) {
        console.error("관리자 시설 조회 실패:", error);
        setErrorMessage("데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchFacilities();
  }, []);

  return (
    <div className="admin-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Facility Management</span>
          <h1>전체 시설 관리</h1>
          <p>관리자 API에서 조회한 전체 시설 정보를 표시합니다.</p>
        </div>

        <button className="primary-button" disabled>
          시설 추가
        </button>
      </section>

      <section className="admin-card">
        <div className="section-header">
          <div>
            <h2>시설 목록</h2>
            <p>시설명, 연락처, 유형, 케이지 수와 상태를 확인합니다.</p>
          </div>
          <span className="count-badge">{facilities.length}개</span>
        </div>

        {loading && <p>불러오는 중...</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}

        {!loading && !errorMessage && facilities.length === 0 && (
          <p>조회된 시설이 없습니다.</p>
        )}

        {!loading && !errorMessage && facilities.length > 0 && (
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
                {facilities.map((facility, index) => (
                  <tr key={facility.facilityId ?? facility.id ?? `facility-${index}`}>
                    <td>{displayValue(facility.facilityId ?? facility.id)}</td>
                    <td>
                      <strong>
                        {displayValue(
                          facility.facilityName ?? facility.name,
                          "시설 미연결"
                        )}
                      </strong>
                    </td>
                    <td>
                      {displayValue(
                        facility.phoneNumber ?? facility.phone ?? facility.contact
                      )}
                    </td>
                    <td>{displayValue(facility.type)}</td>
                    <td>
                      {displayValue(
                        facility.totalCages ?? facility.cageCount ?? facility.cages,
                        0
                      )}
                    </td>
                    <td>
                      <span className="badge blue">
                        {displayValue(facility.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminFacilitiesPage;
