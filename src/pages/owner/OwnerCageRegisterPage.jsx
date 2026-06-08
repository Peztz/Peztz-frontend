import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { buildVideoUrl } from "../../api/client";
import { verifyAccessCode } from "../../api/owner";
import { getMyPets } from "../../api/pets";

function OwnerCageRegisterPage() {
  const navigate = useNavigate();

  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [verifiedCage, setVerifiedCage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadPets = async () => {
      try {
        const data = await getMyPets();
        setPets(data);

        if (data.length > 0) {
          setSelectedPetId(data[0].id);
        }
      } catch {
        const savedPets = JSON.parse(
          localStorage.getItem("peztz_owner_pets") || "[]"
        );
        setPets(savedPets);

        if (savedPets.length > 0) {
          setSelectedPetId(savedPets[0].id);
        }
      }
    };

    loadPets();
  }, []);

  const selectedPet = pets.find((pet) => pet.id === selectedPetId);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      alert("접근 코드를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const result = await verifyAccessCode(accessCode.trim());

      if (!result.valid) {
        setErrorMessage("유효하지 않은 접근 코드입니다.");
        return;
      }

      const cage = {
        id: String(result.sessionId),
        sessionId: Number(result.sessionId),
        petId: selectedPet?.id,
        petName: result.petName || selectedPet?.name || "반려동물",
        petBreed: selectedPet?.breed,
        facilityName: "인증된 시설",
        cageName: result.cageName,
        status: "ACTIVE",
        deviceStatus: result.videoUrl ? "ONLINE" : "UNKNOWN",
        temperature: "-",
        humidity: "-",
        specialCount: 0,
        reportStatus: "조회 가능",
        accessCode: accessCode.trim(),
        videoUrl: buildVideoUrl({ videoUrl: result.videoUrl }),
        registeredAt: new Date().toISOString(),
      };

      const savedCages = JSON.parse(
        localStorage.getItem("peztz_owner_cages") || "[]"
      );
      const nextCages = [
        cage,
        ...savedCages.filter((item) => String(item.sessionId) !== String(cage.sessionId)),
      ];

      localStorage.setItem("peztz_owner_cages", JSON.stringify(nextCages));
      localStorage.setItem("peztz_last_verified_cage", JSON.stringify(cage));
      setVerifiedCage(cage);

      navigate(`/owner/cages/${cage.id}/live`, { state: { cage } });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "접근 코드 인증에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="owner-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Cage Access</span>
          <h1>케이지 등록</h1>
          <p>
            시설에서 전달받은 접근 코드를 입력하여 내 반려동물이 입실한
            케이지 접근 권한을 등록합니다.
          </p>
        </div>

        <button className="secondary-button" onClick={() => navigate("/owner")}>
          홈으로
        </button>
      </section>

      {errorMessage && <div className="form-error">{errorMessage}</div>}

      <section className="two-column-layout">
        <form className="content-card clean-form" onSubmit={handleSubmit}>
          <div className="section-header">
            <div>
              <h2>등록 정보 입력</h2>
              <p>접근 코드는 시설에서 발급한 일회용 코드입니다.</p>
            </div>
          </div>

          <div className="form-field">
            <label>등록할 반려동물</label>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              disabled={pets.length === 0}
            >
              {pets.length === 0 ? (
                <option>등록된 반려동물이 없습니다</option>
              ) : (
                pets.map((pet) => (
                  <option value={pet.id} key={pet.id}>
                    {pet.name} / {pet.breed}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-field">
            <label>접근 코드</label>
            <input
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="시설에서 받은 접근 코드를 입력하세요"
            />
          </div>

          <div className="notice-box">
            <strong>서버 인증으로 처리됩니다</strong>
            <p>
              입력한 접근 코드로 서버가 ACTIVE 입실 세션을 확인하고, 성공하면
              세션 ID와 영상 URL을 받아 실시간 화면으로 이동합니다.
            </p>
          </div>

          <div className="button-row">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/owner")}
            >
              취소
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "인증 중..." : "등록하기"}
            </button>
          </div>
        </form>

        <aside className="content-card">
          <div className="section-header">
            <div>
              <h2>등록 미리보기</h2>
              <p>인증 성공 후 실시간 영상 화면으로 이동합니다.</p>
            </div>
          </div>

          {verifiedCage ? (
            <div className="cage-preview-clean">
              <div className="preview-info-list">
                <div>
                  <span>세션 ID</span>
                  <strong>{verifiedCage.sessionId}</strong>
                </div>
                <div>
                  <span>반려동물</span>
                  <strong>{verifiedCage.petName}</strong>
                </div>
                <div>
                  <span>케이지</span>
                  <strong>{verifiedCage.cageName}</strong>
                </div>
                <div>
                  <span>영상</span>
                  <strong>{verifiedCage.videoUrl ? "연결됨" : "없음"}</strong>
                </div>
              </div>
            </div>
          ) : selectedPet ? (
            <div className="cage-preview-clean">
              <div className="preview-top">
                <div className="pet-avatar large">{selectedPet.name.slice(0, 1)}</div>
                <div>
                  <h3>{selectedPet.name}</h3>
                  <p>{selectedPet.breed}</p>
                </div>
              </div>

              <div className="preview-info-list">
                <div>
                  <span>접근 코드</span>
                  <strong>{accessCode || "입력 대기"}</strong>
                </div>
                <div>
                  <span>시설 정보</span>
                  <strong>코드 인증 후 표시</strong>
                </div>
                <div>
                  <span>케이지 정보</span>
                  <strong>코드 인증 후 표시</strong>
                </div>
                <div>
                  <span>상태</span>
                  <strong>등록 대기</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state compact">
              <div className="empty-icon">🐾</div>
              <h3>반려동물 목록이 비어 있습니다</h3>
              <p>접근 코드 인증은 가능하지만, 먼저 반려동물을 등록하면 표시가 더 정확합니다.</p>
              <button
                className="primary-button"
                onClick={() => navigate("/owner/pets")}
              >
                반려동물 추가하기
              </button>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

export default OwnerCageRegisterPage;
