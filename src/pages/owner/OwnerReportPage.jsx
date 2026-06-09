

import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

// 💡 만약 부모 컴포넌트에서 props로 진짜 cageId나 petName을 넘겨준다면 그걸 쓰고, 없으면 기본값(테스트용)을 씁니다.
function OwnerReportPage({ cageId, petName }) {
  const [report, setReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 현재 화면에서 사용할 진짜 데이터 세팅 (없으면 준님 테스트용 UUID와 초코로 매핑)
  const currentCageId = cageId || "55555555-5555-5555-5555-555555555555";
  const currentPetName = petName || "초코";

  const handleFetchReport = async () => {
    setIsLoading(true);
    setError(""); 
    setReport(""); 

    try {
      // 🚀 준님이 띄워놓은 8500번 FastAPI 구글 클라우드 IP 또는 로컬 배달 포트로 슛!
      const response = await axios.post("http://localhost:8500/api/report/generate", {
        cage_id: currentCageId,
        pet_name: currentPetName
      });

      if (response.data.status === "success") {
        setReport(response.data.report); 
      } else {
        setError("리포트 생성에 실패했습니다.");
      }
    } catch (err) {
      setError("❌ AI 서버(8500번 포트)와 통신에 실패했습니다. 백엔드가 정상 구동 중인지 확인해 주세요.");
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

      {/* 🐶 현재 조회 중인 아기 정보 카드 */}
      <div style={styles.petCard}>
        <span style={styles.cardLabel}>분석 대상:</span> 
        <strong style={styles.cardValue}> {currentPetName}</strong>
        <span style={styles.cardSub}> ({currentCageId.substring(0, 8)}... 케이지)</span>
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
          {isLoading ? "수의사 AI가 로그 분석 중... 🔄" : "보고서 보기"}
        </button>
      </div>

      {/* 에러 메시지 팝업 */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* 📊 대망의 제미나이 마크다운 보고서 출력 영역 */}
      {report && (
        <div style={styles.reportBox} className="markdown-body">
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

// 🎨 기존 웹 스타일과 잘 어우러지는 모던 CSS 스타일
const styles = {
  pageContainer: { maxWidth: '750px', margin: '40px auto', padding: '0 20px', fontFamily: '"Pretendard", sans-serif' },
  header: { textAlign: 'center', marginBottom: '25px' },
  title: { fontSize: '26px', fontWeight: '700', color: '#2c3e50', margin: '0 0 8px 0' },
  subtitle: { fontSize: '15px', color: '#7f8c8d', margin: 0 },
  petCard: { backgroundColor: '#edf2f7', padding: '12px 20px', borderRadius: '10px', textAlign: 'center', marginBottom: '25px', fontSize: '15px', color: '#4a5568' },
  cardLabel: { color: '#718096' },
  cardValue: { color: '#2b6cb0', fontSize: '16px' },
  cardSub: { fontSize: '13px', color: '#a0aec0' },
  buttonContainer: { display: 'flex', justifyContent: 'center', marginBottom: '30px' },
  reportButton: { padding: '12px 30px', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.08)' },
  errorBox: { padding: '15px', backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', borderRadius: '8px', textAlign: 'center', fontWeight: '500', marginBottom: '20px' },
  reportBox: { padding: '35px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', lineHeight: '1.8', color: '#2d3748', fontSize: '16px' }
};

export default OwnerReportPage;

