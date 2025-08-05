"use client";

import React, { useState, useEffect } from "react";
import { useGoogleFont } from "@/utils/fonts";
import { CheckCircle, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import Header from "@/components/ui/Header";
import {
  getInterviewTypes,
  getCategoriesByInterviewType,
  fetchAllQuestions,
  createCategory,
  createQuestion,
  updateQuestion,
  saveQuestions,
  removeQuestionFromCategory,
  deleteCategory,
} from "@/lib/api";
import { QuestionsManager } from "@/components/config/QuestionsManager";
import { CategoriesManager } from "@/components/config/CategoriesManager";
import { InterviewType, Category, Question, NewQuestion } from "@/types/types";

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

  const [categoriesPagination, setCategoriesPagination] = useState({
    page: 1,
    limit: 2,
    total: 0,
    search: "",
  });
  const [questionsPagination, setQuestionsPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    search: "",
  });

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
          const { data, total, page, limit } =
            await getCategoriesByInterviewType(
              selectedInterviewType,
              categoriesPagination.page,
              categoriesPagination.limit,
              categoriesPagination.search
            );
          setCategories(data);
          setCategoriesPagination((prev) => ({ ...prev, total, page, limit }));
          setSelectedCategory("");
          setQuestions([]);
        } catch (error) {
          console.error("Erro ao buscar categorias:", error);
        }
      };

      fetchCategories();
    }
  }, [
    selectedInterviewType,
    categoriesPagination.page,
    categoriesPagination.search,
  ]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, total, page, limit } = await fetchAllQuestions(
          questionsPagination.page,
          questionsPagination.limit,
          questionsPagination.search
        );
        setAllQuestions(data);
        setQuestionsPagination((prev) => ({ ...prev, total, page, limit }));
      } catch (error) {
        console.error("Erro ao buscar perguntas:", error);
      }
    };

    fetchQuestions();
  }, [questionsPagination.page, questionsPagination.search]);

  useEffect(() => {
    if (selectedCategory) {
      const fetchCategoryQuestions = async () => {
        try {
          const category = categories.find(
            (cat) => cat.id === selectedCategory
          );
          if (category && category.questionIds) {
            const categoryQuestions = allQuestions.filter((q) =>
              category.questionIds.includes(q.id)
            );
            setQuestions(categoryQuestions);
          }
        } catch (error) {
          console.error("Erro ao buscar perguntas da categoria:", error);
        }
      };

      fetchCategoryQuestions();
    }
  }, [selectedCategory, categories, allQuestions]);

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
    setIsLoading(true);
    try {
      await deleteCategory(categoryId);
      setCategories((prev) =>
        prev.filter((category) => category.id !== categoryId)
      );
      setFeedback({
        type: "success",
        message: "Categoria deletada com sucesso!",
      });
    } catch (error) {
      setFeedback({ type: "error", message: "Erro ao deletar categoria." });
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
    if (!selectedCategory) return;

    setIsLoading(true);
    try {
      await saveQuestions(selectedCategory, questions);
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

  const handleAddQuestionToCategory = (questionId: string) => {
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

  const handleRemoveQuestionFromCategory = async (questionId: string) => {
    setIsLoading(true);
    try {
      await removeQuestionFromCategory(selectedCategory, questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setFeedback({
        type: "success",
        message: "Vínculo da pergunta removido com sucesso!",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Erro ao remover vínculo da pergunta.",
      });
    } finally {
      setIsLoading(false);
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
                    {/* Categories Management */}
                    <CategoriesManager
                      categories={categories}
                      setCategories={setCategories}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      newCategoryName={newCategoryName}
                      setNewCategoryName={setNewCategoryName}
                      handleCreateCategory={handleCreateCategory}
                      handleRemoveCategory={handleRemoveCategory}
                      questions={questions}
                      isLoading={isLoading}
                      // pagination={{
                      //   ...categoriesPagination,
                      //   setPage: (page) =>
                      //     setCategoriesPagination((prev) => ({
                      //       ...prev,
                      //       page: Number(page),
                      //     })),
                      //   setSearch: (search) =>
                      //     setCategoriesPagination((prev) => ({
                      //       ...prev,
                      //       search: String(search),
                      //     })),
                      // }}
                    />

                    {/* Questions Management */}
                    {selectedCategory && (
                      <QuestionsManager
                        questions={questions}
                        setQuestions={setQuestions}
                        allQuestions={allQuestions}
                        selectedCategory={selectedCategory}
                        newQuestion={newQuestion}
                        setNewQuestion={setNewQuestion}
                        editingQuestion={editingQuestion}
                        setEditingQuestion={setEditingQuestion}
                        editContent={editContent}
                        setEditContent={setEditContent}
                        handleCreateQuestion={handleCreateQuestion}
                        handleUpdateQuestion={handleUpdateQuestion}
                        handleRemoveQuestion={handleRemoveQuestion}
                        handleSaveQuestions={handleSaveQuestions}
                        addExistingQuestion={handleAddQuestionToCategory}
                        handleRemoveQuestionFromCategory={
                          handleRemoveQuestionFromCategory
                        } // Corrigido aqui
                        isLoading={isLoading}
                        pagination={{
                          ...questionsPagination,
                          setPage: (page) =>
                            setQuestionsPagination((prev) => ({
                              ...prev,
                              page: Number(page),
                            })),
                          setSearch: (search) =>
                            setQuestionsPagination((prev) => ({
                              ...prev,
                              search: String(search),
                            })),
                        }}
                      />
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
