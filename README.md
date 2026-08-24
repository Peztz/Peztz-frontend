# PEZTZ Frontend

PEZTZ 보호자·시설·관리자용 React 웹 애플리케이션입니다. 보호자 일일 리포트 화면은
Spring 백엔드가 PostgreSQL 로그와 OpenAI 분석 결과를 결합해 반환하는 구조화된 카드
데이터를 표시합니다.

## 기술 구성

- React 19, React Router
- Vite
- Axios
- ESLint

브라우저는 OpenAI를 직접 호출하지 않습니다. OpenAI API 키와 프롬프트는 백엔드에서만
관리하며, 프론트엔드에는 Spring 공개 API 주소만 설정합니다.

## 실행 준비

- Node.js 20.19 이상 또는 22.12 이상
- npm
- 실행 중인 PEZTZ Spring 백엔드

의존성을 설치합니다.

```bash
cd /Users/jun/Documents/GitHub/Peztz-frontend
npm ci
```

로컬 환경 파일을 만듭니다.

```bash
cp .env.example .env.local
```

`/Users/jun/Documents/GitHub/Peztz-frontend/.env.local`에서 로컬 Spring 주소를
다음과 같이 설정합니다.

```text
VITE_API_BASE_URL=http://127.0.0.1:18080
```

프론트 개발 서버를 시작합니다.

```bash
npm run dev -- --host localhost --port 5173
```

브라우저에서 `http://localhost:5173`을 열면 됩니다. Spring의 기본 로컬 CORS 허용
주소도 `localhost:5173`이므로 `127.0.0.1:5173` 대신 이 주소를 사용합니다.

## 로컬 일일 리포트 테스트

먼저 백엔드 Docker 서비스를 실행한 뒤 테스트 전용 데이터를 넣습니다.

```bash
cd /Users/jun/Documents/GitHub/Peztz-backend
./scripts/seed_local_daily_report_demo.sh
```

이 스크립트는 로컬 Docker PostgreSQL에만 다음 데이터를 추가합니다.

- 보호자 이메일: `report.demo@peztz.local`
- 보호자 비밀번호: `PeztzDemo!2026`
- 반려동물: `초코`
- 오늘 날짜의 센서·문 열림·휴식·서성임·저조도 로그 8건

위 계정으로 로그인한 뒤 사이드바의 `일일 리포트`로 이동하고 `오늘` 날짜를 조회합니다.
최초 조회는 OpenAI 생성까지 수십 초가 걸릴 수 있고, 생성된 결과는 PostgreSQL
`daily_report`에 저장되어 다음 조회부터 재사용됩니다.

OpenAI 키가 아직 없다면 전체 카드 레이아웃만 다음 로컬 모의 결과로 확인할 수 있습니다.

```bash
cd /Users/jun/Documents/GitHub/Peztz-backend
./scripts/seed_local_daily_report_ready_mock.sh
```

이 결과도 실제 Spring 인증/API/PostgreSQL 경로로 조회되지만 OpenAI 호출 결과는 아닙니다.
실제 OpenAI 테스트로 돌아갈 때는 `seed_local_daily_report_demo.sh`를 다시 실행합니다.

OpenAI 호출이 실패하면 화면은 수집된 로그·온도·습도 통계를 유지하면서 재시도 안내를
표시합니다. 실제 카드 리포트를 생성하려면 백엔드
`/Users/jun/Documents/GitHub/Peztz-backend/infra/.env.local`에 유효한
`OPENAI_API_KEY`가 있어야 합니다. 키를 프론트 `.env`나 소스에 넣으면 안 됩니다.

## 일일 리포트 API

`OwnerReportPage`는 기존 인증 토큰을 사용해 다음 API를 호출합니다.

```http
GET /api/reports/daily?petId={petId}&date=YYYY-MM-DD
Authorization: Bearer {accessToken}
```

화면에 연결되는 주요 필드는 다음과 같습니다.

- `summary`, `riskLevel`
- `environmentCard`
- `behaviorCards[]`
- `careTips[]`, `warnings[]`
- `generatedAt`, `disclaimer`

`READY`, `FAILED`, 로딩, 데이터 없음, 네트워크 오류 상태를 각각 처리합니다. API 응답은
`src/api/reports.js`에서 안전하게 정규화하고 `src/pages/owner/OwnerReportPage.jsx`에서
기존 디자인 구성에 맞춰 렌더링합니다.

## 검증 명령

```bash
npm run lint
npm run build
```

두 명령이 모두 성공해야 배포 가능한 상태입니다.

## 실제 팀 PostgreSQL 연결 시

프론트 코드는 바꾸지 않습니다. 백엔드의 DB 연결 정보와 `daily_report` 마이그레이션을
먼저 적용한 다음, 승인된 보호자·반려동물·날짜로 API를 한 건씩 검증합니다. 상세 절차는
백엔드의 `docs/TEAM_POSTGRES_E2E.md`를 따릅니다.
