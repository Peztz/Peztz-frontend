import { useEffect, useState } from "react";
import { getAdminUsers } from "../../api/admin";

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
  if (status === "ACTIVE" || status === "ENABLED") return "badge green";
  if (status === "INACTIVE" || status === "DISABLED") return "badge red";
  if (!status || status === "-") return "badge";
  return "badge blue";
}

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getAdminUsers();
        setUsers(toArray(data));
      } catch (error) {
        console.error("관리자 사용자 조회 실패:", error);
        setErrorMessage("데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="admin-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">User Management</span>
          <h1>전체 사용자 관리</h1>
          <p>관리자 API에서 조회한 전체 사용자 정보를 표시합니다.</p>
        </div>

        <button className="primary-button" disabled>
          회원 추가
        </button>
      </section>

      <section className="admin-card">
        <div className="section-header">
          <div>
            <h2>사용자 목록</h2>
            <p>전체 사용자 계정과 역할, 소속 시설, 계정 상태를 확인합니다.</p>
          </div>
          <span className="count-badge">{users.length}명</span>
        </div>

        {loading && <p>불러오는 중...</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}

        {!loading && !errorMessage && users.length === 0 && (
          <p>조회된 사용자가 없습니다.</p>
        )}

        {!loading && !errorMessage && users.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>회원 ID</th>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>소속 시설</th>
                  <th>연락처</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => {
                  const status = displayValue(user.status);

                  return (
                    <tr key={user.userId ?? user.id ?? `user-${index}`}>
                      <td>{displayValue(user.userId ?? user.id)}</td>
                      <td>
                        <strong>
                          {displayValue(
                            user.name ?? user.userName ?? user.username
                          )}
                        </strong>
                      </td>
                      <td>{displayValue(user.email)}</td>
                      <td>
                        <span className="badge blue">
                          {displayValue(user.role ?? user.type)}
                        </span>
                      </td>
                      <td>
                        {displayValue(
                          user.facilityName ?? user.facility?.name,
                          "시설 미연결"
                        )}
                      </td>
                      <td>{displayValue(user.phoneNumber ?? user.phone)}</td>
                      <td>
                        <span className={getStatusBadge(status)}>{status}</span>
                      </td>
                      <td>
                        <button className="mini-button" disabled>
                          비활성화
                        </button>
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

export default AdminUsersPage;
