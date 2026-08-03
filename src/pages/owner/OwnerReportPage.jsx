import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const OFFICIAL_DUMMY_PETS = [
  { id: 1, name: "초코", cageId: "55555555-5555-5555-5555-555555555555" },
  { id: 2, name: "쿠키", cageId: "66666666-6666-6666-6666-666666666666" },
  { id: 3, name: "바닐라", cageId: "77777777-7777-7777-7777-777777777777" }
];

const DEMO_HEALTH_DATA = {
  "초코": {
    weight: "4.8kg",
    weightChange: "+0.1kg",
    sleepDuration: "11시간 20분",
    sleepQuality: "좋음",
    environmentChange: "온도 +0.4°C · 습도 -2%",
    behaviorAnalysis: "놀이 활동과 휴식 패턴이 규칙적이며 이상행동이 감지되지 않았습니다.",
    healthAnalysis: "활동량과 수분 섭취가 정상 범위로 전반적인 상태가 안정적입니다.",
    dailySummary: "규칙적으로 식사하고 충분히 수면한 안정적인 하루였습니다.",
  },
  "쿠키": {
    weight: "3.6kg",
    weightChange: "변화 없음",
    sleepDuration: "9시간 45분",
    sleepQuality: "보통",
    environmentChange: "온도 -0.2°C · 습도 +3%",
    behaviorAnalysis: "활동량은 충분하지만 저녁 시간에 짧은 긁기 행동이 관찰되었습니다.",
    healthAnalysis: "음수량이 평소보다 낮아 수분 섭취 여부를 추가로 관찰해야 합니다.",
    dailySummary: "활동은 활발했으나 수분 섭취와 반복 행동을 지켜볼 필요가 있습니다.",
  },
  "바닐라": {
    weight: "5.2kg",
    weightChange: "-0.2kg",
    sleepDuration: "13시간 10분",
    sleepQuality: "주의",
    environmentChange: "온도 변화 없음 · 습도 -5%",
    behaviorAnalysis: "누워 있는 시간이 전일보다 증가하고 활동량이 감소했습니다.",
    healthAnalysis: "활력과 음수량이 낮아 상태가 지속되면 전문가 상담이 필요합니다.",
    dailySummary: "활동과 음수량이 감소한 날로 세심한 관찰이 권장됩니다.",
  },
};

function OwnerReportPage() {
  const [petList] = useState(OFFICIAL_DUMMY_PETS);
  const [selectedPet, setSelectedPet] = useState(OFFICIAL_DUMMY_PETS[0]);
  const [report, setReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const selectedHealthData = DEMO_HEALTH_DATA[selectedPet?.name];

  // TODO: Replace Demo content with the owner daily-report API when its response is finalized.
  const handleFetchReport = async () => {
    if (!selectedPet) {
      setError("분석할 반려동물을 먼저 선택해 주세요.");
      return;
    }

    setIsLoading(true);
    setError(""); 
    setReport(""); 

    // Demo report used until the health report API is connected.
    const mockGeminiResponses = {
      "초코": `
## 🐾 AI 반려동물 일일 건강 리포트 (초코)

본 내용은 웹 기능 확인을 위한 Demo 데이터이며 의료 진단이나 수의사 소견이 아닙니다.

### 📊 24시간 행동 지표 분석
* **식사 상태:** 오전 08:00에 정상적인 섭취가 확인되었으며 일일 권장 칼로리를 충족했습니다.
* **활동량 패턴:** 오후 02:00경 케이지 내부 우측 구역에서 활동량이 일시적으로 급증했으나 스트레스성이 아닌 정상 유희 활동으로 분석됩니다.
* **수면 효율:** 오후 04:00에 안정적으로 수면 상태에 진입하여 누적 11시간 이상의 양질의 수면을 취했습니다.

### 🩺 수의사 종합 소견
초코의 전반적인 행동 매커니즘은 매우 건강한 생체 리듬을 나타내고 있습니다. Vision AI 분석 결과 특정 구역에서의 반복적인 정형 행동이나 불안 징후는 관찰되지 않았습니다. 누적 음수량(150ml) 또한 푸들 품종의 일일 평균 기준치 내에 안정적으로 도달했습니다.

### 💡 맞춤 케어 가이드
1. **활동 구역 다각화:** 오후 시간대 우측 구역 활동량이 많으므로 해당 위치에 간단한 터널이나 노즈워크 장난감을 배치해 주시면 스트레스 해소에 더욱 도움이 됩니다.
2. **야간 온습도 모니터링:** 수면 진입 시간이 규칙적이므로 야간 수면 시 케이지 내부 온도가 24°C 이하로 떨어지지 않도록 보온 설정을 유지해 주세요.
      `,
      "쿠키": `
## 🐾 AI 반려동물 일일 건강 리포트 (쿠키)

본 내용은 웹 기능 확인을 위한 Demo 데이터이며 의료 진단이나 수의사 소견이 아닙니다.

### 📊 24시간 행동 지표 분석
* **식사 상태:** 오전 09:10분경 약간의 식사 지연(거부 반응)이 관찰되었으나 이후 정상 섭취 완료했습니다.
* **활동량 패턴:** 오후 01:00부터 쳇바퀴 구동 활동이 20분간 지속되며 높은 에너지 대사율을 보였습니다.
* **이상 징후:** 오후 06:00경 케이지 구석을 반복적으로 긁는 행동(Scratching)이 미소하게 관찰되었습니다.

### 🩺 수의사 종합 소견
전체적인 활동량은 쳇바퀴 구동 로그에서 보듯 매우 활발하고 양호합니다. 다만, 오후 6시경 발생한 구석 긁기 행동은 일시적인 영역 표시일 수 있으나 음수량(90ml)이 평소보다 다소 저조한 상태와 결합되어 경미한 스트레스성 반응일 가능성도 존재합니다. 

### 💡 맞춤 케어 가이드
1. **수분 공급 촉진:** 누적 음수량이 다소 부족하므로 사료에 물을 살짝 섞어주거나 신선한 물로 자주 교체하여 음수를 유도해 주세요.
2. **환경 풍부화:** 구석을 긁는 행동이 지속되는지 관찰해 주시고, 케이지 내부에 갉아먹을 수 있는 이갈이 스틱이나 대체 놀거리를 제공해 주시는 것을 권장합니다.
      `,
      "바닐라": `
## 🐾 AI 반려동물 일일 건강 리포트 (바닐라)

본 내용은 웹 기능 확인을 위한 Demo 데이터이며 의료 진단이나 수의사 소견이 아닙니다.

### 📊 24시간 행동 지표 분석
* **식사 상태:** 오전 07:30분경 조기 식사를 완료하였으나 이후 추가 섭취는 관찰되지 않았습니다.
* **활동량 패턴:** 오후 03:00를 기점으로 무기력하게 누워있는 시간(Inactivity)이 전일 대비 25% 증가했습니다.
* **음수 상태:** 오후 07:00경 음수대 접근 후 음수를 거부하는 징후가 포착되었으며 누적 음수량은 50ml로 매우 저조합니다.

### 🩺 수의사 종합 소견
바닐라의 경우 오늘 전반적인 생체 활력 지수(Vitality Index)가 하락 곡선을 그리고 있습니다. 특히 활동량이 눈에 띄게 줄어들고 음수 거부 징후와 함께 누적 수분 섭취량이 임계치(50ml)에 머물러 있어 호흡기 점막 건조 및 탈수 초기 증상이 우려될 수 있는 상태입니다.

### 💡 맞춤 케어 가이드
1. **긴급 수분 보충:** 즉각적인 습식 캔 사료 급여를 통해 강제적인 수분 섭취를 유도해 주셔야 합니다.
2. **컨디션 체크 및 격리:** 무기력증이 내일 오전까지 지속되거나 체온 저하가 동반될 경우 즉시 전문 수의사의 대면 진료를 받아보시는 것을 강력히 권장합니다.
      `
    };

    // Short delay keeps the existing loading interaction visible in Demo mode.
    setTimeout(() => {
      setReport(mockGeminiResponses[selectedPet.name]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <div className="health-report-title-row">
          <h1 style={styles.title}>📋 일일 건강 리포트</h1>
          <span className="badge gray">Demo 데이터</span>
        </div>
        <p style={styles.subtitle}>현재 내용은 기능 확인용 Demo이며 의료 진단이 아닙니다.</p>
      </div>

      <div style={styles.petSelectorContainer}>
        <p style={styles.selectorTitle}>분석할 반려동물을 선택하세요.</p>
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
                onChange={() => {
                  setSelectedPet(pet);
                  setReport("");
                }}
                style={styles.radioInput}
              />
              <strong style={styles.petNameText}>{pet.name}</strong>
              <span style={styles.cageText}>({pet.cageId.substring(0,8)}... 케이지)</span>
            </label>
          ))}
        </div>
      </div>

      {selectedHealthData && (
        <section className="health-report-overview" aria-label="Demo 건강 지표">
          <div className="health-report-metrics">
            <article>
              <span>현재 체중</span>
              <strong>{selectedHealthData.weight}</strong>
              <small>변화 {selectedHealthData.weightChange}</small>
            </article>
            <article>
              <span>수면 시간</span>
              <strong>{selectedHealthData.sleepDuration}</strong>
              <small>수면 품질 {selectedHealthData.sleepQuality}</small>
            </article>
            <article>
              <span>환경 변화</span>
              <strong>{selectedHealthData.environmentChange}</strong>
              <small>전일 평균 대비</small>
            </article>
          </div>

          <div className="health-analysis-grid">
            <article><span>행동 분석 · Demo</span><p>{selectedHealthData.behaviorAnalysis}</p></article>
            <article><span>건강 분석 · Demo</span><p>{selectedHealthData.healthAnalysis}</p></article>
            <article><span>하루 요약 · Demo</span><p>{selectedHealthData.dailySummary}</p></article>
          </div>
        </section>
      )}

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
          {isLoading ? `${selectedPet?.name}의 Demo 리포트 준비 중...` : "Demo 보고서 보기"}
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
