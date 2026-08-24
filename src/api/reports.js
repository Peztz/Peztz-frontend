import { springApi } from "./client";

function asStringArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim())
    : [];
}

function asNullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function normalizeDailyReport(report = {}) {
  const environmentCard = report.environmentCard || {};

  return {
    ...report,
    status: report.status === "FAILED" ? "FAILED" : "READY",
    totalLogCount: Number(report.totalLogCount ?? 0),
    sensorLogCount: Number(report.sensorLogCount ?? 0),
    averageTemperature: asNullableNumber(report.averageTemperature),
    averageHumidity: asNullableNumber(report.averageHumidity),
    summary: report.summary || "등록된 일일 리포트 요약이 없습니다.",
    behaviorCards: Array.isArray(report.behaviorCards)
      ? report.behaviorCards.map((card = {}) => ({
          title: card.title || "행동 관찰",
          description: card.description || "상세 설명이 없습니다.",
          evidence: asStringArray(card.evidence),
        }))
      : [],
    environmentCard: {
      title: environmentCard.title || "생활 환경",
      description:
        environmentCard.description || "환경 분석 결과가 충분하지 않습니다.",
      averageTemperature: asNullableNumber(
        environmentCard.averageTemperature ?? report.averageTemperature
      ),
      averageHumidity: asNullableNumber(
        environmentCard.averageHumidity ?? report.averageHumidity
      ),
      doorOpenCount: Number(environmentCard.doorOpenCount ?? 0),
      lowLightCount: Number(environmentCard.lowLightCount ?? 0),
    },
    careTips: asStringArray(report.careTips),
    riskLevel: ["NORMAL", "ATTENTION", "URGENT"].includes(report.riskLevel)
      ? report.riskLevel
      : "NORMAL",
    warnings: asStringArray(report.warnings),
    disclaimer:
      report.disclaimer || "이 리포트는 진단이 아닌 관찰 데이터 요약입니다.",
  };
}

export async function getDailyReport(petId, date) {
  const { data } = await springApi.get("/api/reports/daily", {
    params: { petId, date },
  });
  return normalizeDailyReport(data);
}
