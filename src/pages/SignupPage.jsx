import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { signup } from "../api/auth";

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("OWNER");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password || !name.trim()) {
      setErrorMessage("이메일, 비밀번호, 이름은 필수입니다.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await signup({
        email: email.trim(),
        password,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        role,
      });

      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/login");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "회원가입에 실패했습니다. 입력값을 확인해주세요."
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
          견주는 반려동물을 등록하고, 병원과 시설은 케이지 입실과 보호자
          접근 코드를 관리할 수 있습니다.
        </p>
      </section>

      <section className="login-panel">
        <h2>회원가입</h2>
        <p>사용 목적에 맞는 계정 유형을 선택해주세요.</p>

        <form onSubmit={handleSubmit}>
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

          <label>이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="김견주"
          />

          <label>전화번호</label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="010-1234-5678"
          />

          <label>역할</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="OWNER">견주</option>
            <option value="HOSPITAL">병원/시설 관리자</option>
            <option value="ADMIN">시스템 관리자</option>
          </select>

          {errorMessage && <div className="form-error">{errorMessage}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="login-help">
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </p>
      </section>
    </div>
  );
}

export default SignupPage;
