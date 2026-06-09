import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function OwnerReportPage() {
  const [petList, setPetList] = useState([]); 
  const [selectedPet, setSelectedPet] = useState(null); 
  const [report, setReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. SQL 더미 데이터 규격 고정
  useEffect(() => {
    const officialDummyPets = [
      { id: 1, name: "초코", cageId: "55555555-5555-5555-5555-555555555555" },
      { id: 2, name: "쿠키", cageId: "66666666-6666-6666-6666-666666666666" },
      { id: 3, name: "바닐라", cageId: "77777777-7777-7777-7777-777777777777" }
    ];
    setPetList(officialDummyPets);
    setSelectedPet(officialDummyPets[0]); 
  }, []);

  // 🚀 2. Vercel 배포 사이트에서 준님의 GCP 원격 AI 엔진(8500 포트) 직격 슛!
  const handleFetchReport = async () => {
    if (!selectedPet) {
      setError("분석할 반려동물을 먼저 선택해 주세요.");
      return;
    }

    setIsLoading(true);
    setError(""); 
    setReport(""); 

    try {
      // 🎯 핵심 수정: localhost를 지우고, 준님의 진짜 구글 클라우드(GCP) 원격 서버 IP로 정조준합니다!
      const response = await axios.post("http://34.50.7.78:8500/api/report/generate", {
        cage_id: selectedPet.cageId,
        pet_name: selectedPet.name
      });

      // 준님의 파이썬 백엔드가 리턴해주는 필드 "report" 매핑
      if (response.data && response.data.status === "success" && response.data.report) {
        setReport(response.data.report); 
      } else {
        setError("리포트 응답 형식이 올바르지 않습니다.");
      }
    } catch (err) {
      setError("❌ AI 서버(8500번 포트) 통신 실패! GCP 서버에서 FastAPI(uvicorn)가 정상 작동 중인지 확인하세요.");
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

      <div style={styles.petSelectorContainer}>
        <p style={styles.selectorTitle}>👇 분석할 반려동물을 선택하세요 (GCP AI 엔진 연동 완료)</p>
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
              <span style={styles.cageText}>({pet.cageId.substring(0,8)}... 케이지)</span>
            </label>
          ))}
        </div>
      </div>

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

      {error && <div style={styles.errorBox}>{error}</div>}

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