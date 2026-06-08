import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("OWNER");

  const handleLogin = () => {
    localStorage.setItem("peztz_role", role);

    if (role === "OWNER") {
      navigate("/owner");
    } else if (role === "FACILITY") {
      navigate("/facility");
    } else if (role === "ADMIN") {
      navigate("/admin");
    }
  };

  return (
    <div className="login-page">
      <section className="login-visual">
        <h1>Peztz</h1>
        <p>
          프리미엄 펫호텔과 위탁시설을 위한 AI 기반 반려동물 상태
          모니터링 플랫폼입니다. 케이지 영상, 센서 데이터, 이벤트 로그,
          일일 리포트를 한 화면에서 관리할 수 있습니다.
        </p>
      </section>

      <section className="login-panel">
        <h2>로그인</h2>
        <p>테스트용 역할을 선택하고 화면을 확인하세요.</p>

        <label>사용자 역할</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="OWNER">견주</option>
          <option value="FACILITY">시설 관리자</option>
          <option value="ADMIN">시스템 관리자</option>
        </select>

        <button onClick={handleLogin}>Peztz 시작하기</button>
      </section>
    </div>
  );
}

export default LoginPage;