import { useEffect, useState } from "react";

const DEMO_ANALYSIS = {
  suspected: false,
  condition: "뚜렷한 질병 의심 징후 없음",
  summary:
    "업로드된 사진에서는 눈에 띄는 외상이나 피부 발적이 확인되지 않은 것으로 가정한 Demo 결과입니다.",
  cautions: [
    "이 결과는 실제 AI 분석이나 수의학적 진단이 아닙니다.",
    "식욕 저하, 구토, 호흡 이상 등 증상이 있으면 사진 결과와 관계없이 진료를 받아주세요.",
    "정면과 좌우 측면을 밝은 곳에서 촬영하면 향후 분석 정확도 개선에 도움이 됩니다.",
  ],
};

function OwnerHealthAnalysisPage() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const selectImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("JPG, PNG, WEBP 등 이미지 파일을 선택해주세요.");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setAnalysis(null);
    setErrorMessage("");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    selectImage(event.dataTransfer.files?.[0]);
  };

  const handleAnalyze = () => {
    if (!previewUrl) {
      setErrorMessage("분석할 반려동물 사진을 먼저 업로드해주세요.");
      return;
    }

    setErrorMessage("");
    setAnalysis(DEMO_ANALYSIS);
  };

  return (
    <div className="owner-page">
      <section className="page-head">
        <div>
          <span className="eyebrow">AI Health</span>
          <h1>AI 건강 분석</h1>
          <p>
            반려동물 사진을 업로드해 건강 상태 분석 화면을 체험할 수 있습니다.
            현재는 실제 서버로 사진을 전송하지 않는 Demo 기능입니다.
          </p>
        </div>
        <span className="badge gray">API 연동 예정</span>
      </section>

      {errorMessage && <div className="form-error">{errorMessage}</div>}

      <section className="health-upload-layout">
        <article className="content-card">
          <div className="section-header">
            <div>
              <h2>사진 업로드</h2>
              <p>반려동물의 상태가 잘 보이는 사진 한 장을 선택해주세요.</p>
            </div>
            <span className="badge gray">Demo</span>
          </div>

          <label
            className={isDragging ? "health-drop-zone dragging" : "health-drop-zone"}
            htmlFor="health-image-input"
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <span className="health-upload-icon" aria-hidden="true">+</span>
            <strong>사진을 끌어다 놓으세요</strong>
            <span>또는 클릭하여 파일 선택</span>
            <small>JPG, PNG, WEBP 이미지</small>
          </label>
          <input
            id="health-image-input"
            className="visually-hidden-input"
            type="file"
            accept="image/*"
            onChange={(event) => selectImage(event.target.files?.[0])}
          />

          <button className="primary-button full" type="button" onClick={handleAnalyze}>
            사진 분석하기
          </button>
        </article>

        <article className="content-card">
          <div className="section-header">
            <div>
              <h2>이미지 미리보기</h2>
              <p>선택한 사진은 브라우저 안에서만 표시됩니다.</p>
            </div>
          </div>

          <div className="health-image-preview">
            {previewUrl ? (
              <img src={previewUrl} alt="분석할 반려동물 미리보기" />
            ) : (
              <div>
                <strong>선택된 사진이 없습니다</strong>
                <span>왼쪽 영역에서 사진을 업로드해주세요.</span>
              </div>
            )}
          </div>
          {fileName && <p className="health-file-name">선택 파일: {fileName}</p>}
        </article>
      </section>

      {analysis && (
        <section className="content-card health-analysis-result">
          <div className="section-header">
            <div>
              <div className="section-title-row">
                <h2>분석 결과</h2>
                <span className="badge gray">Demo 데이터</span>
              </div>
              <p>실제 AI 모델과 건강 분석 API가 연결되기 전의 예시 결과입니다.</p>
            </div>
          </div>

          <div className="health-result-grid">
            <article>
              <span>질병 의심 여부</span>
              <strong className={analysis.suspected ? "health-risk danger" : "health-risk safe"}>
                {analysis.suspected ? "의심 징후 있음" : "의심 징후 없음"}
              </strong>
              <p>{analysis.condition}</p>
            </article>
            <article>
              <span>건강 분석 요약</span>
              <strong>사진 기반 Demo 분석</strong>
              <p>{analysis.summary}</p>
            </article>
          </div>

          <div className="health-caution-card">
            <h3>주의사항</h3>
            <ul>
              {analysis.cautions.map((caution) => <li key={caution}>{caution}</li>)}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

export default OwnerHealthAnalysisPage;
