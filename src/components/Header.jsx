function Header() {
  return (
    <header className="top-header">
      <div>
        <h2>Peztz</h2>
        <p>AI 기반 반려동물 상태 모니터링 시스템</p>
      </div>

      <div className="header-actions">
        <span className="status-pill online">서버 정상</span>
        <div className="user-box">주정현</div>
      </div>
    </header>
  );
}

export default Header;