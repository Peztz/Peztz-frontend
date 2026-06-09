import { useEffect, useMemo, useState } from "react";
import { getAdminUsers } from "../../api/admin";

const ROLE_FILTERS = ["OWNER", "HOSPITAL", "ADMIN", "USER"];

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

function getUserName(user) {
  return user.name ?? user.userName ?? user.username;
}

function getUserRole(user) {
  return user.role ?? user.type;
}

function matchesRoleFilter(role, roleFilter) {
  if (!roleFilter) return true;

  const normalizedRole = String(role ?? "").toUpperCase();

  if (roleFilter === "HOSPITAL") {
    return ["HOSPITAL", "FACILITY", "FACILITY_MANAGER"].includes(normalizedRole);
  }

  return normalizedRole === roleFilter;
}

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

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

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const role = getUserRole(user);
      const searchableText = [getUserName(user), user.email, role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
        matchesRoleFilter(role, roleFilter)
      );
    });
  }, [roleFilter, searchTerm, users]);

  return (
    <div className="admin-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">User Management</span>
          <h1>전체 사용자 관리</h1>
          <p>관리자 API에서 조회한 전체 사용자 정보를 표시합니다.</p>
        </div>
      </section>

      <section className="admin-card">
        <div className="section-header">
          <div>
            <h2>사용자 목록</h2>
            <p>이름, 이메일, 역할로 사용자를 검색하고 역할별로 필터링합니다.</p>
          </div>
          <span className="count-badge">{filteredUsers.length}명</span>
        </div>

        <div className="admin-filter-bar">
          <div className="filter-field wide">
            <label htmlFor="user-search">검색</label>
            <input
              id="user-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="이름, 이메일, 역할 검색"
            />
          </div>
          <div className="filter-field">
            <label htmlFor="role-filter">역할</label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="">전체</option>
              {ROLE_FILTERS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && <p>불러오는 중...</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}

        {!loading && !errorMessage && users.length === 0 && (
          <p>조회된 사용자가 없습니다.</p>
        )}

        {!loading && !errorMessage && users.length > 0 && filteredUsers.length === 0 && (
          <p>조건에 맞는 사용자가 없습니다.</p>
        )}

        {!loading && !errorMessage && filteredUsers.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table users-table">
              <thead>
                <tr>
                  <th>회원 ID</th>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>소속 시설</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.userId ?? user.id ?? `user-${index}`}>
                    <td>{displayValue(user.userId ?? user.id)}</td>
                    <td>
                      <strong>{displayValue(getUserName(user))}</strong>
                    </td>
                    <td>{displayValue(user.email)}</td>
                    <td>
                      <span className="badge blue">
                        {displayValue(getUserRole(user))}
                      </span>
                    </td>
                    <td>
                      {displayValue(
                        user.facilityName ?? user.facility?.name,
                        "시설 미연결"
                      )}
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

export default AdminUsersPage;
