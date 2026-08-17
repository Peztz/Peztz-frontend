import { useEffect, useState } from "react";

import { getMyPets } from "../../api/pets";
import { getDailyReport } from "../../api/reports";

function todayInLocalTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function OwnerReportPage() {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [date, setDate] = useState(todayInLocalTime());
  const [report, setReport] = useState(null);
  const [isPetsLoading, setIsPetsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMyPets()
      .then((data) => {
        if (cancelled) return;
        setPets(data);
        if (data[0]) setSelectedPetId(String(data[0].id || data[0].petId));
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.response?.data?.message || "반려동물 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!cancelled) setIsPetsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFetchReport = async () => {
    if (!selectedPetId) {
      setError("리포트를 조회할 반려동물을 선택해 주세요.");
      return;
    }
    setIsLoading(true);
    setError("");
    setReport(null);
    try {
      setReport(await getDailyReport(selectedPetId, date));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "해당 날짜의 일일 리포트를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="owner-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Daily Health Report</span>
          <h1>일일 건강 리포트</h1>
          <p>세션 로그로 집계된 환경 정보와 일일 요약을 확인합니다.</p>
        </div>
        <span className="badge green">API 연결</span>
      </section>

      <section className="report-query-bar">
        <div className="section-header">
          <div><h2>조회 조건</h2><p>반려동물과 날짜를 선택해 주세요.</p></div>
        </div>
        <div className="form-grid">
          <label>
            <span>반려동물</span>
            <select value={selectedPetId} onChange={(event) => setSelectedPetId(event.target.value)} disabled={isPetsLoading}>
              {pets.length === 0 && <option value="">등록된 반려동물 없음</option>}
              {pets.map((pet) => {
                const id = pet.id || pet.petId;
                return <option key={id} value={id}>{pet.name || pet.petName}</option>;
              })}
            </select>
          </label>
          <label>
            <span>날짜</span>
            <input type="date" value={date} max={todayInLocalTime()} onChange={(event) => setDate(event.target.value)} />
          </label>
        </div>
        <div className="form-actions">
          <button className="primary-button" onClick={handleFetchReport} disabled={isLoading || isPetsLoading || !selectedPetId}>
            {isLoading ? "리포트 조회 중" : "리포트 조회"}
          </button>
        </div>
      </section>

      {error && <div className="form-error">{error}</div>}

      {report && (
        <>
          <section className="wellness-report">
            <header><div><span className="eyebrow">DAILY WELLNESS REPORT</span><h2>{pets.find((pet) => String(pet.id || pet.petId) === selectedPetId)?.name || "반려동물"}</h2></div><time>{report.date}</time></header>
            <div className="report-metrics">
              <div><span>평균 온도</span><strong>{report.averageTemperature == null ? "-" : report.averageTemperature}<small>°C</small></strong><p>측정 로그 평균</p></div>
              <div><span>평균 습도</span><strong>{report.averageHumidity == null ? "-" : report.averageHumidity}<small>%</small></strong><p>측정 로그 평균</p></div>
              <div><span>전체 로그</span><strong>{report.totalLogCount}<small>건</small></strong><p>오늘 수집된 기록</p></div>
              <div><span>센서 로그</span><strong>{report.sensorLogCount}<small>건</small></strong><p>온·습도 측정 기록</p></div>
            </div>
            <div className="report-insight"><span>오늘의 인사이트</span><p>{report.summary}</p></div>
          </section>
          <section className="report-coming-soon">
            <div className="section-header"><div><h2>추가 건강 분석</h2><p>체중 변화, 수면 분석, 건강 점수는 백엔드 API 제공 후 연결됩니다.</p></div><span className="badge gray">연동 예정</span></div>
          </section>
        </>
      )}
    </div>
  );
}

export default OwnerReportPage;
