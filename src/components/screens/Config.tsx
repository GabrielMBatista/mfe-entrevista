"use client";

import React, { useState, useEffect } from "react";
import { useGoogleFont } from "@/utils/fonts";
import {
  Settings,
  Plus,
  Edit3,
  Trash2,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "../Layout";
import {
  getInterviewTypes,
  getCategoriesByInterviewType,
  fetchAllQuestions,
  createCategory,
  createQuestion,
  updateQuestion,
} from "@/lib/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type InterviewType = {
  id: string;
  name: string;
  description: string;
};

type Category = {
  id: string;
  name: string;
  interviewTypeId: string;
};

type Question = {
  id: string;
  content: string;
  technologies: string[] | string;
  order: number;
  categoryId: string;
};

type NewQuestion = {
  content: string;
  technologies: string;
  difficulty: string;
};

export default function Config() {
  const fontFamily = useGoogleFont("Inter");
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([]);
  const [selectedInterviewType, setSelectedInterviewType] =
    useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form states
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    content: "",
    technologies: "",
    difficulty: "medium",
  });
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Effects
  useEffect(() => {
    const fetchInterviewTypes = async () => {
      try {
        const types = await getInterviewTypes();
        setInterviewTypes(types);
        setCategories([]);
      } catch (error) {
        console.error("Erro ao buscar tipos de entrevista:", error);
      }
    };

    fetchInterviewTypes();
  }, []);

  useEffect(() => {
    if (selectedInterviewType) {
      const fetchCategories = async () => {
        try {
          const newCategories = await getCategoriesByInterviewType(
            selectedInterviewType
          );
          setCategories(newCategories);
          setSelectedCategory("");
          setQuestions([]);
        } catch (error) {
          console.error("Erro ao buscar categorias:", error);
        }
      };

      fetchCategories();
    }
  }, [selectedInterviewType]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const allQuestions = await fetchAllQuestions();
        setAllQuestions(allQuestions);
      } catch (error) {
        console.error("Erro ao buscar perguntas:", error);
      }
    };

    fetchQuestions();
  }, []);

  // Handlers
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !selectedInterviewType) return;

    setIsLoading(true);
    try {
      const newCategory = await createCategory(
        selectedInterviewType,
        newCategoryName
      );
      setCategories((prev) => [...prev, newCategory]);
      setNewCategoryName("");
      setFeedback({
        type: "success",
        message: "Categoria criada com sucesso!",
      });
    } catch (error) {
      setFeedback({ type: "error", message: "Erro ao criar categoria" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    if (questions.some((q) => q.categoryId === categoryId)) {
      setFeedback({
        type: "error",
        message: "Não é possível remover categorias com perguntas vinculadas.",
      });
      return;
    }

    setIsLoading(true);
    try {
      setCategories((prev) =>
        prev.filter((category) => category.id !== categoryId)
      );
      setFeedback({
        type: "success",
        message: "Categoria removida com sucesso!",
      });
    } catch (error) {
      setFeedback({ type: "error", message: "Erro ao remover categoria" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.content.trim() || !selectedCategory) return;

    setIsLoading(true);
    try {
      const questionData = {
        text: newQuestion.content,
        technologies: newQuestion.technologies,
        order: questions.length + 1,
        categoryId: selectedCategory,
      };
      const createdQuestion = await createQuestion(questionData);
      setQuestions((prev) => [...prev, createdQuestion]);
      setNewQuestion({ content: "", technologies: "", difficulty: "medium" });
      setFeedback({ type: "success", message: "Pergunta criada com sucesso!" });
    } catch (error) {
      setFeedback({ type: "error", message: "Erro ao criar pergunta" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuestion = async (questionId: string) => {
    if (!editContent.trim()) return;

    setIsLoading(true);
    try {
      await updateQuestion({ id: questionId, content: editContent });
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, content: editContent } : q
        )
      );
      setEditingQuestion(null);
      setEditContent("");
      setFeedback({
        type: "success",
        message: "Pergunta atualizada com sucesso!",
      });
    } catch (error) {
      setFeedback({ type: "error", message: "Erro ao atualizar pergunta" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    setFeedback({ type: "success", message: "Pergunta removida localmente" });
  };

  const handleSaveQuestions = async () => {
    setIsLoading(true);
    try {
      setFeedback({
        type: "success",
        message: "Perguntas salvas com sucesso!",
      });
    } catch (error) {
      setFeedback({ type: "error", message: "Erro ao salvar perguntas" });
    } finally {
      setIsLoading(false);
    }
  };

  const addExistingQuestion = (questionId: string) => {
    const existingQuestion = allQuestions.find((q) => q.id === questionId);
    if (existingQuestion && !questions.find((q) => q.id === questionId)) {
      const newQuestion = { ...existingQuestion, categoryId: selectedCategory };
      setQuestions((prev) => [...prev, newQuestion]);
      setFeedback({
        type: "success",
        message: "Pergunta adicionada à categoria!",
      });
    }
  };

  return (
    <div
      style={{ fontFamily }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
    >
      <Layout title="Configurações">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="mb-8">
            <p className="text-slate-600 dark:text-slate-300">
              Administre tipos de entrevista, categorias e perguntas do sistema.
            </p>
          </div>

          {feedback && (
            <Alert
              className={`${
                feedback.type === "success"
                  ? "border-green-200 bg-green-50 dark:bg-green-900/20"
                  : "border-red-200 bg-red-50 dark:bg-red-900/20"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <AlertDescription
                className={`${
                  feedback.type === "success"
                    ? "text-green-800 dark:text-green-200"
                    : "text-red-800 dark:text-red-200"
                }`}
              >
                {feedback.message}
              </AlertDescription>
            </Alert>
          )}

          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-white">
                Gerenciar Configurações
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Selecione um tipo de entrevista para gerenciar suas categorias e
                perguntas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={selectedInterviewType}
                onValueChange={setSelectedInterviewType}
              >
                <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-700">
                  {interviewTypes.map((type: InterviewType) => (
                    <TabsTrigger
                      key={type.id}
                      value={type.id}
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600"
                    >
                      {type.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {interviewTypes.map((type: InterviewType) => (
                  <TabsContent
                    key={type.id}
                    value={type.id}
                    className="mt-6 space-y-6"
                  >
                    {/* Create Category */}
                    <Card className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-800 dark:text-white">
                          Criar Nova Categoria
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-4">
                          <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nome da categoria"
                            className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          />
                          <Button
                            onClick={handleCreateCategory}
                            disabled={!newCategoryName.trim() || isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Categories List */}
                    {categories.length > 0 && (
                      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-lg text-slate-800 dark:text-white">
                            Categorias Disponíveis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4">
                            {categories.map((category) => (
                              <div
                                key={category.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                  selectedCategory === category.id
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                    : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                                }`}
                                onClick={() => setSelectedCategory(category.id)}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-medium text-slate-800 dark:text-white">
                                      {category.name}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                      {
                                        questions.filter(
                                          (q) => q.categoryId === category.id
                                        ).length
                                      }{" "}
                                      perguntas
                                    </p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveCategory(category.id);
                                    }}
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

                    {/* Questions Management */}
                    {selectedCategory && (
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
                              <Label className="text-slate-700 dark:text-slate-300">
                                Conteúdo da Pergunta
                              </Label>
                              <Textarea
                                value={newQuestion.content}
                                onChange={(e) =>
                                  setNewQuestion((prev) => ({
                                    ...prev,
                                    content: e.target.value,
                                  }))
                                }
                                placeholder="Digite a pergunta..."
                                className="mt-1 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-700 dark:text-slate-300">
                                Tecnologias (separadas por vírgula)
                              </Label>
                              <Input
                                value={newQuestion.technologies}
                                onChange={(e) =>
                                  setNewQuestion((prev) => ({
                                    ...prev,
                                    technologies: e.target.value,
                                  }))
                                }
                                placeholder="React, TypeScript, Node.js"
                                className="mt-1 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                              />
                            </div>
                            <div>
                              <Label className="text-slate-700 dark:text-slate-300">
                                Dificuldade
                              </Label>
                              <Select
                                value={newQuestion.difficulty}
                                onValueChange={(value) =>
                                  setNewQuestion((prev) => ({
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
                              disabled={
                                !newQuestion.content.trim() || isLoading
                              }
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
                                  (q) =>
                                    !questions.find(
                                      (existing) => existing.id === q.id
                                    )
                                )
                                .map((question) => (
                                  <div
                                    key={question.id}
                                    className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-600 rounded-lg"
                                  >
                                    <div className="flex-1">
                                      <p className="text-slate-800 dark:text-white">
                                        {question.content}
                                      </p>
                                      <div className="flex gap-1 mt-2">
                                        {Array.isArray(
                                          question.technologies
                                        ) ? (
                                          question.technologies.map(
                                            (tech, index) => (
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
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {question.technologies}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        addExistingQuestion(question.id)
                                      }
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
                                {questions.map((question) => (
                                  <div
                                    key={question.id}
                                    className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg"
                                  >
                                    {editingQuestion === question.id ? (
                                      <div className="space-y-3">
                                        <Textarea
                                          value={editContent}
                                          onChange={(e) =>
                                            setEditContent(e.target.value)
                                          }
                                          className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              handleUpdateQuestion(question.id)
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
                                              {Array.isArray(
                                                question.technologies
                                              ) ? (
                                                question.technologies.map(
                                                  (tech, index) => (
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
                                                <Badge
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
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
                                                setEditContent(
                                                  question.content
                                                );
                                              }}
                                              className="border-slate-300 dark:border-slate-600"
                                            >
                                              <Edit3 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() =>
                                                handleRemoveQuestion(
                                                  question.id
                                                )
                                              }
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
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </div>
  );
}
