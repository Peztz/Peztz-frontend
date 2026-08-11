import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyCamerasWithRuntime } from "../../api/cameras";
import { buildPlaybackUrl } from "../../api/client";
import { getMyPetEvents } from "../../api/events";
import { getMyCages } from "../../api/owner";
import { getMyPets } from "../../api/pets";

const DEMO_TODAY_STATUS = {
  healthScore: 92,
  temperature: 24.2,
  humidity: 48,
  environmentStatus: "쾌적",
  lastFeedingTime: "오늘 08:10",
  fastingDuration: "3시간 20분",
  recentAbnormalBehavior: "감지된 이상행동 없음",
};

const DEMO_TODAY_NOTICES = [
  { id: "demo-notice-1", title: "환경 상태가 안정적입니다.", detail: "현재 온도와 습도가 권장 범위입니다." },
  { id: "demo-notice-2", title: "일일 리포트를 확인해 보세요.", detail: "오늘의 행동 분석은 리포트 화면에서 확인할 수 있습니다." },
];

function getCageStreamStatus(cage) {
  if (!cage.playbackUrl) return "offline";

  const runtimeStatus = String(cage.cameraRuntimeStatus || "").toUpperCase();
  if (runtimeStatus === "ONLINE") return "online";
  if (["STARTING", "CHECKING"].includes(runtimeStatus)) return "checking";
  return "offline";
}

function getStreamBadgeClass(status) {
  if (status === "online") return "badge green";
  if (status === "checking") return "badge gray";
  return "badge red";
}

function getStreamBadgeLabel(status) {
  if (status === "online") return "ONLINE";
  if (status === "checking") return "확인 중";
  return "OFFLINE";
}

function getVideoInfoLabel(cage, status) {
  if (!cage.cameraId) return "미등록";
  if (status === "online") return "연결됨";
  if (status === "checking") return "확인 중";
  return "연결 실패";
}

function OwnerHomePage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [cages, setCages] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOwnerData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [petData, cageData, cameraData] = await Promise.all([
          getMyPets(),
          getMyCages(),
          getMyCamerasWithRuntime().catch(() => []),
        ]);
        const cameraByCageId = new Map(
          cameraData.map((camera) => [String(camera.cageId), camera])
        );
        const normalizedCages = cageData.map((cage) => {
          const camera = cameraByCageId.get(String(cage.cageId));

          return {
            ...cage,
            id: String(cage.sessionId || cage.cageId),
            sessionId: Number(cage.sessionId),
            temperature: cage.temperature ?? "-",
            humidity: cage.humidity ?? "-",
            specialCount: cage.specialCount ?? 0,
            reportStatus: cage.reportStatus || "조회 가능",
            cameraId: camera?.cameraId || "",
            cameraName: camera?.name || "",
            cameraRuntimeStatus: camera?.runtime?.status || camera?.streamStatus || "OFFLINE",
            rawPlaybackUrl: camera?.runtime?.playbackUrl || "",
            playbackUrl: buildPlaybackUrl(camera?.runtime?.playbackUrl),
          };
        });

        setPets(petData);
        setCages(normalizedCages);
        getMyPetEvents()
          .then((eventData) => setRecentEvents(eventData.slice(0, 5)))
          .catch(() => setRecentEvents([]));
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

  const primaryCage = cages[0];
  const primaryPet = pets[0];
  const hasTemperature =
    primaryCage?.temperature !== undefined && primaryCage.temperature !== "-";
  const hasHumidity =
    primaryCage?.humidity !== undefined && primaryCage.humidity !== "-";
  const temperature = hasTemperature
    ? primaryCage.temperature
    : DEMO_TODAY_STATUS.temperature;
  const humidity = hasHumidity ? primaryCage.humidity : DEMO_TODAY_STATUS.humidity;

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

      <section className="content-card owner-today-section">
        <div className="section-header">
          <div>
            <div className="section-title-row">
              <h2>오늘의 상태 요약</h2>
              <span className="badge gray">Demo 데이터</span>
            </div>
            <p>
              {primaryPet?.name || "반려동물"}의 오늘 상태를 한눈에 확인합니다.
              실제 센서·행동 데이터 API 연동 전에는 Demo 값이 표시됩니다.
            </p>
          </div>
        </div>

        <div className="today-status-grid">
          <article className="today-status-card health-score-card">
            <span>건강 점수</span>
            <strong>{DEMO_TODAY_STATUS.healthScore}<small>/100</small></strong>
            <p>전반적으로 안정적인 상태입니다.</p>
            <span className="demo-label">Demo</span>
          </article>
          <article className="today-status-card">
            <span>온도</span>
            <strong>{temperature}°C</strong>
            <p>{hasTemperature ? "케이지 센서 기준" : "센서 API 연동 예정"}</p>
            {!hasTemperature && <span className="demo-label">Demo</span>}
          </article>
          <article className="today-status-card">
            <span>습도</span>
            <strong>{humidity}%</strong>
            <p>{hasHumidity ? "케이지 센서 기준" : "센서 API 연동 예정"}</p>
            {!hasHumidity && <span className="demo-label">Demo</span>}
          </article>
          <article className="today-status-card">
            <span>환경 상태</span>
            <strong>{DEMO_TODAY_STATUS.environmentStatus}</strong>
            <p>권장 온·습도 범위입니다.</p>
            <span className="demo-label">Demo</span>
          </article>
        </div>

        <div className="today-detail-grid">
          <div>
            <span>최근 급식 시간</span>
            <strong>{DEMO_TODAY_STATUS.lastFeedingTime}</strong>
            <small>Demo · 급식 API 연동 예정</small>
          </div>
          <div>
            <span>현재 공복 시간</span>
            <strong>{DEMO_TODAY_STATUS.fastingDuration}</strong>
            <small>Demo · 급식 API 연동 예정</small>
          </div>
          <div>
            <span>최근 이상행동</span>
            <strong>{DEMO_TODAY_STATUS.recentAbnormalBehavior}</strong>
            <small>Demo · 행동 분석 API 연동 예정</small>
          </div>
        </div>
      </section>

      <div className="owner-home-feed-grid">
        <section className="content-card">
          <div className="section-header compact">
            <div>
              <div className="section-title-row">
                <h2>최근 이벤트</h2>
                <span className="badge green">실제 데이터</span>
              </div>
              <p>최근 반려동물 이벤트 API 조회 결과입니다.</p>
            </div>
          </div>
          <div className="owner-home-list">
            {recentEvents.map((event) => (
              <article key={event.eventId}>
                <span className="badge blue">{event.eventType}</span>
                <div>
                  <strong>{event.petName} · {event.cameraName}</strong>
                  <small>{event.occurredAt ? new Date(event.occurredAt).toLocaleString("ko-KR") : "시간 정보 없음"}</small>
                </div>
              </article>
            ))}
            {recentEvents.length === 0 && <div className="small-empty">최근 이벤트가 없습니다.</div>}
          </div>
        </section>

        <section className="content-card">
          <div className="section-header compact">
            <div>
              <div className="section-title-row">
                <h2>오늘의 알림</h2>
                <span className="badge gray">Demo</span>
              </div>
              <p>알림 API 연동 전 예시 안내입니다.</p>
            </div>
          </div>
          <div className="owner-home-list notice-list">
            {DEMO_TODAY_NOTICES.map((notice) => (
              <article key={notice.id}>
                <span className="notice-dot" aria-hidden="true" />
                <div>
                  <strong>{notice.title}</strong>
                  <small>{notice.detail}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

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
            {cages.map((cage) => {
              const streamStatus = getCageStreamStatus(cage);

              return (
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
                    <span className={getStreamBadgeClass(streamStatus)}>
                      {getStreamBadgeLabel(streamStatus)}
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
                        <strong>{getVideoInfoLabel(cage, streamStatus)}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    className="primary-button full"
                    onClick={(event) => {
                      event.stopPropagation();
                      openLivePage(cage);
                    }}
                  >
                    실시간 상태 보기
                  </button>
                </article>
              );
            })}
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
