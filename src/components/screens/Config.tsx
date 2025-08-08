"use client";

import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionModal from "@/components/config/QuestionModal";
import CategoriesManager from "@/components/config/CategoriesManager";
import { Settings, Users, Code } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "../ui/Header";
import { useGoogleFont } from "@/utils/fonts";
import {
  getInterviewTypes,
  getCategoriesByInterviewType,
  createCategory as apiCreateCategory,
  deleteCategory as apiDeleteCategory,
  addQuestionToCategory as apiAddQuestionToCategory,
  removeQuestionFromCategory as apiRemoveQuestionFromCategory,
  saveQuestions as apiSaveQuestions,
  createQuestion as apiCreateQuestion,
  updateQuestion as apiUpdateQuestion,
  fetchAllQuestions,
  getQuestionsByCategory, // ADICIONE
} from "@/lib/api";
import type {
  InterviewType as BaseInterviewType,
  Category,
  Question,
} from "@/types/types";

type UIInterviewType = BaseInterviewType & {
  icon: React.ReactNode;
  color: string;
  categoryCount: number;
};

const addAlert = (
  type: "success" | "error" | "info" | "warning",
  message: string
) => {
  const opts = {
    position: "top-right" as const,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored" as const,
  };
  if (type === "success") return toast.success(message, opts);
  if (type === "error") return toast.error(message, opts);
  if (type === "warning") return toast.warning(message, opts);
  return toast.info(message, opts);
};

export default function InterviewManagement() {
  const fontFamily = useGoogleFont("Inter");
  const [interviewTypes, setInterviewTypes] = useState<UIInterviewType[]>([]);
  const [selectedInterviewType, setSelectedInterviewType] =
    useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setIsLoading(true);
        const types = await getInterviewTypes();
        const mapped = types.map((t) => {
          const name = (t.name || "").toLowerCase();
          const icon = name.includes("front") ? (
            <Code className="h-4 w-4" />
          ) : name.includes("back") ? (
            <Settings className="h-4 w-4" />
          ) : (
            <Users className="h-4 w-4" />
          );
          const color = name.includes("front")
            ? "blue"
            : name.includes("back")
              ? "green"
              : "purple";
          return {
            ...t,
            icon,
            color,
            categoryCount: 0,
          } as UIInterviewType;
        });
        setInterviewTypes(mapped);
        if (!selectedInterviewType && mapped[0]) {
          setSelectedInterviewType(mapped[0].id);
        }
      } catch (e) {
        addAlert("error", "Erro ao carregar tipos de entrevista.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedInterviewType) return;
      try {
        setIsLoading(true);
        const { data, total } = await getCategoriesByInterviewType(
          selectedInterviewType,
          1,
          50,
          ""
        );
        setCategories(data);
        setSelectedCategory(null);
        setInterviewTypes((prev) =>
          prev.map((t) =>
            t.id === selectedInterviewType ? { ...t, categoryCount: total } : t
          )
        );
      } catch (e) {
        addAlert("error", "Erro ao carregar categorias.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, [selectedInterviewType]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedCategory) {
        setQuestions([]);
        return;
      }
      try {
        setIsLoading(true);

        // Busca TODAS as perguntas (para poder adicionar/remover da categoria)
        const { data: all } = await fetchAllQuestions(1, 200, "");

        // Busca as perguntas já VINCULADAS à categoria selecionada
        const { data: inCat } = await getQuestionsByCategory(
          selectedCategory,
          1,
          200,
          ""
        );
        const inCatIds = new Set(inCat.map((q: any) => q.id));

        // Normaliza todas e marca membership na categoria atual
        const normalizedAll = all.map((q: any) => ({
          id: q.id,
          text: q.text ?? q.content ?? "",
          content: q.content ?? q.text ?? "",
          technologies: q.technologies ?? "",
          difficulty: q.difficulty ?? "medium",
          status: q.status,
          // força o vínculo conforme a API da categoria selecionada
          categoryId: inCatIds.has(q.id) ? selectedCategory : q.categoryId,
          createdAt: q.createdAt ?? new Date().toISOString(),
          lastModified: q.lastModified,
          updatedAt: q.updatedAt ?? q.lastModified ?? new Date().toISOString(),
        })) as Question[];

        setQuestions(normalizedAll);

        // Garante que o contador da categoria selecionada reflita a API
        setCategories((prev) =>
          prev.map((c) =>
            c.id === selectedCategory
              ? { ...c, questionCount: inCat.length }
              : c
          )
        );
      } catch (e) {
        addAlert("error", "Erro ao carregar perguntas.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [selectedCategory]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !selectedInterviewType) return;
    try {
      setIsLoading(true);
      const created = await apiCreateCategory(
        selectedInterviewType,
        newCategoryName.trim()
      );
      setNewCategoryName("");
      const { data, total } = await getCategoriesByInterviewType(
        selectedInterviewType,
        1,
        50,
        ""
      );
      setCategories(data);
      setInterviewTypes((prev) =>
        prev.map((t) =>
          t.id === selectedInterviewType ? { ...t, categoryCount: total } : t
        )
      );
      setHasUnsavedChanges(true);
      addAlert("success", `Categoria "${created.name}" criada com sucesso!`);
    } catch (e) {
      addAlert("error", "Erro ao criar categoria.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || !selectedInterviewType) return;
    try {
      setIsLoading(true);
      await apiDeleteCategory(categoryId);
      const { data, total } = await getCategoriesByInterviewType(
        selectedInterviewType,
        1,
        50,
        ""
      );
      setCategories(data);
      setInterviewTypes((prev) =>
        prev.map((t) =>
          t.id === selectedInterviewType ? { ...t, categoryCount: total } : t
        )
      );
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
        setQuestions([]);
      }
      setHasUnsavedChanges(true);
      addAlert("info", `Categoria "${category.name}" removida`);
    } catch (e) {
      addAlert("error", "Erro ao remover categoria.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuestion = async (
    questionData: Omit<Question, "id" | "createdAt" | "lastModified"> & {
      difficulty: "easy" | "medium" | "hard";
    }
  ) => {
    if (!selectedCategory) {
      addAlert(
        "warning",
        "Selecione uma categoria antes de salvar a pergunta."
      );
      return;
    }
    try {
      setIsLoading(true);
      if (editingQuestion) {
        await apiUpdateQuestion({
          id: editingQuestion.id,
          content:
            questionData.content ||
            questionData.text ||
            editingQuestion.content ||
            editingQuestion.text ||
            "",
          technologies: questionData.technologies,
          order: 0,
        });
        addAlert("success", "Pergunta atualizada com sucesso!");
      } else {
        await apiCreateQuestion({
          text: questionData.content || questionData.text || "",
          technologies: questionData.technologies,
          order: 0,
          categoryId: selectedCategory,
        });
        addAlert("success", "Nova pergunta criada com sucesso!");
      }

      const { data } = await fetchAllQuestions(1, 200, "");
      const normalized = data.map((q: any) => ({
        id: q.id,
        text: q.text ?? q.content ?? "",
        content: q.content ?? q.text ?? "",
        technologies: q.technologies ?? "",
        difficulty: q.difficulty ?? "medium",
        status: q.status,
        categoryId: q.categoryId,
        createdAt: q.createdAt ?? new Date().toISOString(),
        lastModified: q.lastModified,
        updatedAt: q.updatedAt ?? q.lastModified ?? new Date().toISOString(),
      })) as Question[];
      setQuestions(normalized);

      const countInSelected = normalized.filter(
        (q) => q.categoryId === selectedCategory
      ).length;
      setCategories((prev) =>
        prev.map((c) =>
          c.id === selectedCategory
            ? { ...c, questionCount: countInSelected }
            : c
        )
      );

      setIsQuestionModalOpen(false);
      setEditingQuestion(null);
      setHasUnsavedChanges(true);
    } catch (e) {
      addAlert("error", "Erro ao salvar pergunta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!selectedCategory) {
      addAlert("info", "Nenhuma categoria selecionada.");
      return;
    }
    try {
      setIsLoading(true);
      const payload = questions.filter(
        (q) => q.categoryId === selectedCategory
      );
      if (payload.length === 0) {
        setHasUnsavedChanges(false);
        addAlert("info", "Nenhuma alteração para salvar nesta categoria.");
        return;
      }
      await apiSaveQuestions(selectedCategory, payload);
      setHasUnsavedChanges(false);
      addAlert("success", "Todas as alterações foram salvas!");
    } catch (e) {
      addAlert("error", "Erro ao salvar alterações.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardChanges = () => {
    setHasUnsavedChanges(false);
    addAlert("info", "Alterações descartadas");
  };

  const setCategoryQuestions = async (updatedCategoryQuestions: Question[]) => {
    if (!selectedCategory) return;
    try {
      setIsLoading(true);
      if (updatedCategoryQuestions.length === 0) {
        const prevCategoryQuestions = questions.filter(
          (q) => q.categoryId === selectedCategory
        );
        if (prevCategoryQuestions.length > 0) {
          await Promise.all(
            prevCategoryQuestions.map((q) =>
              apiRemoveQuestionFromCategory(selectedCategory, q.id)
            )
          );
        }
        setQuestions((prev) =>
          prev.map((q) =>
            q.categoryId === selectedCategory
              ? { ...q, categoryId: undefined }
              : q
          )
        );
        setCategories((prev) =>
          prev.map((c) =>
            c.id === selectedCategory ? { ...c, questionCount: 0 } : c
          )
        );
        setHasUnsavedChanges(true);
        addAlert("success", "Todas as perguntas foram removidas da categoria.");
        return;
      }

      await apiSaveQuestions(selectedCategory, updatedCategoryQuestions);
      setQuestions((prev) => {
        const others = prev.filter((q) => q.categoryId !== selectedCategory);
        return [...others, ...updatedCategoryQuestions];
      });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === selectedCategory
            ? { ...c, questionCount: updatedCategoryQuestions.length }
            : c
        )
      );
      setHasUnsavedChanges(true);
      addAlert("success", "Perguntas atualizadas.");
    } catch (e) {
      addAlert("error", "Erro ao atualizar perguntas da categoria.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveQuestionFromCategory = async (questionId: string) => {
    if (!selectedCategory) return;
    try {
      setIsLoading(true);
      await apiRemoveQuestionFromCategory(selectedCategory, questionId);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, categoryId: undefined } : q
        )
      );
      setCategories((prev) =>
        prev.map((c) =>
          c.id === selectedCategory
            ? { ...c, questionCount: Math.max(0, c.questionCount - 1) }
            : c
        )
      );
      setHasUnsavedChanges(true);
      addAlert("info", "Pergunta removida da categoria");
    } catch (e) {
      addAlert("error", "Erro ao remover pergunta da categoria.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestionToCategory = async (questionId: string) => {
    if (!selectedCategory) return;
    try {
      setIsLoading(true);
      await apiAddQuestionToCategory(selectedCategory, questionId);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, categoryId: selectedCategory } : q
        )
      );
      setCategories((prevCats) =>
        prevCats.map((c) =>
          c.id === selectedCategory
            ? { ...c, questionCount: c.questionCount + 1 }
            : c
        )
      );
      setHasUnsavedChanges(true);
      addAlert("success", "Pergunta adicionada à categoria!");
    } catch (e) {
      addAlert("error", "Erro ao adicionar pergunta à categoria.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      const { question } = event.detail;
      setEditingQuestion(question);
      setIsQuestionModalOpen(true);
    };

    const handleAddQuestionToCategoryEvt = async (event: CustomEvent) => {
      const { questionId } = event.detail;
      await handleAddQuestionToCategory(questionId);
    };

    const handleRemoveQuestionFromCategoryEvt = async (event: CustomEvent) => {
      const { questionId } = event.detail;
      await handleRemoveQuestionFromCategory(questionId);
    };

    window.addEventListener("openQuestionModal", handleOpenModal as any);
    window.addEventListener(
      "addQuestionToCategory",
      handleAddQuestionToCategoryEvt as any
    );
    window.addEventListener(
      "removeQuestionFromCategory",
      handleRemoveQuestionFromCategoryEvt as any
    );

    return () => {
      window.removeEventListener("openQuestionModal", handleOpenModal as any);
      window.removeEventListener(
        "addQuestionToCategory",
        handleAddQuestionToCategoryEvt as any
      );
      window.removeEventListener(
        "removeQuestionFromCategory",
        handleRemoveQuestionFromCategoryEvt as any
      );
    };
  }, [selectedCategory, selectedInterviewType, questions]);

  const currentInterviewType = interviewTypes.find(
    (type) => type.id === selectedInterviewType
  );
  const selectedCategoryData = categories.find(
    (c) => c.id === selectedCategory
  );
  const categoryQuestions = questions.filter(
    (q) => q.categoryId === selectedCategory
  );

  const totalQuestions = questions.length;
  const totalCategories = categories.length;
  const activeQuestions = questions.filter((q) => q.status === "active").length;

  return (
    <div
      style={{ fontFamily }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
    >
      <Header showLinks={true} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            {/* Toasts flutuantes topo-direito, sempre visíveis */}
            <ToastContainer
              position="top-right"
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              autoClose={5000}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Tabs
                value={selectedInterviewType}
                onValueChange={setSelectedInterviewType}
                className="space-y-6 mb-6"
              >
                <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 h-auto">
                  {interviewTypes.map((type) => (
                    <TabsTrigger
                      key={type.id}
                      value={type.id}
                      className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-700 rounded-lg transition-all"
                    >
                      <div className="flex items-center gap-2">
                        {type.icon}
                        <span className="font-medium">{type.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{type.categoryCount} categorias</span>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

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
                onAddQuestionToCategory={handleAddQuestionToCategory}
                onRemoveQuestionFromCategory={handleRemoveQuestionFromCategory}
                setCategoryQuestions={setCategoryQuestions}
                setQuestions={setQuestions}
                handleSaveQuestions={handleSaveAll}
              />
            </div>
            <QuestionModal
              isOpen={isQuestionModalOpen}
              onClose={() => {
                setIsQuestionModalOpen(false);
                setEditingQuestion(null);
              }}
              onSave={handleSaveQuestion}
              question={editingQuestion}
              categoryId={selectedCategory || undefined}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
