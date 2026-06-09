import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminSummary } from "../../api/admin";

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

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getAdminSummary();
        setSummary(data);
      } catch (error) {
        console.error("관리자 요약 조회 실패:", error);
        setErrorMessage("데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  const facilityOperations = toArray(summary?.facilityOperations);
  const recentEvents = toArray(summary?.recentEvents);

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div>
          <span className="eyebrow">System Admin</span>
          <h1>시스템 관리자 대시보드</h1>
          <p>
            전체 회원, 시설, 케이지, 장비 상태를 백엔드 관리자 API 기준으로
            확인합니다.
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
            케이지 관리
          </button>
        </div>
      </section>

      {loading && <p>불러오는 중...</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {!loading && !errorMessage && summary && (
        <>
          <section className="admin-summary-grid">
            <div className="admin-stat-card">
              <span>전체 회원</span>
              <strong>{displayValue(summary.totalUsers, 0)}</strong>
              <p>등록된 전체 사용자 수</p>
            </div>
            <div className="admin-stat-card">
              <span>등록 시설</span>
              <strong>{displayValue(summary.totalFacilities, 0)}</strong>
              <p>서비스에 등록된 시설 수</p>
            </div>
            <div className="admin-stat-card">
              <span>전체 케이지</span>
              <strong>{displayValue(summary.totalCages, 0)}</strong>
              <p>전체 시설의 케이지 수</p>
            </div>
            <div className="admin-stat-card danger">
              <span>장비 이상</span>
              <strong>{displayValue(summary.deviceIssueCount, 0)}</strong>
              <p>점검이 필요한 장비 수</p>
            </div>
          </section>

          <section className="admin-grid-2">
            <div className="admin-card">
              <div className="section-header">
                <div>
                  <h2>시설별 운영 현황</h2>
                  <p>시설별 케이지, 입실 세션, 장비 이상 여부를 확인합니다.</p>
                </div>
              </div>

              {facilityOperations.length === 0 ? (
                <p>조회된 시설이 없습니다.</p>
              ) : (
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
                      {facilityOperations.map((facility, index) => {
                        const issueCount =
                          facility.deviceIssueCount ??
                          facility.offlineDevices ??
                          facility.issueCount ??
                          0;

                        return (
                          <tr
                            key={
                              facility.facilityId ?? facility.id ?? `facility-${index}`
                            }
                          >
                            <td>
                              {displayValue(facility.facilityId ?? facility.id)}
                            </td>
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
                                facility.totalCages ??
                                  facility.cageCount ??
                                  facility.cages,
                                0
                              )}
                            </td>
                            <td>
                              {displayValue(
                                facility.activeSessions ??
                                  facility.activeSessionCount ??
                                  facility.sessionCount,
                                0
                              )}
                            </td>
                            <td>
                              <span
                                className={issueCount > 0 ? "badge red" : "badge green"}
                              >
                                {issueCount}건
                              </span>
                            </td>
                            <td>
                              <span className="badge blue">
                                {displayValue(facility.status)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-card">
              <div className="section-header">
                <div>
                  <h2>최근 시스템 이벤트</h2>
                  <p>회원, 시설, 케이지, 장비 변경 이력을 확인합니다.</p>
                </div>
              </div>

              {recentEvents.length === 0 ? (
                <p>최근 시스템 이벤트가 없습니다.</p>
              ) : (
                <div className="admin-event-list">
                  {recentEvents.map((event, index) => (
                    <article
                      className="admin-event-item"
                      key={event.id ?? `event-${index}`}
                    >
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
                        <strong>
                          {displayValue(event.message ?? event.title)}
                        </strong>
                        <p>
                          {displayValue(event.type)} ·{" "}
                          {displayValue(
                            event.time ?? event.createdAt ?? event.occurredAt
                          )}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default AdminDashboardPage;
