import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function OwnerHomePage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [cages, setCages] = useState([]);

  useEffect(() => {
    const savedPets = JSON.parse(localStorage.getItem("peztz_owner_pets") || "[]");
    const savedCages = JSON.parse(localStorage.getItem("peztz_owner_cages") || "[]");

    const demoCage = {
      id: "cage-demo-001",
      petName: "초코",
      petBreed: "푸들",
      facilityName: "A 펫호텔",
      cageName: "1번 케이지",
      status: "ACTIVE",
      deviceStatus: "ONLINE",
      temperature: "26.4°C",
      specialCount: 3,
      reportStatus: "생성 완료",
      isDemo: true,
    };

    setPets(savedPets);
    setCages(savedCages.length > 0 ? savedCages : [demoCage]);
  }, []);

  return (
    <div className="owner-page">
      <section className="owner-hero">
        <div>
          <span className="eyebrow">Owner Dashboard</span>
          <h1>견주 홈</h1>
          <p>
            내 반려동물의 케이지 접근 권한을 등록하고, 실시간 상태와 일일
            리포트를 확인할 수 있습니다.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/owner/register-cage")}
        >
          케이지 등록
        </button>
      </section>

      <section className="owner-summary-grid">
        <div className="summary-card">
          <span>등록 반려동물</span>
          <strong>{pets.length}</strong>
        </div>
        <div className="summary-card">
          <span>등록 케이지</span>
          <strong>{cages.length}</strong>
        </div>
        <div className="summary-card">
          <span>최근 특이사항</span>
          <strong>{cages.reduce((sum, cage) => sum + (cage.specialCount || 0), 0)}</strong>
        </div>
      </section>

      <section className="content-card">
        <div className="section-header">
          <div>
            <h2>현재 등록된 케이지</h2>
            <p>
              접근 코드 인증이 완료된 케이지가 표시됩니다. 카드를 누르면
              실시간 상태 화면으로 이동합니다.
            </p>
          </div>
        </div>

        <div className="registered-cage-grid">
          {cages.map((cage) => (
            <article
              className="registered-cage-card"
              key={cage.id}
              onClick={() => navigate(`/owner/cages/${cage.id}/live`)}
            >
              <div className="registered-cage-top">
                <div>
                  <span className="badge blue">
                    {cage.status === "ACTIVE" ? "입실 중" : cage.status}
                  </span>
                  {cage.isDemo && <span className="badge gray">예시</span>}
                </div>
                <span
                  className={
                    cage.deviceStatus === "ONLINE" ? "badge green" : "badge red"
                  }
                >
                  {cage.deviceStatus}
                </span>
              </div>

              <div className="registered-cage-body">
                <h3>{cage.petName}</h3>
                <p>{cage.petBreed || "품종 정보 없음"}</p>

                <div className="registered-cage-info">
                  <div>
                    <span>시설</span>
                    <strong>{cage.facilityName}</strong>
                  </div>
                  <div>
                    <span>케이지</span>
                    <strong>{cage.cageName}</strong>
                  </div>
                  <div>
                    <span>현재 온도</span>
                    <strong>{cage.temperature}</strong>
                  </div>
                </div>
              </div>

              <button
                className="primary-button full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/owner/cages/${cage.id}/live`);
                }}
              >
                실시간 상태 보기
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="content-card">
        <div className="section-header">
          <div>
            <h2>내 반려동물</h2>
            <p>등록된 반려동물은 케이지 등록 시 선택 항목으로 표시됩니다.</p>
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("/owner/pets")}
          >
            반려동물 관리
          </button>
        </div>

        {pets.length === 0 ? (
          <div className="small-empty">아직 등록된 반려동물이 없습니다.</div>
        ) : (
          <div className="pet-list-compact">
            {pets.map((pet) => (
              <div className="pet-chip" key={pet.id}>
                <strong>{pet.name}</strong>
                <span>{pet.breed}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default OwnerHomePage;