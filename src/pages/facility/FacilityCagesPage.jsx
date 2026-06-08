import { useEffect, useMemo, useState } from "react";

import {
  DEFAULT_FACILITY_ID,
  createFacilityCage,
  getFacilityCages,
} from "../../api/facility";

const DEFAULT_DEVICE_ID = "7bf2b0d2-dd67-4002-929a-d4505f6af890";

function FacilityCagesPage() {
  const [cages, setCages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [name, setName] = useState("");
  const [cageNumber, setCageNumber] = useState("");
  const [raspberryPiDeviceId, setRaspberryPiDeviceId] = useState(DEFAULT_DEVICE_ID);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

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

  const getStatusBadge = (status) => {
    if (status === "AVAILABLE") return "badge green";
    if (status === "OCCUPIED") return "badge blue";
    return "badge red";
  };

  return (
    <div className="facility-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Cage Management</span>
          <h1>케이지 관리</h1>
          <p>
            시설별 케이지 목록을 조회하고 새 케이지와 라즈베리파이 장치를
            연결합니다.
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
              <p>status는 AVAILABLE로 등록됩니다.</p>
            </div>
          </div>

          <form className="clean-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>케이지명</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 시설 테스트 케이지"
                />
              </div>

              <div className="form-field">
                <label>케이지 번호</label>
                <input
                  value={cageNumber}
                  onChange={(e) => setCageNumber(e.target.value)}
                  placeholder="예: F-1"
                />
              </div>

              <div className="form-field">
                <label>Raspberry Pi deviceId</label>
                <input
                  value={raspberryPiDeviceId}
                  onChange={(e) => setRaspberryPiDeviceId(e.target.value)}
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
            <table className="facility-table">
              <thead>
                <tr>
                  <th>케이지 ID</th>
                  <th>케이지명</th>
                  <th>번호</th>
                  <th>상태</th>
                  <th>Raspberry Pi</th>
                  <th>영상</th>
                  <th>등록일</th>
                </tr>
              </thead>
              <tbody>
                {cages.map((cage) => (
                  <tr key={cage.id}>
                    <td>{cage.id}</td>
                    <td>
                      <strong>{cage.name}</strong>
                    </td>
                    <td>{cage.cageNumber || "-"}</td>
                    <td>
                      <span className={getStatusBadge(cage.status)}>
                        {cage.status}
                      </span>
                    </td>
                    <td>{cage.raspberryPiDeviceId || "-"}</td>
                    <td>{cage.videoUrl ? "연결됨" : "없음"}</td>
                    <td>{cage.createdAt ? cage.createdAt.slice(0, 10) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default FacilityCagesPage;
