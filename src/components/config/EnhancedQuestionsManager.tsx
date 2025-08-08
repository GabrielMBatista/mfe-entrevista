"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  GripVertical,
  Code,
  Brain,
  Save,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Pagination as UIPagination } from "@/components/ui/pagination";
import type { Question } from "@/types/types";

interface EnhancedQuestionsManagerProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  selectedCategory: string;
  handleSaveQuestions: () => void;
  handleRemoveQuestionFromCategory: (id: string) => void;
  isLoading: boolean;
  onAddQuestionToCategory?: (id: string) => void;
}

export default function EnhancedQuestionsManager({
  questions,
  setQuestions,
  selectedCategory,
  handleSaveQuestions,
  handleRemoveQuestionFromCategory,
  isLoading,
  onAddQuestionToCategory,
}: EnhancedQuestionsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const openQuestionModal = (question?: Question | null) => {
    const evt = new CustomEvent("openQuestionModal", {
      detail: { question: question || null },
    });
    window.dispatchEvent(evt as any);
  };

  // Ajuste do filtro: esconde itens já vinculados à categoria selecionada
  const baseFiltered = questions.filter((question) => {
    const content = question.content || question.text || "";
    const technologies = question.technologies || "";
    const matchesSearch =
      content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technologies.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "all" || question.difficulty === difficultyFilter;
    const matchesStatus =
      statusFilter === "all" || question.status === statusFilter;

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const hiddenCount = baseFiltered.filter(
    (q) => q.categoryId === selectedCategory
  ).length;

  const filteredQuestions = baseFiltered.filter(
    (q) => q.categoryId !== selectedCategory
  );

  // Stats globais (não paginados)
  const stats = {
    total: questions.length,
    easy: questions.filter((q) => q.difficulty === "easy").length,
    medium: questions.filter((q) => q.difficulty === "medium").length,
    hard: questions.filter((q) => q.difficulty === "hard").length,
    active: questions.filter((q) => q.status === "active").length,
    draft: questions.filter((q) => q.status === "draft").length,
  };

  // Quantas das filtradas já estão na categoria
  const inCategoryFilteredCount = filteredQuestions.filter(
    (q) => q.categoryId === selectedCategory
  ).length;

  // Derivados da paginação
  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuestions.length / itemsPerPage)
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Resetar página ao mudar filtros/categoria
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, difficultyFilter, statusFilter, selectedCategory]);

  const handleEditQuestion = (question: Question) => {
    openQuestionModal(question);
  };

  const handleDeleteQuestion = (questionId: string) => {
    handleRemoveQuestionFromCategory(questionId);
  };

  const handleDragStart = (e: React.DragEvent, questionId: string) => {
    setDraggedItem(questionId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", questionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = questions.findIndex((q) => q.id === draggedItem);
    const targetIndex = questions.findIndex((q) => q.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newQuestions = [...questions];
    const [draggedQuestion] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, draggedQuestion);

    setQuestions(newQuestions);
    setDraggedItem(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "draft":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (!selectedCategory) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <div className="mb-4">
              <div className="h-16 w-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Code className="h-8 w-8" />
              </div>
            </div>
            <h3 className="font-medium mb-2">Selecione uma Categoria</h3>
            <p className="text-sm">
              Escolha uma categoria para gerenciar suas perguntas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Gerenciador de Perguntas
              <Badge variant="secondary">{filteredQuestions.length}</Badge>
            </CardTitle>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {questions.length > 0 && (
                <Button
                  onClick={handleSaveQuestions}
                  disabled={isLoading}
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              )}
              <Button
                onClick={() => openQuestionModal(null)}
                size="sm"
                className="gap-2 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Nova Pergunta
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
            <div className="relative w-full sm:col-span-2 lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar perguntas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Todas as dificuldades</option>
                <option value="easy">Fácil</option>
                <option value="medium">Médio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="draft">Rascunho</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>

          {/* Aviso/Resumo de vinculação dentro do gerenciador */}
          <div className="mt-3 text-xs sm:text-sm flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <AlertCircle className="h-4 w-4" />
            <span>
              {inCategoryFilteredCount} de {filteredQuestions.length}{" "}
              {filteredQuestions.length === 1 ? "resultado" : "resultados"}{" "}
              {inCategoryFilteredCount === 1 ? "está" : "estão"} na categoria
              selecionada. Itens vinculados exibem a etiqueta “Na categoria
              selecionada”.
            </span>
          </div>

          {/* Aviso sobre itens ocultados */}
          {hiddenCount > 0 && (
            <div className="mt-3 text-xs sm:text-sm flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <AlertCircle className="h-4 w-4" />
              <span>
                {hiddenCount} {hiddenCount === 1 ? "pergunta" : "perguntas"} já
                vinculada
                {hiddenCount === 1 ? "" : "s"} à categoria selecionada{" "}
                {hiddenCount === 1 ? "foi" : "foram"} ocultada
                {hiddenCount === 1 ? "" : "s"} desta lista.
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* Renderiza apenas a página atual */}
            {paginatedQuestions.map((question) => {
              const inSelectedCategory =
                !!selectedCategory && question.categoryId === selectedCategory;

              return (
                <div
                  key={question.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, question.id)}
                  onDragOver={(e) => e.preventDefault()}
                  className={`group relative bg-white dark:bg-gray-800 border rounded-lg p-3 md:p-4 transition-all duration-200 hover:shadow-md ${
                    draggedItem === question.id ? "opacity-50" : ""
                  }`}
                >
                  {/* Layout responsivo: mobile em coluna, desktop em linha */}
                  <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                    {/* Header mobile: grip + ações */}
                    <div className="flex items-start justify-between md:hidden">
                      <div className="flex items-center gap-2">
                        <span className="cursor-grab active:cursor-grabbing text-gray-400">
                          <GripVertical className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEditQuestion(question)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-300 hover:text-white"
                          title="Editar"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        {inSelectedCategory ? (
                          <Button
                            onClick={() => handleDeleteQuestion(question.id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-300 hover:text-red-500 hover:bg-red-100/10"
                            title="Remover da categoria"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() =>
                              onAddQuestionToCategory?.(question.id)
                            }
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-emerald-300 hover:text-emerald-500 hover:bg-emerald-100/10"
                            title="Adicionar à categoria"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Grip desktop */}
                    <div className="hidden md:block flex-shrink-0 cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-white mb-2 leading-relaxed text-sm md:text-base">
                        {question.content || question.text}
                      </p>

                      {question.technologies && (
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <strong>Tecnologias:</strong> {question.technologies}
                        </p>
                      )}

                      {/* Badges: rolagem horizontal no mobile para não quebrar */}
                      <div className="flex items-center gap-2 flex-wrap md:flex-nowrap overflow-x-auto md:overflow-visible">
                        <Badge
                          className={getDifficultyColor(question.difficulty)}
                        >
                          {question.difficulty === "easy"
                            ? "Fácil"
                            : question.difficulty === "medium"
                              ? "Médio"
                              : "Difícil"}
                        </Badge>

                        <Badge
                          className={getStatusColor(
                            question.status || "active"
                          )}
                        >
                          {question.status === "active"
                            ? "Ativo"
                            : question.status === "draft"
                              ? "Rascunho"
                              : "Arquivado"}
                        </Badge>

                        {inSelectedCategory && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Na categoria selecionada
                          </Badge>
                        )}

                        {question.lastModified && (
                          <span className="text-[10px] md:text-xs text-gray-500 whitespace-nowrap">
                            Modificado:{" "}
                            {new Date(
                              question.lastModified
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações desktop */}
                    <div className="hidden md:flex flex-shrink-0 items-start gap-2">
                      <Button
                        onClick={() => handleEditQuestion(question)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      {inSelectedCategory ? (
                        <Button
                          onClick={() => handleDeleteQuestion(question.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950"
                          title="Remover da categoria"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => onAddQuestionToCategory?.(question.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-950"
                          title="Adicionar à categoria"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginação */}
          {filteredQuestions.length > 0 && totalPages > 1 && (
            <div className="pt-2">
              <UIPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              />
            </div>
          )}

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ||
              difficultyFilter !== "all" ||
              statusFilter !== "all" ? (
                <>
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">
                    Nenhuma pergunta encontrada
                  </h3>
                  <p className="text-sm mb-4">
                    Tente ajustar os filtros ou criar uma nova pergunta
                  </p>
                </>
              ) : (
                <>
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">Nenhuma pergunta ainda</h3>
                  <p className="text-sm mb-4">
                    Comece criando sua primeira pergunta para esta categoria
                  </p>
                </>
              )}
              <Button onClick={() => openQuestionModal(null)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeira Pergunta
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Button
          onClick={handleSaveQuestions}
          disabled={isLoading}
          className="sm:hidden fixed bottom-4 right-4 rounded-full h-12 w-12 p-0 shadow-lg z-50"
          aria-label={isLoading ? "Salvando..." : "Salvar alterações"}
          size="icon"
        >
          <Save className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
