import { useEffect, useState } from "react";
import {
  createAdminFacility,
  getAdminFacilities,
  updateAdminFacility,
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

function getFacilityId(facility) {
  return facility.facilityId ?? facility.id;
}

function getFacilityName(facility) {
  return facility.facilityName ?? facility.name;
}

function getFacilityPhone(facility) {
  return facility.phoneNumber ?? facility.phone ?? facility.contact;
}

function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [facilityForm, setFacilityForm] = useState({
    facilityName: "",
    phoneNumber: "",
  });
  const [editingFacility, setEditingFacility] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    facilityName: "",
    phoneNumber: "",
  });

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const data = await getAdminFacilities();
      setFacilities(toArray(data));
    } catch (error) {
      console.error("관리자 시설 조회 실패:", error);
      setErrorMessage("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadFacilities() {
      try {
        setLoading(true);
        setErrorMessage("");
        const data = await getAdminFacilities();
        setFacilities(toArray(data));
      } catch (error) {
        console.error("관리자 시설 조회 실패:", error);
        setErrorMessage("데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    loadFacilities();
  }, []);

  const openCreateModal = () => {
    setFacilityForm({
      facilityName: "",
      phoneNumber: "",
    });
    setCreateError("");
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    if (isCreating) return;
    setIsCreateOpen(false);
    setCreateError("");
  };

  const openEditModal = (facility) => {
    setEditingFacility(facility);
    setEditForm({
      facilityName: String(getFacilityName(facility) ?? ""),
      phoneNumber: String(getFacilityPhone(facility) ?? ""),
    });
    setEditError("");
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    if (isUpdating) return;
    setIsEditOpen(false);
    setEditingFacility(null);
    setEditError("");
  };

  const handleCreateFormChange = (event) => {
    const { name, value } = event.target;
    setFacilityForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateFacilityName = (facilityName, setFormError) => {
    if (!facilityName) {
      setFormError("시설명을 입력해주세요.");
      return false;
    }

    if (facilityName.length > 20) {
      setFormError("시설명은 20자 이하로 입력해주세요.");
      return false;
    }

    return true;
  };

  const handleCreateFacility = async (event) => {
    event.preventDefault();

    const facilityName = facilityForm.facilityName.trim();
    const phoneNumber = facilityForm.phoneNumber.trim();

    if (!validateFacilityName(facilityName, setCreateError)) return;

    setIsCreating(true);
    setCreateError("");

    try {
      await createAdminFacility({
        facilityName,
        phoneNumber,
      });
      await fetchFacilities();
      setIsCreateOpen(false);
      setFacilityForm({
        facilityName: "",
        phoneNumber: "",
      });
    } catch (error) {
      console.error("관리자 시설 추가 실패:", error);

      if (error.response?.status === 400) {
        setCreateError("이미 등록된 시설명입니다.");
        return;
      }

      setCreateError("시설을 추가하지 못했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateFacility = async (event) => {
    event.preventDefault();

    if (!editingFacility) return;

    const facilityId = getFacilityId(editingFacility);
    const facilityName = editForm.facilityName.trim();
    const phoneNumber = editForm.phoneNumber.trim();

    if (!facilityId) {
      setEditError("시설 ID를 확인할 수 없습니다.");
      return;
    }

    if (!validateFacilityName(facilityName, setEditError)) return;

    setIsUpdating(true);
    setEditError("");

    try {
      await updateAdminFacility(facilityId, {
        facilityName,
        phoneNumber,
      });
      await fetchFacilities();
      setIsEditOpen(false);
      setEditingFacility(null);
    } catch (error) {
      console.error("관리자 시설 수정 실패:", error);

      if (error.response?.status === 400) {
        setEditError("이미 등록된 시설명입니다.");
        return;
      }

      setEditError("시설 정보를 수정하지 못했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="admin-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Facility Management</span>
          <h1>전체 시설 관리</h1>
          <p>관리자 API에서 조회한 전체 시설 정보를 표시합니다.</p>
        </div>

        <button className="primary-button" onClick={openCreateModal}>
          시설 추가
        </button>
      </section>

      <section className="admin-card">
        <div className="section-header">
          <div>
            <h2>시설 목록</h2>
            <p>시설명, 연락처, 케이지 수를 확인하고 시설 정보를 수정합니다.</p>
          </div>
          <span className="count-badge">{facilities.length}개</span>
        </div>

        {loading && <p>불러오는 중...</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}

        {!loading && !errorMessage && facilities.length === 0 && (
          <p>조회된 시설이 없습니다.</p>
        )}

        {!loading && !errorMessage && facilities.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table facility-table">
              <thead>
                <tr>
                  <th>시설 ID</th>
                  <th>시설명</th>
                  <th>연락처</th>
                  <th>케이지 수</th>
                  <th className="facility-actions-column">관리</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((facility, index) => (
                  <tr key={getFacilityId(facility) ?? `facility-${index}`}>
                    <td>{displayValue(getFacilityId(facility))}</td>
                    <td>
                      <strong>
                        {displayValue(getFacilityName(facility), "시설 미연결")}
                      </strong>
                    </td>
                    <td>{displayValue(getFacilityPhone(facility))}</td>
                    <td>
                      {displayValue(
                        facility.totalCages ?? facility.cageCount ?? facility.cages,
                        0
                      )}
                    </td>
                    <td className="facility-actions-cell">
                      <button
                        type="button"
                        className="mini-button"
                        onClick={() => openEditModal(facility)}
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

      {isCreateOpen && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-panel" role="dialog" aria-modal="true">
            <div className="modal-head">
              <div>
                <span className="eyebrow">Facility</span>
                <h2>시설 추가</h2>
                <p>관리자 권한으로 새 시설을 등록합니다.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={closeCreateModal}
                aria-label="닫기"
                disabled={isCreating}
              >
                x
              </button>
            </div>

            {createError && <div className="form-error">{createError}</div>}

            <form className="clean-form" onSubmit={handleCreateFacility}>
              <div className="form-field">
                <label htmlFor="facility-name">시설명</label>
                <input
                  id="facility-name"
                  name="facilityName"
                  value={facilityForm.facilityName}
                  onChange={handleCreateFormChange}
                  placeholder="행복 동물병원"
                  maxLength={21}
                  disabled={isCreating}
                />
              </div>

              <div className="form-field">
                <label htmlFor="facility-phone">연락처</label>
                <input
                  id="facility-phone"
                  name="phoneNumber"
                  value={facilityForm.phoneNumber}
                  onChange={handleCreateFormChange}
                  placeholder="051-123-4567"
                  disabled={isCreating}
                />
              </div>

              <div className="button-row">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeCreateModal}
                  disabled={isCreating}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isCreating}
                >
                  {isCreating ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditOpen && editingFacility && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-panel" role="dialog" aria-modal="true">
            <div className="modal-head">
              <div>
                <span className="eyebrow">Facility</span>
                <h2>시설 수정</h2>
                <p>시설명과 연락처만 수정할 수 있습니다.</p>
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

            {editError && <div className="form-error">{editError}</div>}

            <form className="clean-form" onSubmit={handleUpdateFacility}>
              <div className="form-field">
                <label htmlFor="edit-facility-name">시설명</label>
                <input
                  id="edit-facility-name"
                  name="facilityName"
                  value={editForm.facilityName}
                  onChange={handleEditFormChange}
                  maxLength={21}
                  disabled={isUpdating}
                />
              </div>

              <div className="form-field">
                <label htmlFor="edit-facility-phone">연락처</label>
                <input
                  id="edit-facility-phone"
                  name="phoneNumber"
                  value={editForm.phoneNumber}
                  onChange={handleEditFormChange}
                  placeholder="051-123-4567"
                  disabled={isUpdating}
                />
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

export default AdminFacilitiesPage;
