"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Search,
  FolderOpen,
  Folder,
  AlertCircle,
  Save,
  Edit2,
} from "lucide-react";
import EnhancedQuestionsManager from "@/components/config/EnhancedQuestionsManager";
import type { Category } from "@/types/types";

interface CategoriesManagerProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  handleCreateCategory: () => void;
  handleRemoveCategory: (categoryId: string) => void;
  questions: any[];
  isLoading: boolean;
  onAddQuestionToCategory: (questionId: string) => void;
  onRemoveQuestionFromCategory: (questionId: string) => void;
  setCategoryQuestions: (updatedCategoryQuestions: any[]) => void;
  setQuestions: (questions: any[]) => void;
  handleSaveQuestions: () => void;
}

export default function CategoriesManager({
  categories,
  setCategories,
  selectedCategory,
  setSelectedCategory,
  newCategoryName,
  setNewCategoryName,
  handleCreateCategory,
  handleRemoveCategory,
  questions,
  isLoading,
  onAddQuestionToCategory,
  onRemoveQuestionFromCategory,
  setCategoryQuestions,
  setQuestions,
  handleSaveQuestions,
}: CategoriesManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [draggedCategoryItem, setDraggedCategoryItem] = useState<string | null>(
    null
  );

  // Abre modal de edição de pergunta via evento global (reuso do modal existente)
  const openQuestionModal = (question: any) => {
    const evt = new CustomEvent("openQuestionModal", {
      detail: { question },
    });
    window.dispatchEvent(evt as any);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClick = () => {
    if (newCategoryName.trim()) {
      handleCreateCategory();
      setIsCreating(false);
      setNewCategoryName("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateClick();
    }
    if (e.key === "Escape") {
      setIsCreating(false);
      setNewCategoryName("");
    }
  };

  const categoryQuestions = selectedCategory
    ? questions.filter((q) => q.categoryId === selectedCategory)
    : [];

  const handleCategoryDragStart = (e: React.DragEvent, questionId: string) => {
    setDraggedCategoryItem(questionId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", questionId);
  };

  const reorderCategoryQuestions = (dragId: string, targetId: string) => {
    if (!selectedCategory || dragId === targetId) return;
    const current = categoryQuestions;
    const draggedIndex = current.findIndex((q: any) => q.id === dragId);
    const targetIndex = current.findIndex((q: any) => q.id === targetId);
    if (draggedIndex < 0 || targetIndex < 0) return;
    const newList = [...current];
    const [dragged] = newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, dragged);
    setCategoryQuestions(newList);
  };

  const handleCategoryDropOnItem = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation(); // evita que o container também processe o drop
    const incomingId = e.dataTransfer.getData("text/plain");
    if (!incomingId) return;
    if (!categoryQuestions.some((q: any) => q.id === incomingId)) {
      onAddQuestionToCategory(incomingId);
      return;
    }
    reorderCategoryQuestions(incomingId, targetId);
    setDraggedCategoryItem(null);
  };

  const handleCategoryContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // segurança extra
    const incomingId = e.dataTransfer.getData("text/plain");
    if (!incomingId) return;
    if (!categoryQuestions.some((q: any) => q.id === incomingId)) {
      onAddQuestionToCategory(incomingId);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Categories Panel */}
      <div className="lg:col-span-1">
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Folder className="h-5 w-5 text-blue-600" />
                Categorias
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {categories.length}
              </Badge>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Create Category */}
            {!isCreating ? (
              <Button
                onClick={() => setIsCreating(true)}
                variant="outline"
                className="w-full justify-start gap-2 border-dashed border-2 border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nova Categoria
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Nome da categoria..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  autoFocus
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateClick}
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!newCategoryName.trim() || isLoading}
                  >
                    Criar
                  </Button>
                  <Button
                    onClick={() => {
                      setIsCreating(false);
                      setNewCategoryName("");
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Categories List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className={`group relative p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedCategory === category.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {selectedCategory === category.id ? (
                        <FolderOpen className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      ) : (
                        <Folder className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm truncate">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {category.questionCount || 0}
                      </Badge>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCategory(category.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCategories.length === 0 && searchTerm && (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma categoria encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Questions Panel */}
      <div className="lg:col-span-3">
        {selectedCategory ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">
                    Categoria Selecionada
                    {(() => {
                      const sel = categories.find(
                        (c) => c.id === selectedCategory
                      );
                      return sel ? ` (${sel.name})` : "";
                    })()}{" "}
                    [{categoryQuestions.length}]
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed rounded-lg p-4 md:p-6 bg-white dark:bg-slate-800"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={handleCategoryContainerDrop}
                >
                  {categoryQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {categoryQuestions.map((q: any) => (
                        <div
                          key={q.id}
                          draggable
                          onDragStart={(e) => handleCategoryDragStart(e, q.id)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => handleCategoryDropOnItem(e, q.id)}
                          className={`group relative bg-white dark:bg-gray-800 border rounded-lg p-3 md:p-4 transition-all hover:shadow-sm ${
                            draggedCategoryItem === q.id ? "opacity-50" : ""
                          }`}
                        >
                          {/* Layout responsivo: mobile em coluna, desktop em linha */}
                          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                            {/* Header mobile: grip + ações */}
                            <div className="flex items-start justify-between md:hidden">
                              <div className="flex items-center gap-2">
                                <span className="cursor-grab active:cursor-grabbing text-gray-400">
                                  {/* grip svg */}
                                  <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <circle cx="5" cy="6" r="1" />
                                    <circle cx="10" cy="6" r="1" />
                                    <circle cx="15" cy="6" r="1" />
                                    <circle cx="5" cy="10" r="1" />
                                    <circle cx="10" cy="10" r="1" />
                                    <circle cx="15" cy="10" r="1" />
                                    <circle cx="5" cy="14" r="1" />
                                    <circle cx="10" cy="14" r="1" />
                                    <circle cx="15" cy="14" r="1" />
                                  </svg>
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => openQuestionModal(q)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-slate-300 hover:text-white"
                                  title="Editar"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  onClick={() =>
                                    onRemoveQuestionFromCategory(q.id)
                                  }
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-300 hover:text-red-500 hover:bg-red-100/10"
                                  title="Remover da categoria"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Grip desktop */}
                            <div className="hidden md:block flex-shrink-0 cursor-grab active:cursor-grabbing">
                              <svg
                                className="h-5 w-5 text-gray-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <circle cx="5" cy="6" r="1" />
                                <circle cx="10" cy="6" r="1" />
                                <circle cx="15" cy="6" r="1" />
                                <circle cx="5" cy="10" r="1" />
                                <circle cx="10" cy="10" r="1" />
                                <circle cx="15" cy="10" r="1" />
                                <circle cx="5" cy="14" r="1" />
                                <circle cx="10" cy="14" r="1" />
                                <circle cx="15" cy="14" r="1" />
                              </svg>
                            </div>

                            {/* Conteúdo */}
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 dark:text-white mb-2 leading-relaxed text-sm md:text-base">
                                {q.content || q.text}
                              </p>
                              {q.technologies && (
                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                  <strong>Tecnologias:</strong> {q.technologies}
                                </p>
                              )}
                            </div>

                            {/* Ações desktop */}
                            <div className="hidden md:flex flex-shrink-0 items-start gap-2">
                              <Button
                                onClick={() => openQuestionModal(q)}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                title="Editar"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() =>
                                  onRemoveQuestionFromCategory(q.id)
                                }
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950"
                                title="Remover da categoria"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-8">
                      Arraste perguntas do Gerenciador para cá ou use o botão
                      “+” em cada item.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gerenciador de Perguntas na mesma coluna, logo abaixo */}
            <div className="mt-6">
              <EnhancedQuestionsManager
                questions={questions}
                setQuestions={setQuestions}
                selectedCategory={selectedCategory || ""}
                handleSaveQuestions={handleSaveQuestions}
                handleRemoveQuestionFromCategory={onRemoveQuestionFromCategory}
                isLoading={isLoading}
                onAddQuestionToCategory={onAddQuestionToCategory}
              />
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <div className="mb-4">
                  <div className="h-16 w-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Folder className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="font-medium mb-2">Selecione uma Categoria</h3>
                <p className="text-sm">
                  Escolha ou crie uma categoria para começar a gerenciar
                  perguntas
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export { CategoriesManager };
