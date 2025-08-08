"use client";

import React, { useState, useEffect } from "react";
import { useGoogleFont } from "@/utils/fonts";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  User,
  Tag,
  FileText,
  Filter,
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
import Header from "@/components/ui/Header";
import {
  fetchCompletedSessions,
  reEvaluateSession,
  getInterviewTypes,
  getCategoriesByInterviewType,
} from "@/lib/api";
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
import { InterviewFilters } from "@/components/dashboard/InterviewFilters";
import { useInterviewFilters } from "@/hooks/useInterviewFilters";
import Loader from "@/components/ui/loader";

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
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "candidateName", // Default sorting key
    direction: "asc", // Default sorting direction
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [interviewTypes, setInterviewTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  console.log("session.", sessions);

  const { filters, handleFilterChange } = useInterviewFilters({});

  // Função para buscar tipos de entrevista da API
  const fetchInterviewTypes = async () => {
    try {
      const response = await getInterviewTypes();
      setInterviewTypes(
        response.map((type) => ({ id: type.id, name: type.name }))
      );
    } catch (error) {
      console.error("Erro ao buscar tipos de entrevista:", error);
      // Fallback para dados mock em caso de erro
      setInterviewTypes([
        { id: "1", name: "Frontend" },
        { id: "2", name: "Backend" },
      ]);
    }
  };

  // Função para buscar todas as categorias da API
  const fetchCategories = async () => {
    try {
      // Primeiro buscar os tipos de entrevista para depois buscar as categorias de cada tipo
      const interviewTypesResponse = await getInterviewTypes();
      let allCategories: Array<{ id: string; name: string }> = [];

      // Para cada tipo de entrevista, buscar suas categorias
      for (const interviewType of interviewTypesResponse) {
        try {
          const categoriesResponse = await getCategoriesByInterviewType(
            interviewType.id,
            1,
            100
          );
          const formattedCategories = categoriesResponse.data.map(
            (category) => ({
              id: category.id,
              name: category.name,
            })
          );
          allCategories = [...allCategories, ...formattedCategories];
        } catch (error) {
          console.error(
            `Erro ao buscar categorias para tipo ${interviewType.name}:`,
            error
          );
        }
      }

      setCategories(allCategories);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      // Fallback para dados mock em caso de erro
      setCategories([
        { id: "1", name: "Dev Júnior" },
        { id: "2", name: "Dev Pleno" },
      ]);
    }
  };

  const handleSort = async (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    try {
      setIsLoading(true);
      const response = await fetchCompletedSessions({
        page: currentPage,
        limit: pageSize,
        startDate: filters.completedAt, // Filtro por data
        endDate: undefined, // Ajuste conforme necessário
        sortBy: key,
        sortOrder: direction,
        ...filters, // Envia os filtros adicionais
      });
      const { data, page } = response;
      const transformedSessions = data.map(mapSessionSummaryToSession);
      setSessions(transformedSessions);
      setCurrentPage(page);
    } catch (error) {
      console.error("Erro ao buscar sessões ordenadas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetchCompletedSessions({
        page: currentPage,
        limit: pageSize,
        startDate: filters.completedAt, // Filtro por data
        endDate: undefined, // Ajuste conforme necessário
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...filters, // Envia os filtros adicionais
      });
      const { data, total, page, limit } = response;
      const transformedSessions = data.map(mapSessionSummaryToSession);
      setSessions(transformedSessions);
      setCurrentPage(page);
      setTotalPages(Math.ceil(total / limit));
    } catch (error) {
      console.error("Erro ao buscar sessões concluídas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchInterviewTypes();
    fetchCategories();
  }, [currentPage, sortConfig, filters]); // Adicione `filters` como dependência

  const toggleRowExpansion = (sessionId: string) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sessionId)) {
        newExpanded.delete(sessionId);
      } else {
        newExpanded.add(sessionId);
      }
      console.log(
        "Toggling row:",
        sessionId,
        "New expanded rows:",
        Array.from(newExpanded)
      );
      return newExpanded;
    });
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

  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      try {
        setIsLoading(true);
        const response = await fetchCompletedSessions({
          page: currentPage + 1,
          limit: pageSize,
          startDate: filters.completedAt, // Filtro por data
          endDate: undefined, // Ajuste conforme necessário
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
          ...filters, // Envia os filtros adicionais
        });
        const { data, page } = response;
        const transformedSessions = data.map(mapSessionSummaryToSession);
        setSessions(transformedSessions);
        setCurrentPage(page);
      } catch (error) {
        console.error("Erro ao buscar próxima página:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePreviousPage = async () => {
    if (currentPage > 1) {
      try {
        setIsLoading(true);
        const response = await fetchCompletedSessions({
          page: currentPage - 1,
          limit: pageSize,
          startDate: filters.completedAt, // Filtro por data
          endDate: undefined, // Ajuste conforme necessário
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
          ...filters, // Envia os filtros adicionais
        });
        const { data, page } = response;
        const transformedSessions = data.map(mapSessionSummaryToSession);
        setSessions(transformedSessions);
        setCurrentPage(page);
      } catch (error) {
        console.error("Erro ao buscar página anterior:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      style={{ fontFamily }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
    >
      <Header showLinks={true} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-800 dark:text-white">
                    Sessões Concluídas
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Lista de todas as entrevistas finalizadas com detalhes
                    expandíveis
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {isFilterMenuOpen ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              {isFilterMenuOpen && (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <InterviewFilters
                    isOpen={true}
                    filters={filters}
                    interviewTypes={interviewTypes}
                    categories={categories}
                    onFilterChange={handleFilterChange}
                    showScore={true}
                    showDate={true}
                  />
                </div>
              )}

              {isLoading ? (
                <Loader message="Carregando sessões..." />
              ) : (
                <>
                  {/* Versão Mobile */}
                  <div className="block sm:hidden space-y-4 mt-4">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
                            {session.candidateName}
                          </h3>
                          <span
                            className={`text-xs font-semibold ${getScoreColor(
                              session.score
                            )}`}
                          >
                            {session.score.toFixed(0)}/100
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
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleRowExpansion(session.id);
                            }}
                            className="text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                          >
                            {expandedRows.has(session.id)
                              ? "Fechar"
                              : "Expandir"}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleReEvaluateSession(session.id);
                            }}
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
                                const report = parseFullReport(
                                  session.fullReport
                                );
                                return report ? (
                                  <div>
                                    <p className="font-semibold text-slate-800 dark:text-white">
                                      Relatório Completo:
                                    </p>
                                    <div className="space-y-2">
                                      <p className="break-words word-wrap text-wrap hyphens-auto max-w-full">
                                        <strong>Nível de Conhecimento:</strong>{" "}
                                        {report.nivelDeConhecimento}
                                      </p>
                                      <p className="break-words word-wrap text-wrap hyphens-auto max-w-full">
                                        <strong>Comunicação:</strong>{" "}
                                        {report.comunicacao}
                                      </p>
                                      <p className="break-words word-wrap text-wrap hyphens-auto max-w-full">
                                        <strong>Potencial:</strong>{" "}
                                        {report.potencialDeCrescimento}
                                      </p>
                                      <p className="break-words word-wrap text-wrap hyphens-auto max-w-full">
                                        <strong>Pontos Fortes:</strong>{" "}
                                        {report.pontosFortes?.join(", ")}
                                      </p>
                                      <p className="break-words word-wrap text-wrap hyphens-auto max-w-full">
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
                                      <p className="font-medium text-slate-800 dark:text-white break-words word-wrap text-wrap hyphens-auto max-w-full">
                                        {answer.question}
                                      </p>
                                      <p className="text-slate-600 dark:text-slate-300 break-words word-wrap text-wrap hyphens-auto max-w-full">
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
                              <p className="whitespace-pre-wrap break-words word-wrap text-wrap hyphens-auto max-w-full">
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
                      {sessions.map((session) => (
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
                                <span
                                  className={`font-semibold ${getScoreColor(
                                    session.score
                                  )}`}
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
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleRowExpansion(session.id);
                                  }}
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
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleReEvaluateSession(session.id);
                                  }}
                                  className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm"
                                >
                                  <RefreshCw className="w-4 h-4 mr-1" />
                                  Reavaliar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>

                          {expandedRows.has(session.id) && (
                            <TableRow
                              key={`${session.id}-expanded`}
                              className="border-slate-200 dark:border-slate-700"
                            >
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
                                          <h4 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Relatório Completo
                                          </h4>
                                          <div className="grid md:grid-cols-2 gap-4">
                                            <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                                              <h5 className="font-medium text-slate-800 dark:text-white mb-2">
                                                Avaliação Geral
                                              </h5>
                                              <div className="space-y-2 text-sm">
                                                <p className="text-slate-600 dark:text-slate-300 break-words word-wrap text-wrap hyphens-auto max-w-full">
                                                  <strong>
                                                    Nível de Conhecimento:
                                                  </strong>{" "}
                                                  {report.nivelDeConhecimento}
                                                </p>
                                                <p className="text-slate-600 dark:text-slate-300 break-words word-wrap text-wrap hyphens-auto max-w-full">
                                                  <strong>Comunicação:</strong>{" "}
                                                  {report.comunicacao}
                                                </p>
                                                <p className="text-slate-600 dark:text-slate-300 break-words word-wrap text-wrap hyphens-auto max-w-full">
                                                  <strong>Potencial:</strong>{" "}
                                                  {report.potencialDeCrescimento}
                                                </p>
                                              </div>
                                            </div>

                                            <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                                              <h5 className="font-medium text-slate-800 dark:text-white mb-2">
                                                Pontos Fortes
                                              </h5>
                                              <div className="flex flex-wrap gap-1 max-w-full">
                                                {report.pontosFortes?.map(
                                                  (
                                                    ponto: string,
                                                    index: number
                                                  ) => (
                                                    <Badge
                                                      key={index}
                                                      className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs break-words word-wrap text-wrap hyphens-auto max-w-full"
                                                    >
                                                      {ponto}
                                                    </Badge>
                                                  )
                                                )}
                                              </div>

                                              <h5 className="font-medium text-slate-800 dark:text-white mb-2 mt-4">
                                                Pontos de Melhoria
                                              </h5>
                                              <div className="flex flex-wrap gap-1 max-w-full">
                                                {report.pontosDeMelhoria?.map(
                                                  (
                                                    ponto: string,
                                                    index: number
                                                  ) => (
                                                    <Badge
                                                      key={index}
                                                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs  break-words word-wrap text-wrap hyphens-auto max-w-full"
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
                                  {session.answers &&
                                    session.answers.length > 0 && (
                                      <div>
                                        <h4 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center">
                                          <User className="w-4 h-4 mr-2" />
                                          Respostas do Candidato
                                        </h4>
                                        <div className="space-y-4">
                                          {session.answers.map(
                                            (answer, index) => (
                                              <div
                                                key={index}
                                                className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600"
                                              >
                                                <h5 className="font-medium text-slate-800 dark:text-white mb-2 break-words word-wrap text-wrap hyphens-auto max-w-full">
                                                  <strong>
                                                    Pergunta {index + 1}:
                                                  </strong>{" "}
                                                  {answer.question}
                                                </h5>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm break-words word-wrap text-wrap hyphens-auto max-w-full">
                                                  <strong>Resposta:</strong>{" "}
                                                  {answer.response}
                                                </p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {/* Resumo */}
                                  {session.summary && (
                                    <div>
                                      <h4 className="font-semibold text-slate-800 dark:text-white mb-2 flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Resumo Para o Usuário
                                      </h4>
                                      <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                                        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words word-wrap text-wrap hyphens-auto max-w-full">
                                          {session.summary}
                                        </p>
                                      </div>
                                    </div>
                                  )}
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
                </>
              )}
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
      </main>
    </div>
  );
}
