import { useState } from "react";

function AdminUsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [users, setUsers] = useState([
    {
      id: "USER-001",
      name: "김민지",
      email: "minji@example.com",
      role: "USER",
      facility: "-",
      status: "ACTIVE",
    },
    {
      id: "USER-002",
      name: "박성훈",
      email: "manager-a@example.com",
      role: "FACILITY",
      facility: "A 펫호텔",
      status: "ACTIVE",
    },
    {
      id: "USER-003",
      name: "주정현",
      email: "admin@example.com",
      role: "ADMIN",
      facility: "-",
      status: "ACTIVE",
    },
  ]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [facility, setFacility] = useState("");

  const handleCreateUser = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      alert("이름과 이메일을 입력해주세요.");
      return;
    }

    const newUser = {
      id: `USER-${String(users.length + 1).padStart(3, "0")}`,
      name: name.trim(),
      email: email.trim(),
      role,
      facility: role === "FACILITY" ? facility || "미배정" : "-",
      status: "ACTIVE",
    };

    setUsers([newUser, ...users]);
    setName("");
    setEmail("");
    setRole("USER");
    setFacility("");
    setIsFormOpen(false);
  };

  const toggleStatus = (userId) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
            }
          : user
      )
    );
  };

  return (
    <div className="admin-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">User Management</span>
          <h1>회원 관리</h1>
          <p>
            견주, 시설 관리자, 시스템 관리자 계정을 조회하고 계정 상태를
            관리합니다.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setIsFormOpen((prev) => !prev)}
        >
          {isFormOpen ? "닫기" : "회원 추가"}
        </button>
      </section>

      {isFormOpen && (
        <section className="admin-card">
          <div className="section-header">
            <div>
              <h2>회원 계정 생성</h2>
              <p>회원 테이블 기준으로 이름, 이메일, 역할, 소속 시설을 등록합니다.</p>
            </div>
          </div>

          <form className="clean-form" onSubmit={handleCreateUser}>
            <div className="form-grid">
              <div className="form-field">
                <label>이름</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 김민지"
                />
              </div>

              <div className="form-field">
                <label>이메일</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="예: user@example.com"
                />
              </div>

              <div className="form-field">
                <label>역할</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="USER">견주</option>
                  <option value="FACILITY">시설 관리자</option>
                  <option value="ADMIN">시스템 관리자</option>
                </select>
              </div>

              <div className="form-field">
                <label>소속 시설</label>
                <input
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  placeholder="시설 관리자일 경우 입력"
                  disabled={role !== "FACILITY"}
                />
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
                생성
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-card">
        <div className="section-header">
          <div>
            <h2>회원 목록</h2>
            <p>전체 회원 계정과 역할, 소속 시설, 계정 상태를 확인합니다.</p>
          </div>
          <span className="count-badge">{users.length}명</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>회원 ID</th>
                <th>이름</th>
                <th>이메일</th>
                <th>역할</th>
                <th>소속 시설</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge blue">{user.role}</span>
                  </td>
                  <td>{user.facility}</td>
                  <td>
                    <span
                      className={
                        user.status === "ACTIVE" ? "badge green" : "badge red"
                      }
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="mini-button"
                      onClick={() => toggleStatus(user.id)}
                    >
                      {user.status === "ACTIVE" ? "비활성화" : "활성화"}
                    </button>
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

export default AdminUsersPage;