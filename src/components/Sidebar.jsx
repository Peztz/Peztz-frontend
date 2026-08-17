import { NavLink } from "react-router-dom";

import { normalizeRole } from "../api/client";
import UiIcon from "./UiIcon";

function Sidebar() {
    const role = normalizeRole(localStorage.getItem("peztz_role"));

    const ownerMenus = [
        { path: "/owner", label: "홈", icon: "home" },
        { path: "/owner/pets", label: "내 반려동물", icon: "pet" },
        { path: "/owner/health", label: "Health", icon: "health" },
        { path: "/owner/events", label: "이벤트 다시보기", icon: "play" },
        { path: "/owner/reports", label: "일일 리포트", icon: "report" },
    ];

    const facilityMenus = [
        { path: "/facility", label: "시설 홈", icon: "home" },
        { path: "/facility/cages", label: "케이지 관리", icon: "cage" },
        { path: "/facility/admissions", label: "입실 관리", icon: "admission" },
        { path: "/facility/devices", label: "장치 관리", icon: "device" },
        { path: "/facility/logs", label: "운영 로그", icon: "log" },
    ];

    const adminMenus = [
        { path: "/admin", label: "관리자 홈", icon: "home" },
        { path: "/admin/facilities", label: "전체 시설 관리", icon: "facility" },
        { path: "/admin/cages", label: "전체 케이지 관리", icon: "cage" },
        { path: "/admin/devices", label: "전체 장비 관리", icon: "device" },
        { path: "/admin/users", label: "전체 사용자 관리", icon: "users" },
    ];

    let menus = ownerMenus;

    if (role === "FACILITY") {
        menus = facilityMenus;
    }

    if (role === "ADMIN") {
        menus = adminMenus;
    }

    const roleLabel = role === "FACILITY" ? "시설 관리자" : role === "ADMIN" ? "시스템 관리자" : "보호자";

    return (
        <aside className="sidebar">
            <div className="logo-area">
                <div className="logo-icon">P<span>+</span></div>
                <div>
                    <h1>PEZTZ</h1>
                    <p>Pet Care Platform</p>
                </div>
            </div>

            <div className="sidebar-role"><span>WORKSPACE</span><strong>{roleLabel}</strong></div>
            <nav className="side-nav" aria-label={`${roleLabel} 메뉴`}>
                {menus.map((menu) => (
                    <NavLink
                        key={menu.path}
                        to={menu.path}
                        end={menu.path === "/owner" || menu.path === "/facility" || menu.path === "/admin"}
                        className={({ isActive }) =>
                            isActive ? "side-link active" : "side-link"
                        }
                    >
                        <UiIcon name={menu.icon} />
                        <span>{menu.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
