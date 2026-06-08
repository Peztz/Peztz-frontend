import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function OwnerCageLivePage() {
  const { cageId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("summary");
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");

  const cage = useMemo(() => {
    const savedCages = JSON.parse(localStorage.getItem("peztz_owner_cages") || "[]");

    const foundCage = savedCages.find((item) => item.id === cageId);

    if (foundCage) {
      return foundCage;
    }

    return {
      id: cageId,
      petName: "초코",
      petBreed: "푸들",
      facilityName: "A 펫호텔",
      cageName: "1번 케이지",
      status: "ACTIVE",
      deviceStatus: "ONLINE",
      temperature: "26.4°C",
      humidity: "48%",
      specialCount: 3,
      reportStatus: "생성 완료",
      isDemo: true,
    };
  }, [cageId]);

  const logs = [
    {
      id: 1,
      time: "09:15",
      type: "활동",
      message: "케이지 내부에서 움직임이 감지되었습니다.",
      level: "NORMAL",
    },
    {
      id: 2,
      time: "10:40",
      type: "소리",
      message: "짧은 짖음이 2회 감지되었습니다.",
      level: "NORMAL",
    },
    {
      id: 3,
      time: "12:05",
      type: "온도",
      message: "케이지 내부 온도가 기준 범위보다 약간 높게 측정되었습니다.",
      level: "WARNING",
    },
  ];

  const handleAsk = () => {
    if (!question.trim()) {
      alert("질문을 입력해주세요.");
      return;
    }

    setAiAnswer(
      "현재는 LLM 연동 전 화면입니다. 나중에는 세션 로그와 특이사항을 기반으로 AI가 보호자 질문에 답변합니다."
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
            {cage.facilityName} / {cage.cageName} · {cage.petBreed}
          </p>
        </div>

        <div className="live-status-box">
          <span className="badge blue">입실 중</span>
          <span
            className={cage.deviceStatus === "ONLINE" ? "badge green" : "badge red"}
          >
            {cage.deviceStatus}
          </span>
        </div>
      </section>

      <section className="live-main-grid">
        <div className="live-video-card">
          <div className="live-video-placeholder">
            <div className="live-dot"></div>
            <h2>실시간 스트리밍 화면</h2>
            <p>
              나중에 라즈베리파이 카메라 스트림이 이 영역에 연결됩니다.
            </p>
          </div>
        </div>

        <aside className="live-side-card">
          <h2>현재 상태</h2>

          <div className="live-info-list">
            <div>
              <span>반려동물</span>
              <strong>{cage.petName}</strong>
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
              <span>연결 상태</span>
              <strong>{cage.deviceStatus}</strong>
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
          <strong>{cage.temperature}</strong>
          <p>케이지 내부 온도</p>
        </button>

        <button
          className={activeTab === "logs" ? "live-metric-card active" : "live-metric-card"}
          onClick={() => setActiveTab("logs")}
        >
          <span>특이사항</span>
          <strong>{logs.length}건</strong>
          <p>시간별 이벤트 로그</p>
        </button>

        <button
          className={activeTab === "report" ? "live-metric-card active" : "live-metric-card"}
          onClick={() => setActiveTab("report")}
        >
          <span>일일 리포트</span>
          <strong>{cage.reportStatus}</strong>
          <p>LLM 분석 예정</p>
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
              <span>온도</span>
              <strong>{cage.temperature}</strong>
              <p>현재 케이지 내부 온도입니다.</p>
            </div>
            <div>
              <span>습도</span>
              <strong>{cage.humidity || "48%"}</strong>
              <p>케이지 내부 환경 정보입니다.</p>
            </div>
            <div>
              <span>최근 상태</span>
              <strong>안정적</strong>
              <p>최근 특이 행동은 많지 않습니다.</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === "logs" && (
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>특이사항 로그</h2>
              <p>센서, 소리, 온도, 활동 이벤트가 시간순으로 표시됩니다.</p>
            </div>
          </div>

          <div className="owner-log-list">
            {logs.map((log) => (
              <article className="owner-log-item" key={log.id}>
                <div className="log-time">{log.time}</div>

                <div className="log-main">
                  <div>
                    <strong>{log.type}</strong>
                    <p>{log.message}</p>
                  </div>

                  <span
                    className={log.level === "WARNING" ? "badge red" : "badge green"}
                  >
                    {log.level}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === "report" && (
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>일일 리포트 / AI 질문</h2>
              <p>
                나중에 LLM이 특이사항 로그와 센서 데이터를 분석해서 보호자가
                이해하기 쉬운 리포트를 생성합니다.
              </p>
            </div>
          </div>

          <div className="report-box">
            <h3>오늘의 상태 요약</h3>
            <p>
              초코는 전반적으로 안정적인 상태를 보였습니다. 오전에는 짧은
              움직임과 소리 이벤트가 있었고, 점심 시간대에 케이지 내부 온도가
              약간 높게 측정되었습니다. 현재는 특이사항 없이 안정적으로
              모니터링 중입니다.
            </p>
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