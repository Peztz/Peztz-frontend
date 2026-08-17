import { useEffect, useState } from "react";

import { createPet, deletePet, getMyPets, updatePet } from "../../api/pets";
import UiIcon from "../../components/UiIcon";
import { formatPetAge } from "../../utils/petAge";

function getPetDetail(pet) {
  const vaccination = pet.vaccinationStatus || pet.vaccination || pet.vaccinations;

  return {
    weight: pet.weightKg != null ? `${pet.weightKg}kg` : "연동 예정",
    vaccination:
      Array.isArray(vaccination) ? vaccination.join(", ") : vaccination || "연동 예정",
    recentEvent: pet.recentEvent?.message || pet.latestEvent?.message || "최근 특이사항 없음",
    hasRecentEvent: Boolean(pet.recentEvent || pet.latestEvent),
    healthStatus: pet.healthStatus || "양호",
    hasHealthStatus: Boolean(pet.healthStatus),
    recentReport:
      pet.latestReport?.summary || pet.recentReport?.summary || "규칙적인 활동과 휴식이 관찰되었습니다.",
    hasRecentReport: Boolean(pet.latestReport || pet.recentReport),
  };
}

function vaccinationStatusText(value) {
  return value === "연동 예정" ? "예방접종 API 연동 예정" : "등록 정보";
}

function OwnerPetsPage() {
  const [pets, setPets] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPetId, setSelectedPetId] = useState(null);

  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [species, setSpecies] = useState("DOG");
  const [gender, setGender] = useState("MALE");
  const [birthDate, setBirthDate] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [medicalNote, setMedicalNote] = useState("");

  const [editingPet, setEditingPet] = useState(null);
  const [editName, setEditName] = useState("");
  const [editBreed, setEditBreed] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editMedicalNote, setEditMedicalNote] = useState("");

  useEffect(() => {
    let isMounted = true;

    getMyPets()
      .then((data) => {
        if (!isMounted) return;

        setPets(data);
        localStorage.setItem("peztz_owner_pets", JSON.stringify(data));
      })
      .catch((error) => {
        if (!isMounted) return;

        const fallbackPets = JSON.parse(
          localStorage.getItem("peztz_owner_pets") || "[]"
        );
        setPets(fallbackPets);
        setErrorMessage(
          error.response?.data?.message || "반려동물 목록을 불러오지 못했습니다."
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setName("");
    setBreed("");
    setSpecies("DOG");
    setGender("MALE");
    setBirthDate("");
    setWeightKg("");
    setMedicalNote("");
  };

  const openEditForm = (pet) => {
    setEditingPet(pet);
    setEditName(pet.name || "");
    setEditBreed(pet.breed || pet.petBreed || "");
    setEditBirthDate(pet.birthDate || "");
    setEditMedicalNote(pet.memo || pet.medicalNote || "");
    setErrorMessage("");
  };

  const closeEditForm = () => {
    setEditingPet(null);
    setEditName("");
    setEditBreed("");
    setEditBirthDate("");
    setEditMedicalNote("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("반려동물 이름을 입력해주세요.");
      return;
    }

    if (!breed.trim()) {
      alert("품종/견종을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const newPet = await createPet({
        name: name.trim(),
        breed: breed.trim(),
        species,
        gender,
        birthDate: birthDate || null,
        weightKg: weightKg ? Number(weightKg) : null,
        memo: medicalNote.trim(),
      });

      const nextPets = [newPet, ...pets];
      setPets(nextPets);
      localStorage.setItem("peztz_owner_pets", JSON.stringify(nextPets));
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "반려동물 등록에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (petId) => {
    if (!window.confirm("반려동물을 삭제할까요?")) return;

    setErrorMessage("");

    try {
      await deletePet(petId);
      const nextPets = pets.filter((pet) => pet.id !== petId);
      setPets(nextPets);
      if (selectedPetId === petId) setSelectedPetId(null);
      localStorage.setItem("peztz_owner_pets", JSON.stringify(nextPets));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "반려동물 삭제에 실패했습니다."
      );
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingPet) return;

    if (!editName.trim()) {
      alert("반려동물 이름을 입력해주세요.");
      return;
    }

    if (!editBreed.trim()) {
      alert("품종/견종을 입력해주세요.");
      return;
    }

    setIsUpdating(true);
    setErrorMessage("");

    const payload = {
      name: editName.trim(),
      breed: editBreed.trim(),
      birthDate: editBirthDate || null,
      memo: editMedicalNote.trim(),
    };

    if (editingPet.species) payload.species = editingPet.species;
    if (editingPet.gender) payload.gender = editingPet.gender;
    if (editingPet.weightKg != null) payload.weightKg = editingPet.weightKg;

    try {
      const updatedPet = await updatePet(editingPet.id, payload);
      const nextPets = pets.map((pet) =>
        pet.id === editingPet.id ? updatedPet : pet
      );

      setPets(nextPets);
      localStorage.setItem("peztz_owner_pets", JSON.stringify(nextPets));
      closeEditForm();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "반려동물 수정에 실패했습니다."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="owner-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Pet Management</span>
          <h1>내 반려동물</h1>
          <p>케이지 등록 시 선택할 반려동물 정보를 미리 등록합니다.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setIsFormOpen((prev) => !prev)}
        >
          {isFormOpen ? "닫기" : "반려동물 추가"}
        </button>
      </section>

      {errorMessage && <div className="form-error">{errorMessage}</div>}

      {isFormOpen && (
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>반려동물 정보 등록</h2>
              <p>이름, 품종/견종, 주의사항을 입력합니다.</p>
            </div>
          </div>

          <form className="clean-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>이름</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 초코"
                />
              </div>

              <div className="form-field">
                <label>품종 / 견종</label>
                <input
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="예: 푸들, 말티즈, 포메라니안"
                />
              </div>

              <div className="form-field">
                <label>종</label>
                <select value={species} onChange={(e) => setSpecies(e.target.value)}>
                  <option value="DOG">강아지</option>
                  <option value="CAT">고양이</option>
                  <option value="ETC">기타</option>
                </select>
              </div>

              <div className="form-field">
                <label>성별</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="MALE">남아</option>
                  <option value="FEMALE">여아</option>
                  <option value="UNKNOWN">모름</option>
                </select>
              </div>

              <div className="form-field">
                <label>생년월일</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>몸무게 kg</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="예: 5.2"
                />
              </div>
            </div>

            <div className="form-field">
              <label>주의사항</label>
              <textarea
                value={medicalNote}
                onChange={(e) => setMedicalNote(e.target.value)}
                placeholder="예: 낯선 사람을 무서워함, 특정 사료 알레르기 있음"
                rows={4}
              />
            </div>

            <div className="button-row">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsFormOpen(false)}
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

      {editingPet && (
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>반려동물 정보 수정</h2>
              <p>이름, 품종/견종, 생년월일, 주의사항을 수정합니다.</p>
            </div>
          </div>

          <form className="clean-form" onSubmit={handleUpdate}>
            <div className="form-grid">
              <div className="form-field">
                <label>이름</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="예: 초코"
                />
              </div>

              <div className="form-field">
                <label>품종 / 견종</label>
                <input
                  value={editBreed}
                  onChange={(e) => setEditBreed(e.target.value)}
                  placeholder="예: 푸들, 말티즈, 포메라니안"
                />
              </div>

              <div className="form-field">
                <label>생년월일</label>
                <input
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-field">
              <label>주의사항</label>
              <textarea
                value={editMedicalNote}
                onChange={(e) => setEditMedicalNote(e.target.value)}
                placeholder="예: 낯선 사람을 무서워함, 특정 사료 알레르기 있음"
                rows={4}
              />
            </div>

            <div className="button-row">
              <button
                type="button"
                className="secondary-button"
                onClick={closeEditForm}
              >
                취소
              </button>
              <button type="submit" className="primary-button" disabled={isUpdating}>
                {isUpdating ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="content-card">
        <div className="section-header">
          <div>
            <h2>반려동물 목록</h2>
            <p>등록된 반려동물은 케이지 등록 화면에서 선택할 수 있습니다.</p>
          </div>
          <span className="count-badge">{pets.length}마리</span>
        </div>

        {isLoading ? (
          <div className="small-empty">반려동물 목록을 불러오는 중입니다.</div>
        ) : pets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><UiIcon name="pet" size={28} /></div>
            <h3>등록된 반려동물이 없습니다</h3>
            <p>반려동물 추가 버튼을 눌러 정보를 등록해주세요.</p>
          </div>
        ) : (
          <div className="pet-card-grid">
            {pets.map((pet) => {
              const isDetailOpen = selectedPetId === pet.id;
              const detail = getPetDetail(pet);

              return (
              <div className="pet-card-wrapper" key={pet.id}>
              <article className="pet-card">
                <div className="pet-avatar">{pet.name?.slice(0, 1) || "P"}</div>

                <div className="pet-card-body">
                  <div className="pet-card-title">
                    <h3>{pet.name}</h3>
                    <span className="badge blue">등록 완료</span>
                  </div>

                  <p className="pet-meta">품종/견종: {pet.breed || "정보 없음"}</p>
                  <p className="pet-meta">나이: {formatPetAge(pet.birthDate)}</p>
                  <p className="pet-note">
                    {pet.memo || pet.medicalNote || "등록된 주의사항이 없습니다."}
                  </p>
                </div>

                <div className="pet-card-actions">
                  <button
                    className="mini-button"
                    onClick={() => setSelectedPetId(isDetailOpen ? null : pet.id)}
                  >
                    {isDetailOpen ? "상세 닫기" : "상세 보기"}
                  </button>
                  <button
                    className="mini-button"
                    onClick={() => openEditForm(pet)}
                  >
                    수정
                  </button>
                  <button
                    className="text-danger-button"
                    onClick={() => handleDelete(pet.id)}
                  >
                    삭제
                  </button>
                </div>
              </article>

              {isDetailOpen && (
                <section className="pet-detail-panel">
                  <div className="pet-detail-heading">
                    <div>
                      <span className="eyebrow">Pet Detail</span>
                      <h3>{pet.name} 상세 정보</h3>
                    </div>
                    <span className="badge gray">미연동 항목 Demo 표시</span>
                  </div>
                  <div className="pet-detail-metric-grid">
                    <div><span>체중</span><strong>{detail.weight}</strong><small>{pet.weightKg == null ? "체중 API 연동 예정" : "등록 정보"}</small></div>
                    <div><span>나이</span><strong>{formatPetAge(pet.birthDate)}</strong><small>등록된 생년월일 기준</small></div>
                    <div><span>예방접종</span><strong>{detail.vaccination}</strong><small>{vaccinationStatusText(detail.vaccination)}</small></div>
                    <div><span>건강 상태</span><strong>{detail.healthStatus}</strong><small>{detail.hasHealthStatus ? "API 데이터" : "Demo"}</small></div>
                  </div>
                  <div className="pet-detail-feed-grid">
                    <article>
                      <span>최근 이벤트</span>
                      <strong>{detail.recentEvent}</strong>
                      <small>{detail.hasRecentEvent ? "API 데이터" : "Demo · 이벤트 API 연동 예정"}</small>
                    </article>
                    <article>
                      <span>최근 리포트</span>
                      <strong>{detail.recentReport}</strong>
                      <small>{detail.hasRecentReport ? "API 데이터" : "Demo · 리포트 API 연동 예정"}</small>
                    </article>
                  </div>
                </section>
              )}
              </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default OwnerPetsPage;
