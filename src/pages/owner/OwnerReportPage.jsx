import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function OwnerReportPage() {
  const [petList, setPetList] = useState([]); // 🐶 실제 등록된 반려동물 목록
  const [selectedPet, setSelectedPet] = useState(null); // 선택된 반려동물
  const [report, setReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. 화면이 켜지면 스프링 부트(8080)에서 로그인한 유저의 진짜 강아지 목록을 가져옵니다.
  useEffect(() => {
    const fetchMyPets = async () => {
      try {
        // ⚠️ 팀원들이 만들어둔 "내 반려동물 목록 조회" 엔드포인트 주소로 확인 필요! (예: /api/pets)
        const response = await axios.get("http://localhost:8080/api/pets"); 
        if (response.data && response.data.length > 0) {
          setPetList(response.data);
          setSelectedPet(response.data[0]); // 첫 번째 강아지 기본 선택
        } else {
          setError("ℹ️ 등록된 반려동물이 없습니다. 먼저 반려동물을 등록해 주세요.");
        }
      } catch (err) {
        console.error("반려동물 목록 로드 실패:", err);
        setError("❌ 스프링 서버로부터 반려동물 목록을 불러오지 못했습니다.");
      }
    };

    fetchMyPets();
  }, []);

  // 🚀 2. [보고서 보기] 버튼 클릭 시 요청
  const handleFetchReport = async () => {
    if (!selectedPet) {
      setError("분석할 반려동물을 먼저 선택해 주세요.");
      return;
    }

    setIsLoading(true);
    setError(""); 
    setReport(""); 

    try {
      // 🔥 팀원이 완성해 둔 스프링 부트(8080)의 리포트 생성 API를 정조준합니다!
      const response = await axios.post("http://localhost:8080/api/report/generate", {
        cage_id: selectedPet.cageId, // 스프링 필드명에 맞게 cage_id 또는 cageId 확인
        pet_name: selectedPet.name
      });

      if (response.data.status === "success" || response.data.report) {
        // 스프링이 리턴해주는 구조에 맞게 매핑 (예: response.data.report)
        setReport(response.data.report); 
      } else {
        setError("리포트 생성에 실패했습니다.");
      }
    } catch (err) {
      setError("❌ 스프링 서버(8080번 포트) 통신 실패! 서버 상태를 확인해 주세요.");
      console.error(err);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <h1 style={styles.title}>📋 일일 건강 리포트</h1>
        <p style={styles.subtitle}>반려동물의 실시간 Vision AI 행동 로그를 분석한 수의사 소견서입니다.</p>
      </div>

      {/* 🔘 라디오 버튼 선택 영역 (실제 내 강아지들) */}
      <div style={styles.petSelectorContainer}>
        <p style={styles.selectorTitle}>👇 분석할 반려동물을 선택하세요</p>
        <div style={styles.radioGroup}>
          {petList.map((pet) => (
            <label key={pet.id} style={{
              ...styles.radioLabel,
              backgroundColor: selectedPet?.id === pet.id ? '#ebf8ff' : '#fff',
              borderColor: selectedPet?.id === pet.id ? '#3182ce' : '#e2e8f0'
            }}>
              <input
                type="radio"
                name="selectedPet"
                checked={selectedPet?.id === pet.id}
                onChange={() => setSelectedPet(pet)}
                style={styles.radioInput}
              />
              <strong style={styles.petNameText}>{pet.name}</strong>
              {pet.cageId && <span style={styles.cageText}>({pet.cageId.substring(0,8)}... 케이지)</span>}
            </label>
          ))}
        </div>
      </div>

      {/* 🟢 보고서 보기 버튼 */}
      <div style={styles.buttonContainer}>
        <button 
          onClick={handleFetchReport} 
          disabled={isLoading} 
          style={{
            ...styles.reportButton,
            backgroundColor: isLoading ? '#b0bec5' : '#4CAF50',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? `${selectedPet?.name} 로그 분석 중... 🔄` : "보고서 보기"}
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* 📊 결과 출력 영역 */}
      {report && (
        <div style={styles.reportBox} className="markdown-body">
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageContainer: { maxWidth: '750px', margin: '40px auto', padding: '0 20px', fontFamily: '"Pretendard", sans-serif' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#2c3e50', margin: '0 0 8px 0' },
  subtitle: { fontSize: '15px', color: '#7f8c8d', margin: 0 },
  petSelectorContainer: { backgroundColor: '#f7fafc', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #edf2f7' },
  selectorTitle: { fontSize: '14px', fontWeight: '600', color: '#4a5568', marginTop: 0, marginBottom: '12px' },
  radioGroup: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  radioLabel: { display: 'flex', alignItems: 'center', padding: '10px 16px', border: '2px solid', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' },
  radioInput: { marginRight: '8px', cursor: 'pointer' },
  petNameText: { color: '#2d3748', fontSize: '15px' },
  cageText: { fontSize: '12px', color: '#718096', marginLeft: '4px' },
  buttonContainer: { display: 'flex', justifyContent: 'center', marginBottom: '30px' },
  reportButton: { padding: '12px 35px', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.08)' },
  errorBox: { padding: '15px', backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', borderRadius: '8px', textAlign: 'center', fontWeight: '500', marginBottom: '20px' },
  reportBox: { padding: '35px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', lineHeight: '1.8', color: '#2d3748', fontSize: '16px' }
};

export default OwnerReportPage;