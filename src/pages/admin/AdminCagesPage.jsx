import { useEffect, useState } from "react";
import {
  getAdminCages,
  getAdminDevices,
  getAdminFacilities,
  updateAdminCageAssignment,
} from "../../api/admin";

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function displayValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "" || value === "-") {
    return fallback;
  }

  return value;
}

function displayStatus(status) {
  if (status === "OCCUPIED") return "입실 중";
  if (status === "AVAILABLE") return "사용 가능";
  if (status === "정상") return "정상";
  return displayValue(status);
}

function getStatusBadge(status) {
  if (status === "AVAILABLE" || status === "ACTIVE" || status === "정상") {
    return "badge green";
  }
  if (status === "OCCUPIED" || status === "IN_USE") return "badge blue";
  if (!status || status === "-") return "badge";
  return "badge red";
}

function getCageId(cage) {
  return cage.cageId ?? cage.id;
}

function getCageNumber(cage) {
  return cage.cageNumber;
}

function getCageFacilityId(cage) {
  if (Object.hasOwn(cage, "facilityId")) return cage.facilityId;
  return cage.facility?.facilityId ?? cage.facility?.id;
}

function getCageFacilityName(cage) {
  if (Object.hasOwn(cage, "facilityName")) return cage.facilityName;
  return cage.facility?.facilityName ?? cage.facility?.name;
}

function getCageDeviceId(cage) {
  if (Object.hasOwn(cage, "deviceId")) return cage.deviceId;
  return cage.raspberryPiId ?? cage.deviceName ?? cage.device?.deviceId;
}

function getFacilityId(facility) {
  return facility.facilityId ?? facility.id;
}

function getFacilityName(facility) {
  return facility.facilityName ?? facility.name;
}

function getDeviceId(device) {
  return device.deviceId ?? device.raspberryPiId ?? device.id;
}

function TruncatedCell({ value, fallback = "-" }) {
  const displayText = displayValue(value, fallback);

  return (
    <span className="truncate-value" title={String(displayText)}>
      {displayText}
    </span>
  );
}

function AdminCagesPage() {
  const [cages, setCages] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [selectedCage, setSelectedCage] = useState(null);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [assignmentForm, setAssignmentForm] = useState({
    facilityId: "",
    deviceId: "",
  });

  const fetchCages = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getAdminCages();
      setCages(toArray(data));
    } catch (error) {
      console.error("관리자 케이지 조회 실패:", error);
      setErrorMessage("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getAdminCages()
      .then((data) => {
        if (isMounted) setCages(toArray(data));
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error("관리자 케이지 조회 실패:", error);
        setErrorMessage("데이터를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loadAssignmentOptions = async () => {
    if (facilities.length > 0 && devices.length > 0) return;

    try {
      setIsOptionsLoading(true);
      setAssignmentError("");

      const [facilityData, deviceData] = await Promise.all([
        getAdminFacilities(),
        getAdminDevices(),
      ]);

      setFacilities(toArray(facilityData));
      setDevices(toArray(deviceData));
    } catch (error) {
      console.error("케이지 연결 선택 목록 조회 실패:", error);
      setAssignmentError("선택 목록을 불러오지 못했습니다.");
    } finally {
      setIsOptionsLoading(false);
    }
  };

  const openAssignmentModal = (cage) => {
    setSelectedCage(cage);
    setAssignmentForm({
      facilityId: String(getCageFacilityId(cage) ?? ""),
      deviceId: String(getCageDeviceId(cage) ?? ""),
    });
    setAssignmentError("");
    setNoticeMessage("");
    setIsAssignmentOpen(true);
    loadAssignmentOptions();
  };

  const closeAssignmentModal = () => {
    if (isSavingAssignment) return;
    setIsAssignmentOpen(false);
    setSelectedCage(null);
    setAssignmentError("");
  };

  const handleAssignCage = () => {
    const firstUnassignedCage = cages.find(
      (cage) => !getCageFacilityId(cage) || !getCageDeviceId(cage)
    );

    if (firstUnassignedCage) {
      openAssignmentModal(firstUnassignedCage);
      return;
    }

    setNoticeMessage(
      "미연결 케이지가 없습니다. 변경할 케이지 행의 연결 정보 수정을 사용해주세요."
    );
  };

  const handleAssignmentChange = (event) => {
    const { name, value } = event.target;
    setAssignmentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssignmentSubmit = async (event) => {
    event.preventDefault();

    if (!selectedCage) return;

    const cageId = getCageId(selectedCage);

    if (!cageId) {
      setAssignmentError("케이지 ID를 확인할 수 없습니다.");
      return;
    }

    setIsSavingAssignment(true);
    setAssignmentError("");

    try {
      await updateAdminCageAssignment(cageId, {
        facilityId: assignmentForm.facilityId,
        deviceId: assignmentForm.deviceId,
      });
      await fetchCages();
      setIsAssignmentOpen(false);
      setSelectedCage(null);
    } catch (error) {
      console.error("케이지 연결 정보 수정 실패:", error);
      setAssignmentError("연결 정보를 수정하지 못했습니다.");
    } finally {
      setIsSavingAssignment(false);
    }
  };

  return (
    <div className="admin-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Cage Assignment</span>
          <h1>전체 케이지 관리</h1>
          <p>
            관리자 API에서 조회한 전체 케이지와 시설, 라즈베리파이 장비 연결
            정보를 표시합니다.
          </p>
        </div>

        <button className="primary-button" onClick={handleAssignCage}>
          케이지 할당
        </button>
      </section>

      {noticeMessage && <div className="form-success">{noticeMessage}</div>}

      <section className="admin-card">
        <div className="section-header">
          <div>
            <h2>전체 케이지 목록</h2>
            <p>시설별 케이지와 연결 장비, 현재 상태를 확인합니다.</p>
          </div>
          <span className="count-badge">{cages.length}개</span>
        </div>

        {loading && <p>불러오는 중...</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}

        {!loading && !errorMessage && cages.length === 0 && (
          <p>조회된 케이지가 없습니다.</p>
        )}

        {!loading && !errorMessage && cages.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table cage-table">
              <thead>
                <tr>
                  <th>케이지 ID</th>
                  <th>케이지 번호</th>
                  <th>시설</th>
                  <th>연결 장비</th>
                  <th>상태</th>
                  <th>입실 반려동물</th>
                  <th className="cage-actions-column">관리</th>
                </tr>
              </thead>
              <tbody>
                {cages.map((cage, index) => {
                  const status = displayValue(cage.status);
                  const cageId = getCageId(cage);

                  return (
                    <tr key={cageId ?? `cage-${index}`}>
                      <td>
                        <TruncatedCell value={cageId} />
                      </td>
                      <td>
                        <strong>{displayValue(getCageNumber(cage))}</strong>
                      </td>
                      <td>
                        {displayValue(getCageFacilityName(cage), "시설 미연결")}
                      </td>
                      <td>
                        <TruncatedCell
                          value={getCageDeviceId(cage)}
                          fallback="장비 미연결"
                        />
                      </td>
                      <td>
                        <span className={getStatusBadge(status)}>
                          {displayStatus(status)}
                        </span>
                      </td>
                      <td>
                        {displayValue(
                          cage.currentPetName ?? cage.petName ?? cage.pet?.name
                        )}
                      </td>
                      <td className="cage-actions-cell">
                        <button
                          type="button"
                          className="mini-button assignment-button"
                          onClick={() => openAssignmentModal(cage)}
                        >
                          연결 정보 수정
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isAssignmentOpen && selectedCage && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-panel" role="dialog" aria-modal="true">
            <div className="modal-head">
              <div>
                <span className="eyebrow">Cage Assignment</span>
                <h2>연결 정보 수정</h2>
                <p>
                  {displayValue(getCageNumber(selectedCage))} 케이지의 시설과
                  장비 연결을 변경합니다.
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={closeAssignmentModal}
                aria-label="닫기"
                disabled={isSavingAssignment}
              >
                x
              </button>
            </div>

            {String(selectedCage.status).toUpperCase() === "OCCUPIED" && (
              <div className="warning-box">
                입실 중인 케이지의 장비를 변경하면 현재 견주 영상 연결에 영향을
                줄 수 있습니다.
              </div>
            )}

            {assignmentError && <div className="form-error">{assignmentError}</div>}

            <form className="clean-form" onSubmit={handleAssignmentSubmit}>
              <div className="form-field">
                <label htmlFor="assignment-facility">시설 선택</label>
                <select
                  id="assignment-facility"
                  name="facilityId"
                  value={assignmentForm.facilityId}
                  onChange={handleAssignmentChange}
                  disabled={isOptionsLoading || isSavingAssignment}
                  required
                >
                  <option value="">시설을 선택해주세요</option>
                  {facilities.map((facility, index) => {
                    const facilityId = getFacilityId(facility);

                    return (
                      <option
                        key={facilityId ?? `facility-${index}`}
                        value={String(facilityId ?? "")}
                      >
                        {displayValue(getFacilityName(facility), "이름 없음")}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="assignment-device">장비 선택</label>
                <select
                  id="assignment-device"
                  name="deviceId"
                  value={assignmentForm.deviceId}
                  onChange={handleAssignmentChange}
                  disabled={isOptionsLoading || isSavingAssignment}
                  required
                >
                  <option value="">장비를 선택해주세요</option>
                  {devices.map((device, index) => {
                    const deviceId = getDeviceId(device);

                    return (
                      <option
                        key={deviceId ?? `device-${index}`}
                        value={String(deviceId ?? "")}
                      >
                        {displayValue(deviceId, "ID 없음")}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeAssignmentModal}
                  disabled={isSavingAssignment}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isOptionsLoading || isSavingAssignment}
                >
                  {isSavingAssignment ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCagesPage;
