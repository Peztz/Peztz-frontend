import { useEffect, useMemo, useState } from "react";

import { getMyPetEvents, getPetEvent } from "../../api/events";

function formatEventTime(value) {
  if (!value) return "시간 정보 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatConfidence(value) {
  if (value == null || Number.isNaN(Number(value))) return "신뢰도 정보 없음";
  return `신뢰도 ${(Number(value) * 100).toFixed(1)}%`;
}

function OwnerEventsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    let cancelled = false;
    getMyPetEvents()
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMessage(error.response?.data?.message || "이벤트 목록을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const eventTypes = useMemo(
    () => ["ALL", ...new Set(events.map((event) => event.eventType))],
    [events]
  );
  const filteredEvents =
    typeFilter === "ALL"
      ? events
      : events.filter((event) => event.eventType === typeFilter);

  const openEvent = async (event) => {
    setDetailLoadingId(event.eventId);
    setErrorMessage("");
    try {
      setSelectedEvent(await getPetEvent(event.eventId));
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "이벤트 상세를 불러오지 못했습니다.");
    } finally {
      setDetailLoadingId(null);
    }
  };

  return (
    <div className="owner-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Event Replay</span>
          <h1>이벤트 다시보기</h1>
          <p>반려동물의 감지 이벤트와 저장된 영상을 실제 이벤트 데이터로 확인합니다.</p>
        </div>
        <span className="badge green">API 연결</span>
      </section>

      {errorMessage && <div className="form-error">{errorMessage}</div>}

      <section className="content-card">
        <div className="section-header event-filter-header">
          <div>
            <h2>이벤트 목록</h2>
            <p>이벤트 시간, 종류, 카메라와 AI 신뢰도를 확인할 수 있습니다.</p>
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
          <div className="small-empty">조회된 이벤트가 없습니다.</div>
        ) : (
          <div className="event-replay-grid">
            {filteredEvents.map((event) => (
              <article className="event-replay-card" key={event.eventId}>
                <div className="event-thumbnail">
                  {event.thumbnailUrl ? (
                    <img src={event.thumbnailUrl} alt={`${event.eventType} 이벤트 썸네일`} />
                  ) : (
                    <div><strong>EVENT</strong><span>썸네일 없음</span></div>
                  )}
                </div>
                <div className="event-replay-body">
                  <div className="event-card-badges">
                    <span className="badge blue">{event.eventType}</span>
                    <span className="badge green">{formatConfidence(event.confidence)}</span>
                  </div>
                  <h3>{event.petName}</h3>
                  <time>{formatEventTime(event.occurredAt)}</time>
                  <p>{event.cameraName} · {event.eventDurationSeconds ?? "-"}초</p>
                  <button
                    className="secondary-button full"
                    onClick={() => openEvent(event)}
                    disabled={detailLoadingId === event.eventId}
                  >
                    {detailLoadingId === event.eventId ? "상세 조회 중" : "상세 보기"}
                  </button>
                  {event.videoUrl ? (
                    <a className="primary-button event-video-link" href={event.videoUrl} target="_blank" rel="noreferrer">
                      이벤트 영상 보기
                    </a>
                  ) : (
                    <button className="secondary-button full" disabled>영상 없음</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedEvent && (
        <section className="content-card">
          <div className="section-header">
            <div><h2>이벤트 상세</h2><p>이벤트 ID {selectedEvent.eventId}</p></div>
            <button className="secondary-button" onClick={() => setSelectedEvent(null)}>닫기</button>
          </div>
          <div className="owner-detail-grid">
            <div><span>반려동물</span><strong>{selectedEvent.petName}</strong><p>{selectedEvent.petId}</p></div>
            <div><span>카메라</span><strong>{selectedEvent.cameraName}</strong><p>{selectedEvent.cameraId}</p></div>
            <div><span>이벤트</span><strong>{selectedEvent.eventType}</strong><p>{formatConfidence(selectedEvent.confidence)}</p></div>
            <div><span>감지 시각</span><strong>{formatEventTime(selectedEvent.occurredAt)}</strong><p>{selectedEvent.eventDurationSeconds ?? "-"}초</p></div>
          </div>
        </section>
      )}
    </div>
  );
}

export default OwnerEventsPage;
