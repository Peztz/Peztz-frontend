import { useLocation, useNavigate } from "react-router-dom";

import { clearAuth, getStoredUser, normalizeRole } from "../api/client";
import StatusChip from "./StatusChip";
import UiIcon from "./UiIcon";

const roleLabels = { OWNER: "보호자", FACILITY: "시설 관리자", ADMIN: "시스템 관리자" };
const pageLabels = {
  "/owner": "홈", "/owner/pets": "내 반려동물", "/owner/health": "Health", "/owner/events": "이벤트 다시보기", "/owner/reports": "일일 리포트", "/owner/register-cage": "케이지 등록",
  "/facility": "시설 홈", "/facility/cages": "케이지 관리", "/facility/admissions": "입실 관리", "/facility/devices": "장치 관리", "/facility/logs": "운영 로그",
  "/admin": "관리자 홈", "/admin/users": "사용자 관리", "/admin/facilities": "시설 관리", "/admin/cages": "케이지 관리", "/admin/devices": "장비 관리",
};

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const role = normalizeRole(user?.role || localStorage.getItem("peztz_role"));
  const currentPage = pageLabels[location.pathname] || (location.pathname.includes("/live") ? "실시간 모니터링" : "PEZTZ");

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <header className="top-header">
      <div className="header-title">
        <div className="breadcrumb"><span>{roleLabels[role] || "PEZTZ"}</span><i>/</i><strong>{currentPage}</strong></div>
        <p>Pet Intelligence Platform</p>
      </div>

      <div className="header-actions">
        <StatusChip tone="success" dot>서비스 정상</StatusChip>
        <div className="user-box">
          <span className="user-avatar">{(user?.name || "P").slice(0, 1)}</span>
          <span className="user-meta"><strong>{user?.name || "사용자"}</strong><small>{roleLabels[role] || "PEZTZ 사용자"}</small></span>
        </div>
        <button className="mini-button" onClick={handleLogout}>
          <UiIcon name="logout" size={17} />
          <span>로그아웃</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
