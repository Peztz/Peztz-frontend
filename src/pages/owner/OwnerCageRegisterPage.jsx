import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function OwnerCageRegisterPage() {
    const navigate = useNavigate();

    const [pets, setPets] = useState([]);
    const [selectedPetId, setSelectedPetId] = useState("");
    const [accessCode, setAccessCode] = useState("");

    useEffect(() => {
        const savedPets = JSON.parse(localStorage.getItem("peztz_owner_pets") || "[]");
        setPets(savedPets);

        if (savedPets.length > 0) {
            setSelectedPetId(savedPets[0].id);
        }
    }, []);

    const selectedPet = pets.find((pet) => pet.id === selectedPetId);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (pets.length === 0) {
            alert("먼저 내 반려동물 화면에서 반려동물을 등록해주세요.");
            return;
        }

        if (!accessCode.trim()) {
            alert("접근 코드를 입력해주세요.");
            return;
        }

        const savedCages = JSON.parse(localStorage.getItem("peztz_owner_cages") || "[]");

        const newCage = {
            id: `cage-${Date.now()}`,
            petId: selectedPet.id,
            petName: selectedPet.name,
            petBreed: selectedPet.breed,
            facilityName: "A 펫호텔",
            cageName: `${savedCages.length + 1}번 케이지`,
            status: "ACTIVE",
            deviceStatus: "ONLINE",
            temperature: "26.4°C",
            humidity: "48%",
            specialCount: 3,
            reportStatus: "생성 완료",
            accessCode: accessCode.trim(),
            registeredAt: new Date().toISOString(),
        };

        localStorage.setItem(
            "peztz_owner_cages",
            JSON.stringify([newCage, ...savedCages])
        );

        alert("케이지가 견주 화면에 등록되었습니다.");
        navigate("/owner");
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
                        <strong>백엔드 연결 시 처리될 내용</strong>
                        <p>
                            입력한 접근 코드로 서버가 케이지, 입실 세션, 반려동물 정보를
                            확인하고 견주 계정에 케이지 접근 권한을 연결합니다.
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
                        <button type="submit" className="primary-button">
                            등록하기
                        </button>
                    </div>
                </form>

                <aside className="content-card">
                    <div className="section-header">
                        <div>
                            <h2>등록 미리보기</h2>
                            <p>등록 완료 후 견주 홈에 표시될 형태입니다.</p>
                        </div>
                    </div>

                    {selectedPet ? (
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
                            <h3>반려동물 등록이 필요합니다</h3>
                            <p>케이지를 등록하려면 먼저 반려동물을 추가해주세요.</p>
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