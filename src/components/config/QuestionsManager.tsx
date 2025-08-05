import React from "react";
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
import { Question, NewQuestion } from "@/types/types";

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
  handleRemoveQuestion,
  handleSaveQuestions,
  addExistingQuestion,
  isLoading,
}: any) {
  return (
    <div className="space-y-6">
      {/* Create Question */}
      <Card className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 dark:text-white">
            Criar Nova Pergunta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <SelectTrigger className="mt-1 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleCreateQuestion}
            disabled={!newQuestion.content.trim() || isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Criar Pergunta
          </Button>
        </CardContent>
      </Card>

      {/* Add Existing Question */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 dark:text-white">
            Adicionar Pergunta Existente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allQuestions
              .filter(
                (q: any) =>
                  !questions.find((existing: any) => existing.id === q.id)
              )
              .map((question: any) => (
                <div
                  key={question.id}
                  className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-slate-800 dark:text-white">
                      {question.content}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {Array.isArray(question.technologies) ? (
                        question.technologies.map(
                          (tech: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tech}
                            </Badge>
                          )
                        )
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {question.technologies}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addExistingQuestion(question.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
          </div>
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
              {questions.map((question: any) => (
                <div
                  key={question.id}
                  className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg"
                >
                  {editingQuestion === question.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateQuestion(question.id)}
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
                          }}
                          className="border-slate-300 dark:border-slate-600"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-slate-800 dark:text-white mb-2">
                            {question.content}
                          </p>
                          <div className="flex gap-1">
                            {Array.isArray(question.technologies) ? (
                              question.technologies.map(
                                (tech: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tech}
                                  </Badge>
                                )
                              )
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {question.technologies}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingQuestion(question.id);
                              setEditContent(question.content);
                            }}
                            className="border-slate-300 dark:border-slate-600"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveQuestion(question.id)}
                            className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={handleSaveQuestions}
              disabled={isLoading || questions.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Perguntas
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
