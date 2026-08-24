import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyCamerasWithRuntime } from "../../api/cameras";
import { buildPlaybackUrl } from "../../api/client";
import { getMyPetEvents } from "../../api/events";
import { getMyCages } from "../../api/owner";
import { getMyPets } from "../../api/pets";
import {
  getLatestCageSmartThingsReadings,
  indexLatestSmartThingsReadings,
} from "../../api/smartthings";

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

  const cageIdsKey = cages
    .map((cage) => cage.cageId)
    .filter(Boolean)
    .map(String)
    .join(",");

  useEffect(() => {
    if (!cageIdsKey) return undefined;
    const cageIds = cageIdsKey.split(",");
    let cancelled = false;
    let requestInFlight = false;

    const loadLatestSensorReadings = async () => {
      if (requestInFlight) return;
      requestInFlight = true;

      let results;
      try {
        results = await Promise.allSettled(
          cageIds.map((id) => getLatestCageSmartThingsReadings(id))
        );
      } finally {
        requestInFlight = false;
      }
      if (cancelled) return;

      const sensorValuesByCage = new Map();
      results.forEach((result, index) => {
        if (result.status !== "fulfilled") return;
        sensorValuesByCage.set(
          cageIds[index],
          indexLatestSmartThingsReadings(result.value.readings)
        );
      });
      if (sensorValuesByCage.size === 0) return;

      setCages((currentCages) => {
        const updatedCages = currentCages.map((cage) => {
          const readings = sensorValuesByCage.get(String(cage.cageId));
          if (!readings) return cage;
          return {
            ...cage,
            temperature:
              readings.temperature?.numericValue ?? cage.temperature,
            humidity: readings.humidity?.numericValue ?? cage.humidity,
            illuminance:
              readings.illuminance?.numericValue ?? cage.illuminance,
            contact: readings.contact?.stringValue ?? cage.contact,
          };
        });
        localStorage.setItem(
          "peztz_owner_cages",
          JSON.stringify(updatedCages)
        );
        return updatedCages;
      });
    };

    loadLatestSensorReadings();
    const intervalId = window.setInterval(loadLatestSensorReadings, 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [cageIdsKey]);

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
  const primaryStreamStatus = primaryCage ? getCageStreamStatus(primaryCage) : "offline";
  const specialCount = cages.reduce((sum, cage) => sum + (cage.specialCount || 0), 0);

  return (
    <div className="owner-page">
      <section className="owner-care-hero">
        <div className="care-hero-main">
          <div className="pet-portrait" aria-hidden="true">
            <span>{primaryPet?.name?.slice(0, 1) || "P"}</span>
            <i className={primaryStreamStatus === "online" ? "is-online" : ""} />
          </div>
          <div className="care-hero-copy">
            <span className="eyebrow">LIVE CARE OVERVIEW</span>
            <h1>{primaryPet ? `${primaryPet.name}의 오늘을 살펴보세요` : "반려동물의 일상을 연결하세요"}</h1>
            <p>
              {primaryCage
                ? `${primaryCage.facilityName || "이용 시설"} · ${primaryCage.cageName || "케이지"}에서 상태를 확인하고 있습니다.`
                : "시설에서 받은 접근 코드를 등록하면 실시간 상태를 한곳에서 확인할 수 있어요."}
            </p>
            <div className="care-hero-actions">
              {primaryCage && <button className="primary-button" onClick={() => openLivePage(primaryCage)}>실시간 모니터링</button>}
              <button className="quiet-button" onClick={() => navigate("/owner/register-cage")}>케이지 등록 <span>→</span></button>
            </div>
          </div>
        </div>
        <div className="care-hero-status">
          <span className="care-status-label">CURRENT STATUS</span>
          <strong>{primaryCage ? (primaryStreamStatus === "online" ? "안정적으로 연결됨" : "연결 상태 확인 필요") : "연결된 케이지 없음"}</strong>
          <div><span className={getStreamBadgeClass(primaryStreamStatus)}>{getStreamBadgeLabel(primaryStreamStatus)}</span><small>{primaryCage?.reportStatus || "등록 후 모니터링 시작"}</small></div>
        </div>
      </section>

      {errorMessage && <div className="form-error">{errorMessage}</div>}

      <section className="owner-monitoring-section">
        <div className="section-header">
          <div>
            <div className="section-title-row">
              <h2>Today&apos;s overview</h2>
              <span className="badge gray">일부 Preview</span>
            </div>
            <p>{primaryPet?.name || "반려동물"}의 환경과 케어 흐름을 한눈에 확인하세요.</p>
          </div>
          <div className="overview-totals"><span>반려동물 <strong>{pets.length}</strong></span><span>케이지 <strong>{cages.length}</strong></span><span>특이사항 <strong>{specialCount}</strong></span></div>
        </div>
        <div className="monitoring-board">
          <div className="wellness-score">
            <div className="score-ring" style={{ "--score": `${DEMO_TODAY_STATUS.healthScore * 3.6}deg` }}><span><strong>{DEMO_TODAY_STATUS.healthScore}</strong><small>/ 100</small></span></div>
            <div><span>WELLNESS SCORE · PREVIEW</span><h3>오늘도 편안한 하루예요</h3><p>환경과 활동 정보를 종합한 데모 건강 지표입니다.</p></div>
          </div>
          <div className="environment-metrics">
            <div><span>Temperature {!hasTemperature && <small>Preview</small>}</span><strong>{temperature}<em>°C</em></strong><i style={{ width: `${Math.min(Number(temperature) / 35 * 100, 100)}%` }} /></div>
            <div><span>Humidity {!hasHumidity && <small>Preview</small>}</span><strong>{humidity}<em>%</em></strong><i style={{ width: `${Math.min(Number(humidity), 100)}%` }} /></div>
            <div><span>Environment <small>Preview</small></span><strong className="text-value">{DEMO_TODAY_STATUS.environmentStatus}</strong><p>권장 온·습도 범위</p></div>
          </div>
          <div className="care-timeline">
            <div><span>최근 급식</span><strong>{DEMO_TODAY_STATUS.lastFeedingTime}</strong><small>Preview</small></div>
            <div><span>현재 공복 시간</span><strong>{DEMO_TODAY_STATUS.fastingDuration}</strong><small>Preview</small></div>
            <div><span>행동 모니터링</span><strong>{DEMO_TODAY_STATUS.recentAbnormalBehavior}</strong><small>Preview</small></div>
          </div>
        </div>
      </section>

      <div className="owner-home-feed-grid">
        <section className="home-feed-panel">
          <div className="section-header compact">
            <div>
              <div className="section-title-row">
                <h2>최근 이벤트</h2>
                <span className="badge green">Live data</span>
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

        <section className="home-feed-panel notice-panel">
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

      <section className="connected-section">
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

      <section className="connected-section pet-strip-section">
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
