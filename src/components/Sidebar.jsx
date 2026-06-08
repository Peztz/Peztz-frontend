import { NavLink } from "react-router-dom";

function Sidebar() {
    const role = localStorage.getItem("peztz_role");

    const ownerMenus = [
        { path: "/owner", label: "홈" },
        { path: "/owner/pets", label: "내 반려동물" },
        { path: "/owner/reports", label: "일일 리포트" },
    ];

    const facilityMenus = [
        { path: "/facility", label: "대시보드" },
        { path: "/facility/cages", label: "케이지 관리" },
        { path: "/facility/sessions", label: "입실 세션" },
        { path: "/facility/devices", label: "장비 상태" },
        { path: "/facility/logs", label: "로그/이벤트" },
    ];

    const adminMenus = [
        { path: "/admin", label: "대시보드" },
        { path: "/admin/users", label: "회원 관리" },
        { path: "/admin/facilities", label: "시설 관리" },
        { path: "/admin/cages", label: "케이지 관리" },
        { path: "/admin/devices", label: "기기 관리" },
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