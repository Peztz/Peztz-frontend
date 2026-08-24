const EVENT_LABELS = {
  PACING: "반복해서 걷는 행동",
  SPINNING: "제자리에서 도는 행동",
  LOW_LIGHT: "주변이 어두워짐",
  LIGHT_RECOVERED: "주변 밝기 회복",
  DOOR_OPEN: "케이지 문 열림",
  DOOR_CLOSED: "케이지 문 닫힘",
  SENSOR: "온·습도 측정",
  SENSOR_TEMPERATURE: "온도 측정",
  SENSOR_HUMIDITY: "습도 측정",
  FEED: "급식 기록",
  WATER: "급수 기록",
  MOTION: "움직임 감지",
  NOTE: "보호자 메모",
};

function normalizedEventType(type) {
  return String(type || "").trim().toUpperCase();
}

function lastLuxValue(message) {
  const matches = [...String(message || "").matchAll(/(-?\d+(?:\.\d+)?)\s*lux/gi)];
  return matches.at(-1)?.[1] || "";
}

export function getOwnerEventLabel(type) {
  const normalized = normalizedEventType(type);
  if (!normalized) return "기타 기록";
  return EVENT_LABELS[normalized] || String(type).replaceAll("_", " ");
}

export function getOwnerEventMessage(event = {}) {
  const type = normalizedEventType(event.type || event.eventType);
  const rawMessage = String(event.message || "").trim();
  const lux = lastLuxValue(rawMessage);

  switch (type) {
    case "PACING":
      return "같은 주변을 반복해서 걷는 행동이 감지됐어요.";
    case "SPINNING":
      return "제자리에서 도는 행동이 감지됐어요.";
    case "LOW_LIGHT":
      return lux
        ? `주변이 어두워졌어요. 현재 밝기는 ${lux} lux입니다.`
        : "주변이 어두워졌어요. 케이지 주변 조명을 확인해 주세요.";
    case "LIGHT_RECOVERED":
      return lux
        ? `주변 밝기가 ${lux} lux로 회복됐어요.`
        : "주변 밝기가 정상으로 돌아왔어요.";
    case "DOOR_OPEN":
      return "케이지 문이 열렸어요.";
    case "DOOR_CLOSED":
      return "케이지 문이 닫혔어요.";
    case "SENSOR": {
      const measurements = [];
      if (event.temperature != null) measurements.push(`온도 ${event.temperature}°C`);
      if (event.humidity != null) measurements.push(`습도 ${event.humidity}%`);
      return measurements.length > 0
        ? `${measurements.join(", ")}가 측정됐어요.`
        : "온도와 습도가 측정됐어요.";
    }
    default:
      return rawMessage && rawMessage !== "로그 메시지가 없습니다."
        ? toOwnerFriendlyText(rawMessage)
        : `${getOwnerEventLabel(type)}이 감지됐어요.`;
  }
}

export function toOwnerFriendlyText(value) {
  if (typeof value !== "string") return value || "";

  return value
    .replace(/페이싱\s*(?:\(PACING\))?|\bPACING\b/gi, "반복해서 걷는 행동")
    .replace(/스피닝\s*(?:\(SPINNING\))?|\bSPINNING\b/gi, "제자리에서 도는 행동")
    .replace(/저조도\s*(?:\(LOW_LIGHT\))?|\bLOW_LIGHT\b/gi, "조도가 낮은 상태")
    .replace(/\bDOOR_OPEN\b/gi, "케이지 문 열림")
    .replace(/\bDOOR_CLOSED\b/gi, "케이지 문 닫힘")
    .replace(/\bLIGHT_RECOVERED\b/gi, "주변 밝기 회복")
    .replace(/\bSENSOR_TEMPERATURE\b/gi, "온도 측정")
    .replace(/\bSENSOR_HUMIDITY\b/gi, "습도 측정")
    .replace(/센서\s*\/\s*모델 감지/g, "자동 감지")
    .replace(/\bKST\b/g, "")
    .replace(/\bDB\b/gi, "저장된 데이터")
    .replace(/로그/g, "기록")
    .replace(/\s+([,.)])/g, "$1")
    .replace(/ {2,}/g, " ")
    .trim();
}
