import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  DEFAULT_FACILITY_ID,
  getFacilityLogs,
} from "../../api/facility";
import {
  getOwnerEventLabel,
  getOwnerEventMessage,
} from "../../utils/ownerPresentation";

const LOG_REFRESH_INTERVAL_MS = 15_000;
const CATEGORY_LABELS = {
  SENSOR: "센서",
  BEHAVIOR: "행동",
  ACCESS: "접근",
  SESSION: "입실",
  NETWORK: "네트워크",
  OTHER: "기타",
};

function isToday(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function formatTime(value) {
  if (!value) return "시간 정보 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function cageLabel(log) {
  const cage = [log.cageNumber, log.cageName].filter(Boolean).join(" · ");
  return cage || "케이지 정보 없음";
}

function FacilityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const requestInFlight = useRef(false);

  const loadLogs = useCallback(async (silent = false) => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      setError("");
      const data = await getFacilityLogs(DEFAULT_FACILITY_ID, 100);
      setLogs(data);
      setLastUpdatedAt(new Date());
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "시설 운영 로그를 불러오지 못했습니다."
      );
    } finally {
      requestInFlight.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialRequestId = window.setTimeout(() => loadLogs(), 0);
    const intervalId = window.setInterval(
      () => loadLogs(true),
      LOG_REFRESH_INTERVAL_MS
    );
    return () => {
      window.clearTimeout(initialRequestId);
      window.clearInterval(intervalId);
    };
  }, [loadLogs]);

  const todayLogs = useMemo(
    () => logs.filter((log) => isToday(log.createdAt)),
    [logs]
  );
  const summary = useMemo(
    () => ({
      total: todayLogs.length,
      warning: todayLogs.filter((log) => log.level === "WARNING").length,
      sensor: todayLogs.filter((log) => log.category === "SENSOR").length,
      behavior: todayLogs.filter((log) => log.category === "BEHAVIOR").length,
    }),
    [todayLogs]
  );

  return (
    <div className="facility-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Event Log</span>
          <h1>로그/이벤트 관리</h1>
          <p>시설의 센서 상태 변화와 반려동물 행동 이벤트를 확인합니다.</p>
        </div>
      </section>

      <section className="facility-summary-grid">
        <div className="facility-stat-card">
          <span>오늘 이벤트</span>
          <strong>{summary.total}</strong>
          <p>오늘 발생한 전체 기록</p>
        </div>
        <div className="facility-stat-card danger">
          <span>주의 이벤트</span>
          <strong>{summary.warning}</strong>
          <p>확인이 필요한 기록</p>
        </div>
        <div className="facility-stat-card">
          <span>센서 이벤트</span>
          <strong>{summary.sensor}</strong>
          <p>문 열림과 조도 변화</p>
        </div>
        <div className="facility-stat-card">
          <span>행동 이벤트</span>
          <strong>{summary.behavior}</strong>
          <p>AI가 감지한 행동</p>
        </div>
      </section>

      <section className="facility-card">
        <div className="section-header">
          <div>
            <h2>최근 이벤트</h2>
            <p>
              시설의 최근 기록을 최대 100개까지 표시하며 15초마다 자동으로 갱신합니다.
            </p>
          </div>
          <div className="facility-log-actions">
            <span>
              {lastUpdatedAt
                ? `마지막 갱신 ${formatTime(lastUpdatedAt)}`
                : "갱신 대기"}
            </span>
            <button
              type="button"
              className="mini-button"
              disabled={loading || refreshing}
              onClick={() => loadLogs(true)}
            >
              {refreshing ? "갱신 중..." : "새로고침"}
            </button>
          </div>
        </div>

        {error && <p className="facility-log-state error">{error}</p>}
        {loading && logs.length === 0 && (
          <p className="facility-log-state">운영 로그를 불러오는 중입니다.</p>
        )}
        {!loading && !error && logs.length === 0 && (
          <p className="facility-log-state">아직 저장된 운영 로그가 없습니다.</p>
        )}

        {logs.length > 0 && (
          <div className="log-list">
            {logs.map((log) => (
              <article className="log-item" key={log.id}>
                <div
                  className={
                    log.level === "WARNING"
                      ? "log-type warning"
                      : "log-type normal"
                  }
                >
                  {CATEGORY_LABELS[log.category] || CATEGORY_LABELS.OTHER}
                </div>

                <div className="log-content">
                  <strong>{getOwnerEventMessage(log)}</strong>
                  <p>
                    {cageLabel(log)} · {log.petName || "반려동물 정보 없음"} ·{" "}
                    {getOwnerEventLabel(log.type)} · {formatTime(log.createdAt)}
                  </p>
                </div>

                <span
                  className={
                    log.level === "WARNING" ? "badge red" : "badge green"
                  }
                >
                  {log.level === "WARNING" ? "확인 필요" : "일반"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default FacilityLogsPage;
