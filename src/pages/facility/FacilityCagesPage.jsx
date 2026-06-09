import { useEffect, useMemo, useState } from "react";

import {
  DEFAULT_FACILITY_ID,
  createFacilityCage,
  getFacilityCages,
  updateFacilityCage,
} from "../../api/facility";

const DEFAULT_DEVICE_ID = "7bf2b0d2-dd67-4002-929a-d4505f6af890";

function displayValue(value, fallback = "-") {
  if (value === null || value === undefined || value === "" || value === "-") {
    return fallback;
  }

  return value;
}

function getCageId(cage) {
  return cage.id ?? cage.cageId;
}

function getStatusBadge(status) {
  if (status === "AVAILABLE") return "badge green";
  if (status === "OCCUPIED") return "badge blue";
  return "badge red";
}

function FacilityCagesPage() {
  const [cages, setCages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [name, setName] = useState("");
  const [cageNumber, setCageNumber] = useState("");
  const [raspberryPiDeviceId, setRaspberryPiDeviceId] = useState(DEFAULT_DEVICE_ID);

  const [editingCage, setEditingCage] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    cageNumber: "",
    raspberryPiDeviceId: "",
  });

  const loadCages = async () => {
    setErrorMessage("");

    try {
      const data = await getFacilityCages();
      setCages(data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "케이지 목록을 불러오지 못했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getFacilityCages()
      .then((data) => {
        if (isMounted) setCages(data);
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(
          error.response?.data?.message || "케이지 목록을 불러오지 못했습니다."
        );
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const available = cages.filter((cage) => cage.status === "AVAILABLE").length;
    const occupied = cages.filter((cage) => cage.status === "OCCUPIED").length;
    const maintenance = cages.filter((cage) => cage.status === "MAINTENANCE").length;

    return { available, occupied, maintenance };
  }, [cages]);

  const resetForm = () => {
    setName("");
    setCageNumber("");
    setRaspberryPiDeviceId(DEFAULT_DEVICE_ID);
  };

  const openEditModal = (cage) => {
    setEditingCage(cage);
    setEditForm({
      name: String(cage.name ?? ""),
      cageNumber: String(cage.cageNumber ?? ""),
      raspberryPiDeviceId: String(cage.raspberryPiDeviceId ?? ""),
    });
    setEditErrorMessage("");
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    if (isUpdating) return;
    setIsEditOpen(false);
    setEditingCage(null);
    setEditErrorMessage("");
  };

  const handleEditFormChange = (event) => {
    const { name: fieldName, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !cageNumber.trim() || !raspberryPiDeviceId.trim()) {
      setErrorMessage("케이지명, 케이지 번호, Raspberry Pi deviceId를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const newCage = await createFacilityCage({
        name: name.trim(),
        cageNumber: cageNumber.trim(),
        status: "AVAILABLE",
        raspberryPiDeviceId: raspberryPiDeviceId.trim(),
      });

      setCages([newCage, ...cages]);
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "케이지 등록에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCage = async (event) => {
    event.preventDefault();

    if (!editingCage) return;

    const cageId = getCageId(editingCage);
    const nextName = editForm.name.trim();
    const nextCageNumber = editForm.cageNumber.trim();
    const nextDeviceId = editForm.raspberryPiDeviceId.trim();

    if (!nextName) {
      setEditErrorMessage("케이지명을 입력해주세요.");
      return;
    }

    if (!cageId) {
      setEditErrorMessage("케이지 ID를 확인할 수 없습니다.");
      return;
    }

    setIsUpdating(true);
    setEditErrorMessage("");

    try {
      await updateFacilityCage(DEFAULT_FACILITY_ID, cageId, {
        name: nextName,
        cageNumber: nextCageNumber,
        raspberryPiDeviceId: nextDeviceId,
      });
      await loadCages();
      setIsEditOpen(false);
      setEditingCage(null);
    } catch (error) {
      if (error.response?.status === 404) {
        setEditErrorMessage("등록되지 않은 Raspberry Pi 장비입니다.");
        return;
      }

      if (error.response?.status === 403) {
        setEditErrorMessage("해당 케이지를 수정할 권한이 없습니다.");
        return;
      }

      setEditErrorMessage("케이지 정보를 수정하지 못했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="facility-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Cage Management</span>
          <h1>케이지 관리</h1>
          <p>
            시설별 케이지 목록을 조회하고 케이지와 라즈베리파이 장비 연결을
            관리합니다.
          </p>
          <p className="inline-help">현재 테스트 시설 ID: {DEFAULT_FACILITY_ID}</p>
        </div>

        <div className="hero-actions">
          <button className="secondary-button" onClick={loadCages}>
            새로고침
          </button>
          <button
            className="primary-button"
            onClick={() => setIsFormOpen((prev) => !prev)}
          >
            {isFormOpen ? "닫기" : "케이지 등록"}
          </button>
        </div>
      </section>

      {errorMessage && <div className="form-error">{errorMessage}</div>}

      <section className="facility-summary-grid">
        <div className="facility-stat-card">
          <span>전체 케이지</span>
          <strong>{isLoading ? "-" : cages.length}</strong>
          <p>시설에 등록된 케이지</p>
        </div>
        <div className="facility-stat-card">
          <span>사용 가능</span>
          <strong>{isLoading ? "-" : stats.available}</strong>
          <p>입실 처리 가능</p>
        </div>
        <div className="facility-stat-card">
          <span>입실 중</span>
          <strong>{isLoading ? "-" : stats.occupied}</strong>
          <p>현재 사용 중</p>
        </div>
        <div className="facility-stat-card danger">
          <span>점검</span>
          <strong>{isLoading ? "-" : stats.maintenance}</strong>
          <p>점검 상태</p>
        </div>
      </section>

      {isFormOpen && (
        <section className="facility-card">
          <div className="section-header">
            <div>
              <h2>새 케이지 등록</h2>
              <p>status는 AVAILABLE로 등록합니다.</p>
            </div>
          </div>

          <form className="clean-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>케이지명</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="예: 시설 테스트 케이지"
                />
              </div>

              <div className="form-field">
                <label>케이지 번호</label>
                <input
                  value={cageNumber}
                  onChange={(event) => setCageNumber(event.target.value)}
                  placeholder="예: F-1"
                />
              </div>

              <div className="form-field">
                <label>Raspberry Pi deviceId</label>
                <input
                  value={raspberryPiDeviceId}
                  onChange={(event) => setRaspberryPiDeviceId(event.target.value)}
                  placeholder={DEFAULT_DEVICE_ID}
                />
              </div>
            </div>

            <div className="button-row">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  resetForm();
                  setIsFormOpen(false);
                }}
              >
                취소
              </button>
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="facility-card">
        <div className="section-header">
          <div>
            <h2>시설별 케이지 목록</h2>
            <p>AVAILABLE 상태의 케이지는 입실 관리 화면에서 선택할 수 있습니다.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="small-empty">케이지 목록을 불러오는 중입니다.</div>
        ) : cages.length === 0 ? (
          <div className="empty-state compact">
            <h3>등록된 케이지가 없습니다</h3>
            <p>입실 처리를 테스트하려면 먼저 새 케이지를 등록해주세요.</p>
          </div>
        ) : (
          <div className="facility-table-wrap">
            <table className="facility-table facility-cage-table">
              <thead>
                <tr>
                  <th>케이지 ID</th>
                  <th>케이지명</th>
                  <th>번호</th>
                  <th>상태</th>
                  <th>Raspberry Pi</th>
                  <th>영상</th>
                  <th>등록일</th>
                  <th className="facility-cage-actions-column">관리</th>
                </tr>
              </thead>
              <tbody>
                {cages.map((cage) => (
                  <tr key={getCageId(cage)}>
                    <td>{displayValue(getCageId(cage))}</td>
                    <td>
                      <strong>{displayValue(cage.name)}</strong>
                    </td>
                    <td>{displayValue(cage.cageNumber)}</td>
                    <td>
                      <span className={getStatusBadge(cage.status)}>
                        {displayValue(cage.status)}
                      </span>
                    </td>
                    <td>{displayValue(cage.raspberryPiDeviceId)}</td>
                    <td>{cage.videoUrl ? "연결됨" : "없음"}</td>
                    <td>{cage.createdAt ? cage.createdAt.slice(0, 10) : "-"}</td>
                    <td className="facility-cage-actions-cell">
                      <button
                        type="button"
                        className="mini-button edit-cage-button"
                        onClick={() => openEditModal(cage)}
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isEditOpen && editingCage && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-panel" role="dialog" aria-modal="true">
            <div className="modal-head">
              <div>
                <span className="eyebrow">Cage</span>
                <h2>케이지 수정</h2>
                <p>케이지명, 번호, 연결 Raspberry Pi 장비를 수정합니다.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={closeEditModal}
                aria-label="닫기"
                disabled={isUpdating}
              >
                x
              </button>
            </div>

            {editingCage.status === "OCCUPIED" && (
              <div className="warning-box">
                입실 중인 케이지의 장비를 변경하면 견주 영상 연결에 영향을 줄 수 있습니다.
              </div>
            )}

            {editErrorMessage && (
              <div className="form-error">{editErrorMessage}</div>
            )}

            <form className="clean-form" onSubmit={handleUpdateCage}>
              <div className="form-field">
                <label htmlFor="edit-cage-name">케이지명</label>
                <input
                  id="edit-cage-name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  disabled={isUpdating}
                />
              </div>

              <div className="form-field">
                <label htmlFor="edit-cage-number">케이지 번호</label>
                <input
                  id="edit-cage-number"
                  name="cageNumber"
                  value={editForm.cageNumber}
                  onChange={handleEditFormChange}
                  disabled={isUpdating}
                />
              </div>

              <div className="form-field">
                <label htmlFor="edit-raspberry-pi">Raspberry Pi 장비 ID</label>
                <input
                  id="edit-raspberry-pi"
                  name="raspberryPiDeviceId"
                  value={editForm.raspberryPiDeviceId}
                  onChange={handleEditFormChange}
                  placeholder="비워두면 기존 장비 연결이 유지됩니다."
                  disabled={isUpdating}
                />
                <p className="inline-help">비워두면 기존 장비 연결이 유지됩니다.</p>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeEditModal}
                  disabled={isUpdating}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isUpdating}
                >
                  {isUpdating ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FacilityCagesPage;
