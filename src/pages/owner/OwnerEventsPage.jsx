import { useEffect, useMemo, useState } from "react";

import { getMyCages, getSessionLogs } from "../../api/owner";

const DEMO_EVENTS = [
  {
    id: "demo-event-1",
    createdAt: new Date().toISOString(),
    type: "이상행동",
    severity: "HIGH",
    message: "반복 움직임이 감지된 이벤트 예시입니다.",
    petName: "반려동물",
    isDemo: true,
  },
  {
    id: "demo-event-2",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    type: "급식",
    severity: "NORMAL",
    message: "급식 완료 이벤트 예시입니다.",
    petName: "반려동물",
    isDemo: true,
  },
];

function normalizeSeverity(value, type) {
  const severity = String(value || "").toUpperCase();
  if (["CRITICAL", "HIGH", "DANGER", "ERROR"].includes(severity)) return "HIGH";
  if (["WARNING", "WARN", "MEDIUM"].includes(severity)) return "MEDIUM";
  if (String(type).toUpperCase().includes("ABNORMAL")) return "HIGH";
  return "NORMAL";
}

function getSeverityMeta(severity) {
  if (severity === "HIGH") return { label: "높음", className: "badge red" };
  if (severity === "MEDIUM") return { label: "주의", className: "badge blue" };
  return { label: "일반", className: "badge green" };
}

function formatEventTime(value) {
  if (!value) return "시간 정보 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function OwnerEventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    let cancelled = false;

    const loadEvents = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const cages = await getMyCages();
        const sessionCages = cages.filter((cage) =>
          Number.isFinite(Number(cage.sessionId))
        );
        const results = await Promise.allSettled(
          sessionCages.map(async (cage) => ({
            cage,
            logs: await getSessionLogs(Number(cage.sessionId)),
          }))
        );
        const normalizedEvents = results.flatMap((result) => {
          if (result.status !== "fulfilled") return [];
          const { cage, logs } = result.value;
          return logs.map((log, index) => ({
            ...log,
            id: `${cage.sessionId}-${log.id ?? index}`,
            petName: cage.petName || "반려동물",
            cageName: cage.cageName || "케이지 정보 없음",
            severity: normalizeSeverity(log.severity || log.level, log.type),
            thumbnailUrl: log.thumbnailUrl || log.imageUrl || "",
            videoUrl:
              log.videoUrl || log.eventVideoUrl || log.cloudStorageUrl || log.clipUrl || "",
          }));
        });

        if (!cancelled) {
          setEvents(normalizedEvents.length > 0 ? normalizedEvents : DEMO_EVENTS);
        }
      } catch (error) {
        if (!cancelled) {
          setEvents(DEMO_EVENTS);
          setErrorMessage(
            error.response?.data?.message ||
              "이벤트를 불러오지 못해 Demo 데이터를 표시합니다."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const eventTypes = useMemo(
    () => ["ALL", ...new Set(events.map((event) => event.type || "기타"))],
    [events]
  );
  const filteredEvents =
    typeFilter === "ALL"
      ? events
      : events.filter((event) => (event.type || "기타") === typeFilter);

  return (
    <div className="owner-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Event Replay</span>
          <h1>이벤트 다시보기</h1>
          <p>
            Raspberry Pi가 생성한 30초 이벤트 영상은 Cloud Storage URL을 통해
            재생합니다. MediaMTX는 실시간 스트리밍에만 사용됩니다.
          </p>
        </div>
        <span className="badge gray">Cloud Storage 연동</span>
      </section>

      {errorMessage && <div className="form-error">{errorMessage}</div>}

      <section className="content-card">
        <div className="section-header event-filter-header">
          <div>
            <h2>이벤트 목록</h2>
            <p>시간, 종류, 중요도와 저장된 이벤트 영상을 확인할 수 있습니다.</p>
          </div>
          <label className="event-filter">
            <span>이벤트 종류</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              {eventTypes.map((type) => (
                <option key={type} value={type}>{type === "ALL" ? "전체" : type}</option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="small-empty">이벤트를 불러오는 중입니다.</div>
        ) : filteredEvents.length === 0 ? (
          <div className="small-empty">선택한 종류의 이벤트가 없습니다.</div>
        ) : (
          <div className="event-replay-grid">
            {filteredEvents.map((event) => {
              const severity = getSeverityMeta(event.severity);
              return (
                <article className="event-replay-card" key={event.id}>
                  <div className="event-thumbnail">
                    {event.thumbnailUrl ? (
                      <img src={event.thumbnailUrl} alt={`${event.type} 이벤트 썸네일`} />
                    ) : (
                      <div><strong>EVENT</strong><span>썸네일 연동 예정</span></div>
                    )}
                    {event.isDemo && <span className="badge gray event-demo-badge">Demo</span>}
                  </div>
                  <div className="event-replay-body">
                    <div className="event-card-badges">
                      <span className="badge blue">{event.type || "기타"}</span>
                      <span className={severity.className}>{severity.label}</span>
                    </div>
                    <h3>{event.petName || "반려동물"}</h3>
                    <time>{formatEventTime(event.createdAt)}</time>
                    <p>{event.message || "이벤트 상세 정보가 없습니다."}</p>
                    {event.videoUrl ? (
                      <a
                        className="primary-button event-video-link"
                        href={event.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        이벤트 영상 보기
                      </a>
                    ) : (
                      <button className="secondary-button full" disabled>
                        Cloud Storage URL 연동 예정
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default OwnerEventsPage;
