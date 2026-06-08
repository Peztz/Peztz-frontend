import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getMe, login } from "../api/auth";
import { normalizeRole, saveAuth } from "../api/client";

function getRoleHome(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "ADMIN") return "/admin";
  if (normalizedRole === "FACILITY") return "/facility";
  return "/owner";
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setErrorMessage("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const loginResponse = await login({
        email: email.trim(),
        password,
      });

      saveAuth(loginResponse.accessToken, loginResponse.user);

      try {
        const me = await getMe();
        saveAuth(loginResponse.accessToken, me);
      } catch {
        // Login response is enough to keep the session usable.
      }

      const userRole = loginResponse.user?.role;
      const fallbackPath = getRoleHome(userRole);
      navigate(location.state?.from?.pathname || fallbackPath, { replace: true });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "로그인에 실패했습니다. 계정 정보를 확인해주세요."
      );
    } finally {
      setIsLoading(false);
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
        <p>Peztz 계정으로 로그인하세요.</p>

        <form onSubmit={handleLogin}>
          <label>이메일</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@example.com"
            type="email"
          />

          <label>비밀번호</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password1234"
            type="password"
          />

          {errorMessage && <div className="form-error">{errorMessage}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "로그인 중..." : "Peztz 시작하기"}
          </button>
        </form>

        <p className="login-help">
          계정이 없나요? <Link to="/signup">회원가입</Link>
        </p>
      </section>
    </div>
  );
}

export default LoginPage;
