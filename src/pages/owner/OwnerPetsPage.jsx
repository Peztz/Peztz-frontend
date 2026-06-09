import { useEffect, useState } from "react";

import { createPet, deletePet, getMyPets } from "../../api/pets";
import { formatPetAge } from "../../utils/petAge";

function OwnerPetsPage() {
  const [pets, setPets] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [species, setSpecies] = useState("DOG");
  const [gender, setGender] = useState("MALE");
  const [birthDate, setBirthDate] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [medicalNote, setMedicalNote] = useState("");

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
      localStorage.setItem("peztz_owner_pets", JSON.stringify(nextPets));
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "반려동물 삭제에 실패했습니다."
      );
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
            <div className="empty-icon">🐶</div>
            <h3>등록된 반려동물이 없습니다</h3>
            <p>반려동물 추가 버튼을 눌러 정보를 등록해주세요.</p>
          </div>
        ) : (
          <div className="pet-card-grid">
            {pets.map((pet) => (
              <article className="pet-card" key={pet.id}>
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

                <button
                  className="text-danger-button"
                  onClick={() => handleDelete(pet.id)}
                >
                  삭제
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default OwnerPetsPage;
