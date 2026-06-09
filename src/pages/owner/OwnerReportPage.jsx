import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function OwnerReportPage() {
  const [petList, setPetList] = useState([]); // 🐶 SQL 규격 맞춤 반려동물 리스트
  const [selectedPet, setSelectedPet] = useState(null); // 선택된 강아지
  const [report, setReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. 🔥 팀원들의 SQL 더미 데이터 규격과 100% 일치시킵니다.
  useEffect(() => {
    const officialDummyPets = [
      { id: 1, name: "초코 (푸들)", cageId: "55555555-5555-5555-5555-555555555555" },
      { id: 2, name: "쿠키 (말티즈)", cageId: "66666666-6666-6666-6666-666666666666" },
      { id: 3, name: "바닐라 (리트리버)", cageId: "77777777-7777-7777-7777-777777777777" }
    ];
    setPetList(officialDummyPets);
    setSelectedPet(officialDummyPets[0]); // 기본값으로 대망의 '초코' 선택!
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
      // 🎯 맥북 터널로 연결된 진짜 스프링 부트(8080)의 리포트 생성 API를 정조준합니다!
      const response = await axios.post("http://localhost:8080/api/report/generate", {
        cage_id: selectedPet.cageId, // SQL에 박힌 55555555-... 가 그대로 날아감!
        pet_name: selectedPet.name
      });

      // 스프링이 리턴해주는 DTO 구조에 맞게 매핑
      if (response.data && (response.data.report || response.data.status === "success")) {
        setReport(response.data.report || response.data.text); 
      } else {
        setError("리포트 생성에 실패했습니다. 스프링 반환 값 구조를 확인해 주세요.");
      }
    } catch (err) {
      setError("❌ 스프링 서버(8080번 포트) 통신 실패! SSH 터널링 상태나 스프링 API 주소를 확인해 주세요.");
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

      {/* 🔘 라디오 버튼 선택 영역 (공식 시연용 테스트 모드) */}
      <div style={styles.petSelectorContainer}>
        <p style={styles.selectorTitle}>👇 분석할 반려동물을 선택하세요 (시연용 SQL 데이터 세트 연동)</p>
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
              <input type="radio" style={{ display: 'none' }} />
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
          {isLoading ? `${selectedPet?.name}의 로그 분석 중... 🔄` : "보고서 보기"}
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* 📊 결과 출력 영역 (제미나이 마크다운 렌더링) */}
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