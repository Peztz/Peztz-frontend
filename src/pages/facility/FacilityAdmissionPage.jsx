import { useEffect, useMemo, useState } from "react";

import {
  DEFAULT_FACILITY_ID,
  createFacilityAdmissionSession,
  endFacilityAdmissionSession,
  getFacilityActiveAdmissions,
  getFacilityEndedAdmissions,
  getFacilityCages,
  getOwnerPetsByEmail,
} from "../../api/facility";

function formatDateTime(value) {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16);
}

function formatStayDuration(startedAt, endedAt) {
  if (!startedAt || !endedAt) return "-";

  const diffMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();

  if (!Number.isFinite(diffMs) || diffMs < 0) return "-";

  const totalMinutes = Math.max(1, Math.round(diffMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}시간 ${minutes}분`;
  }

  if (hours > 0) {
    return `${hours}시간`;
  }

  return `${minutes}분`;
}

function FacilityAdmissionPage() {
  const [cages, setCages] = useState([]);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPets, setOwnerPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [selectedCageId, setSelectedCageId] = useState("");
  const [createdSession, setCreatedSession] = useState(null);
  const [activeAdmissions, setActiveAdmissions] = useState([]);
  const [endedAdmissions, setEndedAdmissions] = useState([]);
  const [recentEndedSession, setRecentEndedSession] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isCagesLoading, setIsCagesLoading] = useState(true);
  const [isAdmissionsLoading, setIsAdmissionsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isHistoryAvailable, setIsHistoryAvailable] = useState(true);
  const [isPetsLoading, setIsPetsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [endingSessionId, setEndingSessionId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.allSettled([
      getFacilityCages(),
      getFacilityActiveAdmissions(),
      getFacilityEndedAdmissions(),
    ])
      .then(([cageResult, activeResult, endedResult]) => {
        if (!isMounted) return;

        if (cageResult.status === "fulfilled") {
          setCages(cageResult.value);
          const firstAvailable = cageResult.value.find(
            (cage) => cage.status === "AVAILABLE"
          );

          if (firstAvailable) {
            setSelectedCageId(firstAvailable.id);
          }
        } else {
          setErrorMessage(
            cageResult.reason?.response?.data?.message ||
              "케이지 목록을 불러오지 못했습니다."
          );
        }

        if (activeResult.status === "fulfilled") {
          setActiveAdmissions(activeResult.value);
        } else {
          setErrorMessage(
            activeResult.reason?.response?.data?.message ||
              "현재 입실 중 목록을 불러오지 못했습니다."
          );
        }

        if (endedResult.status === "fulfilled") {
          setEndedAdmissions(endedResult.value);
          setIsHistoryAvailable(true);
        } else {
          // TODO: If ENDED history lookup is not enabled on a target backend, keep showing the latest end response only.
          setIsHistoryAvailable(false);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCagesLoading(false);
          setIsAdmissionsLoading(false);
          setIsHistoryLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const availableCages = useMemo(
    () => cages.filter((cage) => cage.status === "AVAILABLE"),
    [cages]
  );

  const selectedPet = ownerPets.find((pet) => pet.petId === selectedPetId);
  const selectedCage = availableCages.find((cage) => cage.id === selectedCageId);

  const refreshCages = async () => {
    setErrorMessage("");

    try {
      const data = await getFacilityCages();
      setCages(data);

      const firstAvailable = data.find((cage) => cage.status === "AVAILABLE");
      setSelectedCageId(firstAvailable?.id || "");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "케이지 목록을 새로고침하지 못했습니다."
      );
    } finally {
      setIsCagesLoading(false);
    }
  };

  const refreshActiveAdmissions = async () => {
    setErrorMessage("");

    try {
      const data = await getFacilityActiveAdmissions();
      setActiveAdmissions(data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "현재 입실 중 목록을 새로고침하지 못했습니다."
      );
    } finally {
      setIsAdmissionsLoading(false);
    }
  };

  const refreshEndedAdmissions = async () => {
    try {
      const data = await getFacilityEndedAdmissions();
      setEndedAdmissions(data);
      setIsHistoryAvailable(true);
    } catch {
      // TODO: If ENDED history lookup is not enabled on a target backend, keep showing the latest end response only.
      setIsHistoryAvailable(false);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const refreshFacilityState = async () => {
    await Promise.all([
      refreshCages(),
      refreshActiveAdmissions(),
      refreshEndedAdmissions(),
    ]);
  };

  const handleFindPets = async (e) => {
    e.preventDefault();

    if (!ownerEmail.trim()) {
      setErrorMessage("보호자 이메일을 입력해주세요.");
      return;
    }

    setIsPetsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setCreatedSession(null);
    setCopyMessage("");

    try {
      const data = await getOwnerPetsByEmail(ownerEmail.trim());
      setOwnerPets(data);
      setSelectedPetId(data[0]?.petId || "");

      if (data.length === 0) {
        setErrorMessage("해당 이메일로 등록된 반려동물이 없습니다.");
      }
    } catch (error) {
      setOwnerPets([]);
      setSelectedPetId("");
      setErrorMessage(
        error.response?.data?.message || "보호자 반려동물 조회에 실패했습니다."
      );
    } finally {
      setIsPetsLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    if (!ownerEmail.trim() || !selectedPetId || !selectedCageId) {
      setErrorMessage("보호자 이메일, 반려동물, 사용 가능한 케이지를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    setCreatedSession(null);
    setCopyMessage("");

    try {
      const session = await createFacilityAdmissionSession({
        ownerEmail: ownerEmail.trim(),
        petId: selectedPetId,
        cageId: selectedCageId,
      });

      setCreatedSession(session);
      setSuccessMessage("입실 세션이 생성되었습니다.");
      await refreshFacilityState();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "입실 세션 생성에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndSession = async (session) => {
    const confirmed = window.confirm(
      `${session.petName}의 입실 세션을 퇴실 처리할까요?`
    );

    if (!confirmed) return;

    setEndingSessionId(session.sessionId);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const endedSession = await endFacilityAdmissionSession(session.sessionId);
      setRecentEndedSession(endedSession);
      setSuccessMessage(
        `sessionId ${endedSession.sessionId} 퇴실 처리가 완료되었습니다. 퇴실 시간: ${formatDateTime(
          endedSession.endedAt
        )}`
      );
      await refreshFacilityState();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "퇴실 처리에 실패했습니다."
      );
    } finally {
      setEndingSessionId(null);
    }
  };

  const handleCopyAccessCode = async () => {
    if (!createdSession?.accessCode) return;

    try {
      await navigator.clipboard.writeText(createdSession.accessCode);
      setCopyMessage("accessCode를 복사했습니다.");
    } catch {
      setCopyMessage("복사에 실패했습니다. accessCode를 직접 선택해 복사해주세요.");
    }
  };

  return (
    <div className="facility-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Admission Management</span>
          <h1>입실 관리</h1>
          <p>
            보호자 이메일로 반려동물을 조회하고 AVAILABLE 케이지를 선택해
            입실 세션과 accessCode를 발급합니다.
          </p>
          <p className="inline-help">현재 테스트 시설 ID: {DEFAULT_FACILITY_ID}</p>
        </div>

        <button className="secondary-button" onClick={refreshFacilityState}>
          새로고침
        </button>
      </section>

      {errorMessage && <div className="form-error">{errorMessage}</div>}
      {successMessage && <div className="form-success">{successMessage}</div>}

      <section className="facility-card">
        <div className="section-header">
          <div>
            <h2>현재 입실 중</h2>
            <p>ACTIVE 상태의 시설 입실 세션입니다.</p>
          </div>
          <span className="count-badge">{activeAdmissions.length}건</span>
        </div>

        {isAdmissionsLoading ? (
          <div className="small-empty">현재 입실 중 목록을 불러오는 중입니다.</div>
        ) : activeAdmissions.length === 0 ? (
          <div className="small-empty">현재 입실 중인 반려동물이 없습니다.</div>
        ) : (
          <div className="active-admission-list">
            {activeAdmissions.map((session) => (
              <article className="active-admission-card" key={session.sessionId}>
                <div className="active-admission-main">
                  <div>
                    <span className="badge blue">{session.status}</span>
                    <h3>{session.petName}</h3>
                    <p>{session.ownerEmail}</p>
                  </div>

                  <button
                    className="text-danger-button"
                    onClick={() => handleEndSession(session)}
                    disabled={endingSessionId === session.sessionId}
                  >
                    {endingSessionId === session.sessionId
                      ? "퇴실 처리 중..."
                      : "퇴실 처리"}
                  </button>
                </div>

                <div className="admission-result-grid compact">
                  <div>
                    <span>sessionId</span>
                    <strong>{session.sessionId}</strong>
                  </div>
                  <div>
                    <span>케이지</span>
                    <strong>{session.cageName}</strong>
                  </div>
                  <div>
                    <span>케이지 번호</span>
                    <strong>{session.cageNumber || "-"}</strong>
                  </div>
                  <div>
                    <span>accessCode</span>
                    <strong>{session.accessCode}</strong>
                  </div>
                  <div>
                    <span>입실 시간</span>
                    <strong>
                      {session.startedAt
                        ? formatDateTime(session.startedAt)
                        : "-"}
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="facility-grid-2">
        <div className="facility-card">
          <div className="section-header">
            <div>
              <h2>1. 보호자 반려동물 조회</h2>
              <p>견주가 등록한 반려동물을 이메일로 조회합니다.</p>
            </div>
          </div>

          <form className="clean-form" onSubmit={handleFindPets}>
            <div className="form-field">
              <label>보호자 이메일</label>
              <div className="code-input-row">
                <input
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="test@naver.com"
                  type="email"
                />
                <button type="submit" className="primary-button" disabled={isPetsLoading}>
                  {isPetsLoading ? "조회 중..." : "조회"}
                </button>
              </div>
            </div>
          </form>

          <div className="section-subblock">
            <h3>조회된 반려동물</h3>
            {isPetsLoading ? (
              <div className="small-empty">반려동물을 조회하는 중입니다.</div>
            ) : ownerPets.length === 0 ? (
              <div className="small-empty">조회된 반려동물이 없습니다.</div>
            ) : (
              <div className="select-card-list">
                {ownerPets.map((pet) => (
                  <button
                    type="button"
                    className={
                      selectedPetId === pet.petId
                        ? "select-card active"
                        : "select-card"
                    }
                    key={pet.petId}
                    onClick={() => setSelectedPetId(pet.petId)}
                  >
                    <strong>{pet.petName}</strong>
                    <span>{pet.breed || "품종 정보 없음"}</span>
                    <small>{pet.ownerEmail}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="facility-card">
          <div className="section-header">
            <div>
              <h2>2. AVAILABLE 케이지 선택</h2>
              <p>입실 중인 케이지는 선택할 수 없습니다.</p>
            </div>
          </div>

          {isCagesLoading ? (
            <div className="small-empty">케이지 목록을 불러오는 중입니다.</div>
          ) : availableCages.length === 0 ? (
            <div className="empty-state compact">
              <h3>AVAILABLE 케이지가 없습니다</h3>
              <p>
                테스트 중 이미 OCCUPIED 상태가 되었을 수 있습니다. 케이지 관리
                화면에서 새 케이지를 등록한 뒤 다시 시도해주세요.
              </p>
            </div>
          ) : (
            <div className="select-card-list">
              {availableCages.map((cage) => (
                <button
                  type="button"
                  className={
                    selectedCageId === cage.id ? "select-card active" : "select-card"
                  }
                  key={cage.id}
                  onClick={() => setSelectedCageId(cage.id)}
                >
                  <strong>{cage.name}</strong>
                  <span>{cage.cageNumber || "번호 없음"}</span>
                  <small>{cage.raspberryPiDeviceId || "장비 없음"}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="facility-card">
        <div className="section-header">
          <div>
            <h2>3. 입실 처리</h2>
            <p>선택한 반려동물과 케이지로 시설용 입실 세션을 생성합니다.</p>
          </div>
        </div>

        <form className="clean-form" onSubmit={handleCreateSession}>
          <div className="admission-review-grid">
            <div>
              <span>보호자 이메일</span>
              <strong>{ownerEmail || "-"}</strong>
            </div>
            <div>
              <span>반려동물</span>
              <strong>{selectedPet?.petName || "-"}</strong>
            </div>
            <div>
              <span>케이지</span>
              <strong>{selectedCage?.name || "-"}</strong>
            </div>
          </div>

          <div className="button-row">
            <button
              type="submit"
              className="primary-button"
              disabled={
                isSubmitting ||
                !ownerEmail.trim() ||
                !selectedPetId ||
                !selectedCageId
              }
            >
              {isSubmitting ? "입실 처리 중..." : "입실 처리"}
            </button>
          </div>
        </form>
      </section>

      {createdSession && (
        <section className="facility-card access-result-card">
          <div className="section-header">
            <div>
              <h2>accessCode 발급 완료</h2>
              <p>이 코드를 견주에게 전달하면 기존 견주 접근 코드 화면에서 인증할 수 있습니다.</p>
            </div>
          </div>

          <div className="access-code-display">{createdSession.accessCode}</div>

          <div className="button-row">
            <button className="secondary-button" onClick={handleCopyAccessCode}>
              복사
            </button>
          </div>

          {copyMessage && <div className="small-empty">{copyMessage}</div>}

          <div className="admission-result-grid">
            <div>
              <span>sessionId</span>
              <strong>{createdSession.sessionId}</strong>
            </div>
            <div>
              <span>petName</span>
              <strong>{createdSession.petName}</strong>
            </div>
            <div>
              <span>cageName</span>
              <strong>{createdSession.cageName}</strong>
            </div>
            <div>
              <span>status</span>
              <strong>{createdSession.status}</strong>
            </div>
            <div className="wide">
              <span>videoUrl</span>
              <strong>{createdSession.videoUrl || "-"}</strong>
            </div>
          </div>
        </section>
      )}

      <section className="facility-card">
        <div className="section-header">
          <div>
            <h2>입실/퇴실 이력</h2>
            <p>ENDED 상태의 세션 이력과 투숙 시간을 확인합니다.</p>
          </div>
          <span className="count-badge">{endedAdmissions.length}건</span>
        </div>

        {isHistoryLoading ? (
          <div className="small-empty">입실/퇴실 이력을 불러오는 중입니다.</div>
        ) : isHistoryAvailable && endedAdmissions.length === 0 ? (
          <div className="small-empty">종료된 입실 이력이 없습니다.</div>
        ) : isHistoryAvailable ? (
          <div className="active-admission-list">
            {endedAdmissions.map((session) => (
              <article className="active-admission-card" key={session.sessionId}>
                <div className="active-admission-main">
                  <div>
                    <span className="badge gray">{session.status}</span>
                    <h3>{session.petName}</h3>
                    <p>{session.ownerEmail}</p>
                  </div>
                </div>

                <div className="admission-result-grid history">
                  <div>
                    <span>sessionId</span>
                    <strong>{session.sessionId}</strong>
                  </div>
                  <div>
                    <span>케이지</span>
                    <strong>{session.cageName}</strong>
                  </div>
                  <div>
                    <span>케이지 번호</span>
                    <strong>{session.cageNumber || "-"}</strong>
                  </div>
                  <div>
                    <span>입실 시간</span>
                    <strong>{formatDateTime(session.startedAt)}</strong>
                  </div>
                  <div>
                    <span>퇴실 시간</span>
                    <strong>{formatDateTime(session.endedAt)}</strong>
                  </div>
                  <div>
                    <span>투숙 시간</span>
                    <strong>
                      {formatStayDuration(session.startedAt, session.endedAt)}
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : recentEndedSession ? (
          <div className="active-admission-card">
            <div className="active-admission-main">
              <div>
                <span className="badge gray">{recentEndedSession.status}</span>
                <h3>{recentEndedSession.petName}</h3>
                <p>{recentEndedSession.ownerEmail}</p>
              </div>
            </div>

            <div className="admission-result-grid history">
              <div>
                <span>sessionId</span>
                <strong>{recentEndedSession.sessionId}</strong>
              </div>
              <div>
                <span>케이지</span>
                <strong>{recentEndedSession.cageName}</strong>
              </div>
              <div>
                <span>케이지 번호</span>
                <strong>{recentEndedSession.cageNumber || "-"}</strong>
              </div>
              <div>
                <span>입실 시간</span>
                <strong>{formatDateTime(recentEndedSession.startedAt)}</strong>
              </div>
              <div>
                <span>퇴실 시간</span>
                <strong>{formatDateTime(recentEndedSession.endedAt)}</strong>
              </div>
              <div>
                <span>투숙 시간</span>
                <strong>
                  {formatStayDuration(
                    recentEndedSession.startedAt,
                    recentEndedSession.endedAt
                  )}
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="small-empty">
            ENDED 이력 조회를 사용할 수 없습니다. 퇴실 처리 후 최근 퇴실 결과를
            이 영역에 표시합니다.
          </div>
        )}
      </section>
    </div>
  );
}

export default FacilityAdmissionPage;
