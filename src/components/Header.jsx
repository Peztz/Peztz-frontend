import { useNavigate } from "react-router-dom";

import { clearAuth, getStoredUser } from "../api/client";

function Header() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <header className="top-header">
      <div>
        <h2>Peztz</h2>
        <p>AI 기반 반려동물 상태 모니터링 시스템</p>
      </div>

      <div className="header-actions">
        <span className="status-pill online">서버 정상</span>
        <div className="user-box">{user?.name || "사용자"}</div>
        <button className="mini-button" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}

export default Header;
