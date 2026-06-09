import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { buildVideoUrl } from "../../api/client";
import { getSessionDailyReport, getSessionLogs } from "../../api/owner";
import { formatPetAge } from "../../utils/petAge";

function OwnerCageLivePage() {
  const { cageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("summary");
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [logs, setLogs] = useState([]);
  const [report, setReport] = useState(null);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [videoStreamState, setVideoStreamState] = useState({
    url: "",
    status: "checking",
  });

  const cage = useMemo(() => {
    if (location.state?.cage) {
      return location.state.cage;
    }

    const savedCages = JSON.parse(localStorage.getItem("peztz_owner_cages") || "[]");
    const foundCage = savedCages.find((item) =>
      [item.id, item.sessionId, item.cageId].map(String).includes(String(cageId))
    );

    if (foundCage) {
      return foundCage;
    }

    const lastVerifiedCage = JSON.parse(
      localStorage.getItem("peztz_last_verified_cage") || "null"
    );

    if (
      lastVerifiedCage &&
      [lastVerifiedCage.id, lastVerifiedCage.sessionId, lastVerifiedCage.cageId]
        .map(String)
        .includes(String(cageId))
    ) {
      return lastVerifiedCage;
    }

    return {
      id: cageId,
      sessionId: Number(cageId),
      petName: "반려동물",
      petBreed: "",
      facilityName: "시설 정보 없음",
      cageName: "케이지 정보 없음",
      status: "ACTIVE",
      deviceStatus: "UNKNOWN",
      temperature: "-",
      humidity: "-",
      reportStatus: "조회 대기",
    };
  }, [cageId, location.state]);

  const sessionId = Number(cage.sessionId || cage.id);
  const hasNumericSessionId = Number.isFinite(sessionId);
  const videoUrl = buildVideoUrl({
    deviceId: cage.raspberryPiDeviceId || cage.deviceId,
    videoUrl: cage.videoUrl,
  });
  const videoStreamStatus = !videoUrl
    ? "offline"
    : videoStreamState.url === videoUrl
      ? videoStreamState.status
      : "checking";
  const videoStatusBadgeClass =
    videoStreamStatus === "online"
      ? "badge green"
      : videoStreamStatus === "checking"
        ? "badge gray"
        : "badge red";
  const videoStatusLabel =
    videoStreamStatus === "online"
      ? "ONLINE"
      : videoStreamStatus === "checking"
        ? "확인 중"
        : "OFFLINE";
  const videoUrlStatusLabel = !videoUrl
    ? "없음"
    : videoStreamStatus === "online"
      ? "연결됨"
      : videoStreamStatus === "checking"
        ? "확인 중"
        : "연결 실패";
  // TODO: Ask backend to include petBreed, birthDate, and medicalNote/memo in OwnerCageResponse.
  const petBreed = cage.petBreed || cage.breed || cage.pet?.breed || "";
  const petBirthDate = cage.birthDate || cage.petBirthDate || cage.pet?.birthDate || "";
  const petMemo =
    cage.medicalNote ||
    cage.memo ||
    cage.petMedicalNote ||
    cage.petMemo ||
    cage.pet?.medicalNote ||
    cage.pet?.memo ||
    "";

  useEffect(() => {
    const loadLogsAndReport = async () => {
      if (!hasNumericSessionId) return;

      setErrorMessage("");
      setIsLogsLoading(true);
      setIsReportLoading(true);

      try {
        const logData = await getSessionLogs(sessionId);
        setLogs(logData);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "세션 로그를 불러오지 못했습니다."
        );
      } finally {
        setIsLogsLoading(false);
      }

      try {
        const today = new Date().toISOString().slice(0, 10);
        const reportData = await getSessionDailyReport(sessionId, today);
        setReport(reportData);
      } catch {
        setReport(null);
      } finally {
        setIsReportLoading(false);
      }
    };

    loadLogsAndReport();
  }, [hasNumericSessionId, sessionId]);

  const displayLogs = logs.map((log) => ({
    id: log.id,
    time: log.createdAt ? log.createdAt.slice(11, 16) : "-",
    type: log.type,
    message: log.message || "메시지가 없습니다.",
    level: log.type === "SENSOR" ? "NORMAL" : "INFO",
    temperature: log.temperature,
    humidity: log.humidity,
  }));

  const handleAsk = () => {
    if (!question.trim()) {
      alert("질문을 입력해주세요.");
      return;
    }

    setAiAnswer(
      "현재는 LLM 연동 전 화면입니다. 세션 로그와 일일 리포트 조회까지 1차 연결되어 있습니다."
    );
  };

  return (
    <div className="owner-live-page">
      <section className="live-head">
        <div>
          <button className="back-link-button" onClick={() => navigate("/owner")}>
            ← 견주 홈으로
          </button>

          <span className="eyebrow">Live Monitoring</span>
          <h1>{cage.petName}의 실시간 케이지 상태</h1>
          <p>
            {cage.facilityName} / {cage.cageName} · {petBreed || "품종 정보 없음"}
          </p>
        </div>

        <div className="live-status-box">
          <span className="badge blue">입실 중</span>
          <span className={videoStatusBadgeClass}>{videoStatusLabel}</span>
        </div>
      </section>

      {errorMessage && <div className="form-error">{errorMessage}</div>}

      <section className="live-main-grid">
        <div className="live-video-card">
          <div className="live-video-placeholder">
            {videoUrl && videoStreamStatus !== "offline" ? (
              <img
                className="live-video-stream"
                src={videoUrl}
                alt="실시간 케이지 영상"
                onLoad={() =>
                  setVideoStreamState({
                    url: videoUrl,
                    status: "online",
                  })
                }
                onError={() =>
                  setVideoStreamState({
                    url: videoUrl,
                    status: "offline",
                  })
                }
              />
            ) : (
              <div className="video-empty-message">
                <div className="live-dot"></div>
                <h2>실시간 스트리밍을 표시할 수 없습니다</h2>
                <p>배포 환경에서는 영상 스트리밍이 제한될 수 있습니다.</p>
                <p>최종 시연은 로컬 환경에서 진행합니다.</p>
                <p>라즈베리파이가 꺼져 있을 수 있습니다.</p>
                <p>camera_stream.py가 실행 중인지 확인해주세요.</p>
                <p>Tailscale IP가 서버에 등록되어 있는지 확인해주세요.</p>
              </div>
            )}
          </div>
        </div>

        <aside className="live-side-card">
          <h2>현재 상태</h2>

          <div className="live-info-list">
            <div>
              <span>세션 ID</span>
              <strong>{hasNumericSessionId ? sessionId : "-"}</strong>
            </div>
            <div>
              <span>반려동물</span>
              <strong>{cage.petName}</strong>
            </div>
            <div>
              <span>품종</span>
              <strong>{petBreed || "품종 정보 없음"}</strong>
            </div>
            <div>
              <span>나이</span>
              <strong>{formatPetAge(petBirthDate)}</strong>
            </div>
            <div>
              <span>주의사항</span>
              <strong>{petMemo || "등록된 주의사항 없음"}</strong>
            </div>
            <div>
              <span>시설</span>
              <strong>{cage.facilityName}</strong>
            </div>
            <div>
              <span>케이지</span>
              <strong>{cage.cageName}</strong>
            </div>
            <div>
              <span>영상 URL</span>
              <strong>{videoUrlStatusLabel}</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="live-metric-grid">
        <button
          className={activeTab === "summary" ? "live-metric-card active" : "live-metric-card"}
          onClick={() => setActiveTab("summary")}
        >
          <span>현재 온도</span>
          <strong>{cage.temperature || "-"}</strong>
          <p>최근 센서 온도</p>
        </button>

        <button
          className={activeTab === "logs" ? "live-metric-card active" : "live-metric-card"}
          onClick={() => setActiveTab("logs")}
        >
          <span>특이사항</span>
          <strong>{displayLogs.length}건</strong>
          <p>세션 이벤트 로그</p>
        </button>

        <button
          className={activeTab === "report" ? "live-metric-card active" : "live-metric-card"}
          onClick={() => setActiveTab("report")}
        >
          <span>일일 리포트</span>
          <strong>{report ? "조회 완료" : cage.reportStatus || "조회 대기"}</strong>
          <p>세션 기반 리포트</p>
        </button>
      </section>

      {activeTab === "summary" && (
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>상태 요약</h2>
              <p>현재 케이지와 반려동물 상태를 간단히 확인합니다.</p>
            </div>
          </div>

          <div className="owner-detail-grid">
            <div>
              <span>평균 온도</span>
              <strong>{report?.averageTemperature ?? cage.temperature ?? "-"}</strong>
              <p>일일 리포트 또는 최근 케이지 온도입니다.</p>
            </div>
            <div>
              <span>평균 습도</span>
              <strong>{report?.averageHumidity ?? cage.humidity ?? "-"}</strong>
              <p>일일 리포트 또는 최근 케이지 습도입니다.</p>
            </div>
            <div>
              <span>로그 수</span>
              <strong>{report?.totalLogCount ?? displayLogs.length}</strong>
              <p>조회된 세션 로그 기준입니다.</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === "logs" && (
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>특이사항 로그</h2>
              <p>세션 로그가 시간순으로 표시됩니다.</p>
            </div>
          </div>

          {isLogsLoading ? (
            <div className="small-empty">세션 로그를 불러오는 중입니다.</div>
          ) : displayLogs.length === 0 ? (
            <div className="small-empty">조회된 세션 로그가 없습니다.</div>
          ) : (
            <div className="owner-log-list">
              {displayLogs.map((log) => (
                <article className="owner-log-item" key={log.id}>
                  <div className="log-time">{log.time}</div>

                  <div className="log-main">
                    <div>
                      <strong>{log.type}</strong>
                      <p>{log.message}</p>
                    </div>

                    <span className="badge green">{log.level}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "report" && (
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>일일 리포트 / AI 질문</h2>
              <p>세션 로그 기반 일일 리포트를 조회합니다.</p>
            </div>
          </div>

          <div className="report-box">
            <h3>오늘의 상태 요약</h3>
            {isReportLoading ? (
              <p>일일 리포트를 불러오는 중입니다.</p>
            ) : (
              <p>{report?.summary || "아직 조회된 일일 리포트가 없습니다."}</p>
            )}
          </div>

          <div className="ai-question-box">
            <label>AI에게 질문하기</label>
            <div className="ai-question-row">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="예: 오늘 초코가 많이 불안해했나요?"
              />
              <button className="primary-button" onClick={handleAsk}>
                질문
              </button>
            </div>

            {aiAnswer && (
              <div className="ai-answer">
                <strong>AI 답변 예시</strong>
                <p>{aiAnswer}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default OwnerCageLivePage;
