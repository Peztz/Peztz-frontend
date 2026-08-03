import { NavLink } from "react-router-dom";

import { normalizeRole } from "../api/client";

function Sidebar() {
    const role = normalizeRole(localStorage.getItem("peztz_role"));

    const ownerMenus = [
        { path: "/owner", label: "홈" },
        { path: "/owner/pets", label: "내 반려동물" },
        { path: "/owner/health", label: "Health" },
        { path: "/owner/events", label: "이벤트 다시보기" },
        { path: "/owner/reports", label: "일일 리포트" },
    ];

    const facilityMenus = [
        { path: "/facility", label: "시설 홈" },
        { path: "/facility/cages", label: "케이지 관리" },
        { path: "/facility/admissions", label: "입실 관리" },
    ];

    const adminMenus = [
        { path: "/admin", label: "관리자 홈" },
        { path: "/admin/facilities", label: "전체 시설 관리" },
        { path: "/admin/cages", label: "전체 케이지 관리" },
        { path: "/admin/devices", label: "전체 장비 관리" },
        { path: "/admin/users", label: "전체 사용자 관리" },
    ];

    let menus = ownerMenus;

    if (role === "FACILITY") {
        menus = facilityMenus;
    }

    if (role === "ADMIN") {
        menus = adminMenus;
    }

    return (
        <aside className="sidebar">
            <div className="logo-area">
                <div className="logo-icon">P</div>
                <div>
                    <h1>Peztz</h1>
                    <p>Pet Care Platform</p>
                </div>
            </div>

            <nav className="side-nav">
                {menus.map((menu) => (
                    <NavLink
                        key={menu.path}
                        to={menu.path}
                        end={menu.path === "/owner" || menu.path === "/facility" || menu.path === "/admin"}
                        className={({ isActive }) =>
                            isActive ? "side-link active" : "side-link"
                        }
                    >
                        {menu.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
