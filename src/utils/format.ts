import { SessionSummary, Session } from "@/types/types";

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const mapSessionSummaryToSession = (
  summary: SessionSummary
): Session => ({
  id: summary.id,
  candidateName: summary.candidateName || "N/A",
  score: summary.score || 0,
  completedAt: summary.completedAt || new Date().toISOString(),
  category: summary.category || "Desconhecida",
  interviewType: summary.interviewType || "Geral",
  summary: summary.summary || "",
  fullReport: summary.fullReport || undefined,
  answers: (summary.answers || []).map((answer) => ({
    question: answer.question || "N/A",
    response: answer.response || "N/A",
  })),
});
