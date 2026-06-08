import { useEffect, useState } from "react";

function OwnerPetsPage() {
  const [pets, setPets] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [medicalNote, setMedicalNote] = useState("");

  useEffect(() => {
    const savedPets = JSON.parse(localStorage.getItem("peztz_owner_pets") || "[]");
    setPets(savedPets);
  }, []);

  const savePets = (nextPets) => {
    setPets(nextPets);
    localStorage.setItem("peztz_owner_pets", JSON.stringify(nextPets));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("반려동물 이름을 입력해주세요.");
      return;
    }

    if (!breed.trim()) {
      alert("품종/견종을 입력해주세요.");
      return;
    }

    const newPet = {
      id: crypto.randomUUID(),
      name: name.trim(),
      breed: breed.trim(),
      medicalNote: medicalNote.trim(),
      createdAt: new Date().toISOString(),
    };

    savePets([...pets, newPet]);

    setName("");
    setBreed("");
    setMedicalNote("");
    setIsFormOpen(false);
  };

  const handleDelete = (petId) => {
    const nextPets = pets.filter((pet) => pet.id !== petId);
    savePets(nextPets);
  };

  return (
    <div className="owner-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Pet Management</span>
          <h1>내 반려동물</h1>
          <p>
            케이지 등록 시 선택할 반려동물 정보를 미리 등록합니다.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setIsFormOpen((prev) => !prev)}
        >
          {isFormOpen ? "닫기" : "반려동물 추가"}
        </button>
      </section>

      {isFormOpen && (
        <section className="content-card">
          <div className="section-header">
            <div>
              <h2>반려동물 정보 등록</h2>
              <p>DB 테이블 기준으로 이름, 품종/견종, 주의사항을 입력합니다.</p>
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
              <button type="submit" className="primary-button">
                등록하기
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

        {pets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🐶</div>
            <h3>등록된 반려동물이 없습니다</h3>
            <p>반려동물 추가 버튼을 눌러 정보를 등록해주세요.</p>
          </div>
        ) : (
          <div className="pet-card-grid">
            {pets.map((pet) => (
              <article className="pet-card" key={pet.id}>
                <div className="pet-avatar">{pet.name.slice(0, 1)}</div>

                <div className="pet-card-body">
                  <div className="pet-card-title">
                    <h3>{pet.name}</h3>
                    <span className="badge blue">등록 완료</span>
                  </div>

                  <p className="pet-meta">품종/견종: {pet.breed}</p>
                  <p className="pet-note">
                    {pet.medicalNote || "등록된 주의사항이 없습니다."}
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