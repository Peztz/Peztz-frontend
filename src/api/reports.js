import { springApi } from "./client";

export function normalizeDailyReport(report = {}) {
  return {
    ...report,
    totalLogCount: Number(report.totalLogCount ?? 0),
    sensorLogCount: Number(report.sensorLogCount ?? 0),
    averageTemperature: report.averageTemperature ?? null,
    averageHumidity: report.averageHumidity ?? null,
    summary: report.summary || "등록된 일일 리포트 요약이 없습니다.",
  };
}

export async function getDailyReport(petId, date) {
  const { data } = await springApi.get("/api/reports/daily", {
    params: { petId, date },
  });
  return normalizeDailyReport(data);
}
