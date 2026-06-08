import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { buildVideoUrl } from "../../api/client";
import { getMyCages } from "../../api/owner";
import { getMyPets } from "../../api/pets";

function OwnerHomePage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [cages, setCages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOwnerData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [petData, cageData] = await Promise.all([getMyPets(), getMyCages()]);
        const normalizedCages = cageData.map((cage) => ({
          ...cage,
          id: String(cage.sessionId || cage.cageId),
          sessionId: Number(cage.sessionId),
          deviceStatus: cage.videoUrl ? "ONLINE" : "UNKNOWN",
          temperature: "-",
          humidity: "-",
          specialCount: 0,
          reportStatus: "조회 가능",
          videoUrl: buildVideoUrl({ videoUrl: cage.videoUrl }),
        }));

        setPets(petData);
        setCages(normalizedCages);
        localStorage.setItem("peztz_owner_pets", JSON.stringify(petData));
        localStorage.setItem("peztz_owner_cages", JSON.stringify(normalizedCages));
      } catch (error) {
        const fallbackPets = JSON.parse(
          localStorage.getItem("peztz_owner_pets") || "[]"
        );
        const fallbackCages = JSON.parse(
          localStorage.getItem("peztz_owner_cages") || "[]"
        );

        setPets(fallbackPets);
        setCages(fallbackCages);
        setErrorMessage(
          error.response?.data?.message ||
            "견주 정보를 불러오지 못했습니다. 저장된 정보가 있으면 대신 표시합니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadOwnerData();
  }, []);

  const openLivePage = (cage) => {
    navigate(`/owner/cages/${cage.id}/live`, { state: { cage } });
  };

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

      {errorMessage && <div className="form-error">{errorMessage}</div>}

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

        {isLoading ? (
          <div className="small-empty">케이지 정보를 불러오는 중입니다.</div>
        ) : cages.length === 0 ? (
          <div className="small-empty">
            아직 연결된 케이지가 없습니다. 시설에서 받은 접근 코드를 등록해주세요.
          </div>
        ) : (
          <div className="registered-cage-grid">
            {cages.map((cage) => (
              <article
                className="registered-cage-card"
                key={cage.id}
                onClick={() => openLivePage(cage)}
              >
                <div className="registered-cage-top">
                  <div>
                    <span className="badge blue">
                      {cage.status === "OCCUPIED" || cage.status === "ACTIVE"
                        ? "입실 중"
                        : cage.status}
                    </span>
                  </div>
                  <span
                    className={
                      cage.deviceStatus === "ONLINE" ? "badge green" : "badge gray"
                    }
                  >
                    {cage.deviceStatus}
                  </span>
                </div>

                <div className="registered-cage-body">
                  <h3>{cage.petName}</h3>
                  <p>{cage.facilityName || "시설 정보 없음"}</p>

                  <div className="registered-cage-info">
                    <div>
                      <span>시설</span>
                      <strong>{cage.facilityName || "-"}</strong>
                    </div>
                    <div>
                      <span>케이지</span>
                      <strong>{cage.cageName || "-"}</strong>
                    </div>
                    <div>
                      <span>영상</span>
                      <strong>{cage.videoUrl ? "연결됨" : "없음"}</strong>
                    </div>
                  </div>
                </div>

                <button
                  className="primary-button full"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLivePage(cage);
                  }}
                >
                  실시간 상태 보기
                </button>
              </article>
            ))}
          </div>
        )}
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

        {isLoading ? (
          <div className="small-empty">반려동물 정보를 불러오는 중입니다.</div>
        ) : pets.length === 0 ? (
          <div className="small-empty">아직 등록된 반려동물이 없습니다.</div>
        ) : (
          <div className="pet-list-compact">
            {pets.map((pet) => (
              <div className="pet-chip" key={pet.id}>
                <strong>{pet.name}</strong>
                <span>{pet.breed || "품종 정보 없음"}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default OwnerHomePage;
