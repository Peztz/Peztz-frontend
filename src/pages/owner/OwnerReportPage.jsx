import { useEffect, useState } from "react";

import { getMyPets } from "../../api/pets";
import { getDailyReport } from "../../api/reports";
import StatusChip from "../../components/StatusChip";

const RISK_PRESENTATION = {
  NORMAL: { label: "정상 범위", tone: "success" },
  ATTENTION: { label: "관찰 필요", tone: "warning" },
  URGENT: { label: "즉시 확인", tone: "danger" },
};

function todayInLocalTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatGeneratedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatMeasurement(value) {
  if (value == null) return "-";
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function getRequestErrorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data?.detail || fallback;
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
        if (!cancelled) {
          setError(
            getRequestErrorMessage(
              requestError,
              "반려동물 목록을 불러오지 못했습니다."
            )
          );
        }
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
      setError(
        getRequestErrorMessage(
          requestError,
          "해당 날짜의 일일 리포트를 불러오지 못했습니다."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPet = pets.find(
    (pet) => String(pet.id || pet.petId) === selectedPetId
  );
  const risk = report
    ? RISK_PRESENTATION[report.riskLevel] || RISK_PRESENTATION.NORMAL
    : RISK_PRESENTATION.NORMAL;
  const environment = report?.environmentCard;
  const generatedAt = formatGeneratedAt(report?.generatedAt);

  return (
    <div className="owner-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Daily Health Report</span>
          <h1>일일 건강 리포트</h1>
          <p>세션 로그로 집계된 환경 정보와 AI 행동 분석을 확인합니다.</p>
        </div>
        <span className="badge green">AI 리포트 연결</span>
      </section>

      <section className="report-query-bar">
        <div className="section-header">
          <div>
            <h2>조회 조건</h2>
            <p>반려동물과 날짜를 선택해 주세요.</p>
          </div>
        </div>
        <div className="form-grid">
          <label>
            <span>반려동물</span>
            <select
              value={selectedPetId}
              onChange={(event) => setSelectedPetId(event.target.value)}
              disabled={isPetsLoading}
            >
              {pets.length === 0 && (
                <option value="">등록된 반려동물 없음</option>
              )}
              {pets.map((pet) => {
                const id = pet.id || pet.petId;
                return (
                  <option key={id} value={id}>
                    {pet.name || pet.petName}
                  </option>
                );
              })}
            </select>
          </label>
          <label>
            <span>날짜</span>
            <input
              type="date"
              value={date}
              max={todayInLocalTime()}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="primary-button"
            onClick={handleFetchReport}
            disabled={isLoading || isPetsLoading || !selectedPetId}
          >
            {isLoading ? "AI 리포트 생성 중" : "리포트 조회"}
          </button>
        </div>
      </section>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {isLoading && (
        <section className="report-loading" aria-live="polite">
          <div className="report-loading__bar" />
          <div className="report-loading__cards">
            <span />
            <span />
            <span />
          </div>
          <p>수집된 로그를 분석해 일일 리포트를 만들고 있습니다.</p>
        </section>
      )}

      {report && (
        <div className="report-result" aria-live="polite">
          <section className="wellness-report">
            <header>
              <div>
                <span className="eyebrow">DAILY WELLNESS REPORT</span>
                <h2>{report.petName || selectedPet?.name || "반려동물"}</h2>
              </div>
              <div className="report-header-meta">
                <StatusChip tone={risk.tone} dot>
                  {risk.label}
                </StatusChip>
                <time>{report.date}</time>
              </div>
            </header>

            {report.status === "FAILED" && (
              <div className="report-alert report-alert--danger" role="alert">
                <strong>AI 분석을 완료하지 못했습니다.</strong>
                <p>수집 통계는 정상이며, 잠시 후 다시 조회하면 분석을 재시도합니다.</p>
              </div>
            )}

            {report.totalLogCount === 0 && (
              <div className="report-alert report-alert--neutral">
                <strong>분석할 관찰 기록이 없습니다.</strong>
                <p>선택한 날짜의 카메라와 센서 연결 상태를 확인해 주세요.</p>
              </div>
            )}

            <div className="report-metrics">
              <div>
                <span>평균 온도</span>
                <strong>
                  {formatMeasurement(report.averageTemperature)}
                  <small>°C</small>
                </strong>
                <p>측정 로그 평균</p>
              </div>
              <div>
                <span>평균 습도</span>
                <strong>
                  {formatMeasurement(report.averageHumidity)}
                  <small>%</small>
                </strong>
                <p>측정 로그 평균</p>
              </div>
              <div>
                <span>전체 로그</span>
                <strong>
                  {report.totalLogCount}
                  <small>건</small>
                </strong>
                <p>오늘 수집된 기록</p>
              </div>
              <div>
                <span>센서 로그</span>
                <strong>
                  {report.sensorLogCount}
                  <small>건</small>
                </strong>
                <p>온·습도 측정 기록</p>
              </div>
            </div>

            <div className="report-insight">
              <span>오늘의 AI 인사이트</span>
              <p>{report.summary}</p>
            </div>
          </section>

          <section className="report-analysis-card report-environment-card">
            <div className="report-card-heading">
              <div>
                <span className="eyebrow">Environment</span>
                <h2>{environment.title}</h2>
              </div>
              <StatusChip tone="info">DB 집계</StatusChip>
            </div>
            <p className="report-card-description">{environment.description}</p>
            <div className="report-environment-metrics">
              <div>
                <span>평균 온도</span>
                <strong>
                  {formatMeasurement(environment.averageTemperature)}
                  <small>°C</small>
                </strong>
              </div>
              <div>
                <span>평균 습도</span>
                <strong>
                  {formatMeasurement(environment.averageHumidity)}
                  <small>%</small>
                </strong>
              </div>
              <div>
                <span>문 열림</span>
                <strong>
                  {environment.doorOpenCount}
                  <small>회</small>
                </strong>
              </div>
              <div>
                <span>저조도 감지</span>
                <strong>
                  {environment.lowLightCount}
                  <small>회</small>
                </strong>
              </div>
            </div>
          </section>

          <section className="report-analysis-section">
            <div className="section-header report-section-heading">
              <div>
                <h2>행동 분석</h2>
                <p>실제 관찰 로그에 근거한 AI 분석입니다.</p>
              </div>
              <span className="badge blue">
                {report.behaviorCards.length}개 관찰
              </span>
            </div>

            {report.behaviorCards.length > 0 ? (
              <div className="report-behavior-grid">
                {report.behaviorCards.map((card, index) => (
                  <article
                    className="report-behavior-card"
                    key={`${card.title}-${index}`}
                  >
                    <span className="report-card-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    {card.evidence.length > 0 && (
                      <ul className="report-evidence-list">
                        {card.evidence.map((evidence, evidenceIndex) => (
                          <li key={`${evidence}-${evidenceIndex}`}>{evidence}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="report-inline-empty">
                별도로 분류된 행동 관찰이 없습니다.
              </div>
            )}
          </section>

          <section className="report-guidance-grid">
            <article className="report-analysis-card">
              <div className="report-card-heading">
                <div>
                  <span className="eyebrow">Care Guide</span>
                  <h2>오늘의 돌봄 제안</h2>
                </div>
              </div>
              {report.careTips.length > 0 ? (
                <ul className="report-check-list">
                  {report.careTips.map((tip, index) => (
                    <li key={`${tip}-${index}`}>{tip}</li>
                  ))}
                </ul>
              ) : (
                <p className="report-card-description">
                  추가로 제안된 돌봄 항목이 없습니다.
                </p>
              )}
            </article>

            <article className="report-analysis-card">
              <div className="report-card-heading">
                <div>
                  <span className="eyebrow">Notice</span>
                  <h2>확인할 내용</h2>
                </div>
              </div>
              {report.warnings.length > 0 ? (
                <ul className="report-warning-list">
                  {report.warnings.map((warning, index) => (
                    <li key={`${warning}-${index}`}>{warning}</li>
                  ))}
                </ul>
              ) : (
                <p className="report-card-description">
                  별도의 주의 메시지가 없습니다.
                </p>
              )}
            </article>
          </section>

          <footer className="report-disclaimer">
            <p>{report.disclaimer}</p>
            {generatedAt && <time>생성 시각 {generatedAt}</time>}
          </footer>
        </div>
      )}
    </div>
  );
}

export default OwnerReportPage;
