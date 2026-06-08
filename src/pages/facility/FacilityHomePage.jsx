import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DEFAULT_FACILITY_ID, getFacilityCages } from "../../api/facility";

function FacilityHomePage() {
  const navigate = useNavigate();
  const [cages, setCages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    getFacilityCages()
      .then((data) => {
        if (isMounted) setCages(data);
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(
          error.response?.data?.message || "시설 케이지 현황을 불러오지 못했습니다."
        );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const available = cages.filter((cage) => cage.status === "AVAILABLE").length;
    const occupied = cages.filter((cage) => cage.status === "OCCUPIED").length;
    const maintenance = cages.filter((cage) => cage.status === "MAINTENANCE").length;

    return { available, occupied, maintenance };
  }, [cages]);

  return (
    <div className="facility-page">
      <section className="facility-hero">
        <div>
          <span className="eyebrow">Facility Operations</span>
          <h1>시설 관리자 홈</h1>
          <p>
            케이지를 등록하고 보호자 이메일로 반려동물을 조회한 뒤 입실 세션과
            접근 코드를 발급합니다.
          </p>
          <p className="inline-help">현재 테스트 시설 ID: {DEFAULT_FACILITY_ID}</p>
        </div>

        <div className="hero-actions">
          <button
            className="secondary-button"
            onClick={() => navigate("/facility/cages")}
          >
            케이지 관리
          </button>
          <button
            className="primary-button"
            onClick={() => navigate("/facility/admissions")}
          >
            입실 관리
          </button>
        </div>
      </section>

      {errorMessage && <div className="form-error">{errorMessage}</div>}

      <section className="facility-summary-grid">
        <div className="facility-stat-card">
          <span>전체 케이지</span>
          <strong>{isLoading ? "-" : cages.length}</strong>
          <p>시설에 등록된 케이지</p>
        </div>
        <div className="facility-stat-card">
          <span>사용 가능</span>
          <strong>{isLoading ? "-" : stats.available}</strong>
          <p>입실 처리 가능</p>
        </div>
        <div className="facility-stat-card">
          <span>입실 중</span>
          <strong>{isLoading ? "-" : stats.occupied}</strong>
          <p>현재 ACTIVE 세션 사용</p>
        </div>
        <div className="facility-stat-card danger">
          <span>점검</span>
          <strong>{isLoading ? "-" : stats.maintenance}</strong>
          <p>사용 전 확인 필요</p>
        </div>
      </section>

      <section className="facility-grid-2">
        <div className="facility-card">
          <div className="section-header">
            <div>
              <h2>업무 흐름</h2>
              <p>시설 관리자가 콘솔 없이 처리하는 입실 절차입니다.</p>
            </div>
          </div>

          <div className="process-grid">
            <div>
              <strong>1</strong>
              <span>케이지 등록</span>
            </div>
            <div>
              <strong>2</strong>
              <span>보호자 이메일 조회</span>
            </div>
            <div>
              <strong>3</strong>
              <span>반려동물 선택</span>
            </div>
            <div>
              <strong>4</strong>
              <span>케이지 선택</span>
            </div>
            <div>
              <strong>5</strong>
              <span>접근 코드 발급</span>
            </div>
          </div>
        </div>

        <div className="facility-card">
          <div className="section-header">
            <div>
              <h2>최근 케이지</h2>
              <p>시설별 케이지 목록 일부입니다.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="small-empty">케이지 현황을 불러오는 중입니다.</div>
          ) : cages.length === 0 ? (
            <div className="small-empty">등록된 케이지가 없습니다.</div>
          ) : (
            <div className="alert-list">
              {cages.slice(0, 4).map((cage) => (
                <div className="alert-item" key={cage.id}>
                  <div className="alert-icon normal">C</div>
                  <div>
                    <strong>{cage.name}</strong>
                    <p>
                      {cage.cageNumber || "-"} · {cage.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default FacilityHomePage;
