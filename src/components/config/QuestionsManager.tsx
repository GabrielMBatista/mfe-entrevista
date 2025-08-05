import React, { useState } from "react";
import { QuestionsManagerProps } from "@/types/types"; // Importado de types.ts
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, Loader2, Trash2, Edit3 } from "lucide-react";
import { Question } from "@/types/types";

export function QuestionsManager({
  questions,
  allQuestions,
  newQuestion,
  setNewQuestion,
  editingQuestion,
  setEditingQuestion,
  editContent,
  setEditContent,
  handleCreateQuestion,
  handleUpdateQuestion,
  addExistingQuestion,
  handleRemoveQuestionFromCategory,
  isLoading,
  pagination,
}: QuestionsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTechnologies, setEditTechnologies] = useState("");

  // Removido o uso de slice, pois os dados já vêm paginados do backend
  const paginatedQuestions = allQuestions;

  return (
    <div className="space-y-6">
      {/* Button to open modal */}
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        Criar Nova Pergunta
      </Button>

      {/* Modal for creating a new question */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Criar Nova Pergunta
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-slate-700 dark:text-slate-300">
                  Conteúdo da Pergunta
                </label>
                <Textarea
                  value={newQuestion.content}
                  onChange={(e) =>
                    setNewQuestion((prev: any) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Digite a pergunta..."
                  className="mt-1 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-slate-700 dark:text-slate-300">
                  Tecnologias (separadas por vírgula)
                </label>
                <Input
                  value={newQuestion.technologies}
                  onChange={(e) =>
                    setNewQuestion((prev: any) => ({
                      ...prev,
                      technologies: e.target.value,
                    }))
                  }
                  placeholder="React, TypeScript, Node.js"
                  className="mt-1 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-slate-700 dark:text-slate-300">
                  Dificuldade
                </label>
                <Select
                  value={newQuestion.difficulty}
                  onValueChange={(value) =>
                    setNewQuestion((prev: any) => ({
                      ...prev,
                      difficulty: value,
                    }))
                  }
                >
                  <SelectTrigger className="mt-1 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="border-slate-300 dark:border-slate-600"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    handleCreateQuestion();
                    setIsModalOpen(false);
                  }}
                  disabled={!newQuestion.content.trim() || isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Criar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Existing Question */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 dark:text-white">
            Adicionar Pergunta Existente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pagination && (
            <Input
              value={pagination.search}
              onChange={(e) => pagination.setSearch(e.target.value)}
              placeholder="Buscar perguntas..."
              className="mb-4 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            />
          )}
          <div className="space-y-3">
            {paginatedQuestions.map((question: Question) => (
              <div
                key={question.id}
                className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg"
              >
                {editingQuestion === question.id ? (
                  <div className="flex-1 space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Conteúdo da pergunta"
                      className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                    <Input
                      value={editTechnologies}
                      onChange={(e) => setEditTechnologies(e.target.value)}
                      placeholder="Tecnologias (separadas por vírgula)"
                      className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleUpdateQuestion(
                            question.id,
                            editContent,
                            editTechnologies
                          )
                        }
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingQuestion(null);
                          setEditContent("");
                          setEditTechnologies("");
                        }}
                        className="border-slate-300 dark:border-slate-600"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="text-slate-800 dark:text-white">
                      {question.content}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {question.technologies
                        .split(",")
                        .map((tech: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tech.trim()}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingQuestion(question.id);
                      setEditContent(question.content);
                      setEditTechnologies(question.technologies);
                    }}
                    className="border-slate-300 dark:border-slate-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addExistingQuestion(question.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          {pagination && (
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() =>
                  pagination.setPage(Math.max(pagination.page - 1, 1))
                }
                disabled={pagination.page === 1}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Anterior
              </Button>
              <span className="text-slate-600 dark:text-slate-300">
                Página {pagination.page} de{" "}
                {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <Button
                onClick={() =>
                  pagination.setPage(
                    Math.min(
                      pagination.page + 1,
                      Math.ceil(pagination.total / pagination.limit)
                    )
                  )
                }
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.limit)
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions List */}
      {questions.length > 0 && (
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 dark:text-white">
              Perguntas da Categoria ({questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((question: Question) => (
                <div
                  key={question.id}
                  className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-slate-800 dark:text-white mb-2">
                        {question.content}
                      </p>
                      <div className="flex gap-1">
                        {question.technologies
                          .split(",")
                          .map((tech: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tech.trim()}
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleRemoveQuestionFromCategory(question.id)
                      }
                      className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
