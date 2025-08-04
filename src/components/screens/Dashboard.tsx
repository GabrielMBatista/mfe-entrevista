"use client";

import React, { useState, useEffect } from "react";
import { useGoogleFont } from "@/utils/fonts";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  User,
  Star,
  Tag,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Layout from "../Layout";
import { fetchCompletedSessions, reEvaluateSession } from "@/lib/api";
import { Session, SessionSummary } from "@/types/types";
import { Pagination } from "../ui/pagination";
import Charts from "@/components/dashboard/Charts";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registre os módulos necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Função para mapear SessionSummary para Session
const mapSessionSummaryToSession = (summary: SessionSummary): Session => ({
  id: summary.id,
  candidateName: summary.candidateName || "N/A",
  score: summary.score || 0,
  completedAt: summary.completedAt || new Date().toISOString(),
  category: summary.category || "Desconhecida",
  interviewType: summary.interviewType || "Geral",
  summary: summary.summary || "",
  fullReport: summary.fullReport || undefined, // Mapeia o relatório completo, se disponível
  answers: (summary.answers || []).map((answer) => ({
    question: answer.question || "N/A", // Ajusta para acessar diretamente a pergunta
    response: answer.response || "N/A", // Ajusta para acessar diretamente a resposta
  })),
});

export default function Dashboard() {
  const fontFamily = useGoogleFont("Inter");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(sessions.length / pageSize);
  const paginatedSessions = sessions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "candidateName", direction: "desc" });

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedSessions = [...paginatedSessions].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const order = direction === "asc" ? 1 : -1;
    if ((a[key as keyof Session] ?? "") < (b[key as keyof Session] ?? ""))
      return -1 * order;
    if ((a[key as keyof Session] ?? "") > (b[key as keyof Session] ?? ""))
      return 1 * order;
    return 0;
  });

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const completedSessions = await fetchCompletedSessions();
        const transformedSessions = completedSessions.map(
          mapSessionSummaryToSession
        ); // Mapeia os dados
        setSessions(transformedSessions);
      } catch (error) {
        console.error("Erro ao buscar sessões concluídas:", error);
      }
    };

    fetchSessions();
  }, []);

  const toggleRowExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedRows(newExpanded);
  };

  const handleReEvaluateSession = async (sessionId: string) => {
    try {
      await reEvaluateSession(sessionId);
      alert("Sessão reavaliada com sucesso!");
    } catch (error) {
      console.error("Erro ao reavaliar sessão:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseFullReport = (reportString?: string) => {
    if (!reportString) return null;
    try {
      return JSON.parse(reportString);
    } catch {
      return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"; // Verde para notas altas
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"; // Amarelo para notas médias
    if (score >= 40) return "text-orange-600 dark:text-orange-400"; // Laranja para notas baixas
    return "text-red-600 dark:text-red-400"; // Vermelho para notas muito baixas
  };

  // Calcular a quantidade de usuários em cada nível
  const scoreDistribution = {
    excellent: sessions.filter((s) => s.score >= 80).length,
    medium: sessions.filter((s) => s.score >= 60 && s.score < 80).length,
    low: sessions.filter((s) => s.score >= 40 && s.score < 60).length,
    poor: sessions.filter((s) => s.score < 40).length,
  };

  const chartData = {
    labels: [
      "Insatisfatório (0-39)",
      "Baixo (40-59)",
      "Médio (60-79)",
      "Excelente (80-100)",
    ],
    datasets: [
      {
        label: "Quantidade de Usuários",
        data: [
          scoreDistribution.poor,
          scoreDistribution.low,
          scoreDistribution.medium,
          scoreDistribution.excellent,
        ],
        backgroundColor: ["#ef4444", "#f97316", "#facc15", "#22c55e"], // Cores correspondentes aos níveis
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Distribuição de Usuários por Nível",
      },
    },
  };

  // Dados para a tabela de ranking
  const rankingData = [...sessions].sort((a, b) => b.score - a.score);

  return (
    <div
      style={{ fontFamily }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
    >
      <Layout title="Dashboard">
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-white">
                Sessões Concluídas
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Lista de todas as entrevistas finalizadas com detalhes
                expandíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Versão Mobile */}
              <div className="block sm:hidden space-y-4 mt-4">
                {paginatedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
                        {session.candidateName}
                      </h3>
                      <span
                        className={`text-xs font-semibold ${getScoreColor(session.score)}`}
                      >
                        {session.score.toFixed(0)}/100 ⭐
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3 h-3 inline-block mr-1" />
                      {formatDate(session.completedAt)}
                    </div>

                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                      {session.category}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="text-xs border-slate-300 dark:border-slate-600"
                    >
                      {session.interviewType}
                    </Badge>

                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRowExpansion(session.id)}
                        className="text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                      >
                        {expandedRows.has(session.id) ? "Fechar" : "Expandir"}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReEvaluateSession(session.id)}
                        className="text-xs border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                      >
                        Reavaliar
                      </Button>
                    </div>

                    {expandedRows.has(session.id) && (
                      <div className="mt-4 text-xs text-slate-600 dark:text-slate-300 space-y-4">
                        {/* Relatório Completo */}
                        {session.fullReport &&
                          (() => {
                            const report = parseFullReport(session.fullReport);
                            return report ? (
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-white">
                                  Relatório Completo:
                                </p>
                                <div className="space-y-2">
                                  <p>
                                    <strong>Nível de Conhecimento:</strong>{" "}
                                    {report.nivelDeConhecimento}
                                  </p>
                                  <p>
                                    <strong>Comunicação:</strong>{" "}
                                    {report.comunicacao}
                                  </p>
                                  <p>
                                    <strong>Potencial:</strong>{" "}
                                    {report.potencialDeCrescimento}
                                  </p>
                                  <p>
                                    <strong>Pontos Fortes:</strong>{" "}
                                    {report.pontosFortes?.join(", ")}
                                  </p>
                                  <p>
                                    <strong>Pontos de Melhoria:</strong>{" "}
                                    {report.pontosDeMelhoria?.join(", ")}
                                  </p>
                                </div>
                              </div>
                            ) : null;
                          })()}

                        {/* Respostas */}
                        {session.answers.length > 0 && (
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white">
                              Respostas:
                            </p>
                            <div className="space-y-2">
                              {session.answers.map((answer, index) => (
                                <div
                                  key={index}
                                  className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg"
                                >
                                  <p className="font-medium text-slate-800 dark:text-white">
                                    {answer.question}
                                  </p>
                                  <p className="text-slate-600 dark:text-slate-300">
                                    {answer.response}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resumo */}
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">
                            Resumo Para o usuario:
                          </p>
                          <p className="whitespace-pre-wrap">
                            {session.summary}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Paginação Mobile */}
              <div className="sm:hidden">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onNext={handleNextPage}
                  onPrevious={handlePreviousPage}
                />
              </div>

              {/* Versão Desktop */}
              <Table className="hidden sm:table">
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700">
                    <TableHead
                      onClick={() => handleSort("candidateName")}
                      className="cursor-pointer text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
                    >
                      Candidato{" "}
                      {sortConfig?.key === "candidateName" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("score")}
                      className="cursor-pointer text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
                    >
                      Pontuação{" "}
                      {sortConfig?.key === "score" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("completedAt")}
                      className="cursor-pointer text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
                    >
                      Data{" "}
                      {sortConfig?.key === "completedAt" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("category")}
                      className="cursor-pointer text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
                    >
                      Categoria{" "}
                      {sortConfig?.key === "category" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("interviewType")}
                      className="cursor-pointer text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
                    >
                      Tipo de Entrevista{" "}
                      {sortConfig?.key === "interviewType" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSessions.map((session) => (
                    <React.Fragment key={session.id}>
                      <TableRow className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs sm:text-sm">
                        <TableCell className="font-medium text-slate-800 dark:text-white">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span>{session.candidateName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span
                              className={`font-semibold ${getScoreColor(session.score)}`}
                            >
                              {session.score.toFixed(0)}/100
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span>{formatDate(session.completedAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs sm:text-sm"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {session.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
                          >
                            {session.interviewType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleRowExpansion(session.id)}
                              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm"
                            >
                              {expandedRows.has(session.id) ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1" />
                                  Fechar
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  Expandir
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleReEvaluateSession(session.id)
                              }
                              className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm"
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Reavaliar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {expandedRows.has(session.id) && (
                        <TableRow className="border-slate-200 dark:border-slate-700">
                          <TableCell
                            colSpan={6}
                            className="bg-slate-50 dark:bg-slate-800/50 p-4 text-xs sm:text-sm"
                          >
                            <div className="p-4 space-y-6">
                              {/* Relatório Completo */}
                              {session.fullReport &&
                                (() => {
                                  const report = parseFullReport(
                                    session.fullReport
                                  );
                                  return report ? (
                                    <div>
                                      <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
                                        Relatório Completo
                                      </h4>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 whitespace-pre-wrap break-words">
                                          <h5 className="font-medium text-slate-800 dark:text-white mb-2">
                                            Avaliação Geral
                                          </h5>
                                          <div className="space-y-2 text-sm">
                                            <p className="text-slate-600 dark:text-slate-300">
                                              <strong>
                                                Nível de Conhecimento:
                                              </strong>{" "}
                                              {report.nivelDeConhecimento}
                                            </p>
                                            <p className="text-slate-600 dark:text-slate-300">
                                              <strong>Comunicação:</strong>{" "}
                                              {report.comunicacao}
                                            </p>
                                            <p className="text-slate-600 dark:text-slate-300">
                                              <strong>Potencial:</strong>{" "}
                                              {report.potencialDeCrescimento}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 whitespace-pre-wrap break-words">
                                          <h5 className="font-medium text-slate-800 dark:text-white mb-2">
                                            Pontos Fortes
                                          </h5>
                                          <div className="flex flex-wrap gap-1">
                                            {report.pontosFortes?.map(
                                              (
                                                ponto: string,
                                                index: number
                                              ) => (
                                                <Badge
                                                  key={index}
                                                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs"
                                                >
                                                  {ponto}
                                                </Badge>
                                              )
                                            )}
                                          </div>

                                          <h5 className="font-medium text-slate-800 dark:text-white mb-2 mt-4">
                                            Pontos de Melhoria
                                          </h5>
                                          <div className="flex flex-wrap gap-1 break-words">
                                            {report.pontosDeMelhoria?.map(
                                              (
                                                ponto: string,
                                                index: number
                                              ) => (
                                                <Badge
                                                  key={index}
                                                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs whitespace-normal break-words max-w-full"
                                                >
                                                  {ponto}
                                                </Badge>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : null;
                                })()}

                              {/* Respostas */}
                              {session.answers.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-slate-800 dark:text-white mb-3">
                                    Respostas
                                  </h4>
                                  <div className="space-y-4">
                                    {session.answers.map((answer, index) => (
                                      <div
                                        key={index}
                                        className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600"
                                      >
                                        <h5 className="font-medium text-slate-800 dark:text-white mb-2">
                                          {answer.question}
                                        </h5>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                                          {answer.response}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Resumo */}
                              <div>
                                <h4 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center">
                                  <FileText className="w-4 h-4 mr-2" />
                                  Resumo Para o usuario
                                </h4>
                                <p className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-200 dark:border-slate-600 whitespace-pre-wrap break-words">
                                  {session.summary}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação Desktop */}
              <div className="hidden sm:block">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onNext={handleNextPage}
                  onPrevious={handlePreviousPage}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mt-6">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-white">
                Mapa de Cores das Notas
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Entenda o significado das cores atribuídas às notas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                  <span className="text-slate-800 dark:text-slate-300 text-sm">
                    0-39: Desempenho Insatisfatório
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                  <span className="text-slate-800 dark:text-slate-300 text-sm">
                    40-59: Desempenho Baixo
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
                  <span className="text-slate-800 dark:text-slate-300 text-sm">
                    60-79: Desempenho Médio
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  <span className="text-slate-800 dark:text-slate-300 text-sm">
                    80-100: Desempenho Excelente
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mt-6">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-white">
                Visualizações de Dados
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Explore os gráficos relacionados às sessões.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Charts
                sessions={sessions}
                chartData={chartData}
                chartOptions={chartOptions}
              />
            </CardContent>
          </Card>
        </div>
      </Layout>
    </div>
  );
}
