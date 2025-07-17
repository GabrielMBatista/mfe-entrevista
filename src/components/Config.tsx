"use client";

import { useEffect, useState } from "react";
import {
  getInterviewTypes,
  getCategoriesByInterviewType,
  getQuestionsByCategory,
  createCategory,
  createQuestion,
  updateQuestion,
  fetchAllQuestions,
  addQuestionToCategory,
} from "@/lib/api";
import { Category, InterviewType, Question } from "@/types/types";

const mockTechnologies = [
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "Go",
];

export default function Config() {
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [categoryQuestions, setCategoryQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"view" | "manage">("view");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    content: "",
    technologies: "",
    order: 0,
    categoryId: "",
  });
  const [newQuestionData, setNewQuestionData] = useState({
    content: "",
    technologies: "",
    difficulty: "",
  });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [editedContent, setEditedContent] = useState<string>("");

  // Carrega os tipos de entrevista
  useEffect(() => {
    const fetchInterviewTypes = async () => {
      setLoading(true);
      try {
        const types = await getInterviewTypes();
        setInterviewTypes(types);
      } catch (e) {
        console.error("Erro ao buscar tipos de entrevista", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviewTypes();
  }, []);

  // Carrega as categorias ao mudar o tipo
  useEffect(() => {
    if (!selectedType) return;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const categories = await getCategoriesByInterviewType(selectedType);
        setCategories(categories);
      } catch (e) {
        console.error("Erro ao buscar categorias", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [selectedType]);

  // Carrega todas as perguntas disponíveis
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const questions = await fetchAllQuestions();
        setAllQuestions(
          questions.map((q) => ({
            id: q.id,
            text: q.content,
            content: q.content,
            technologies: "",
            order: 0,
            categoryId: "",
          }))
        );
      } catch (e) {
        console.error("Erro ao buscar todas as perguntas", e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setCategoryQuestions([]);
      return;
    }
    const fetchCategoryQuestions = async () => {
      setLoading(true);
      try {
        const questions = await getQuestionsByCategory(selectedCategory);
        setCategoryQuestions(questions);
      } catch (e) {
        console.error("Erro ao buscar perguntas da categoria", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryQuestions();
  }, [selectedCategory]);

  const handleEditQuestion = async (
    questionId: string,
    updatedData: Partial<Question>
  ) => {
    setLoading(true);
    try {
      await updateQuestion({
        id: questionId,
        ...updatedData,
        technologies: Array.isArray(updatedData.technologies)
          ? updatedData.technologies.join(", ")
          : updatedData.technologies,
      });
      setCategoryQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, ...updatedData } : q))
      );
    } catch (e) {
      console.error("Erro ao editar pergunta", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveQuestionFromCategory = (questionId: string) => {
    setCategoryQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleCreateCategory = async () => {
    if (!selectedType || !newCategoryName.trim()) return;
    setLoading(true);
    try {
      const category = await createCategory(selectedType, newCategoryName);
      setCategories((prev) => [...prev, category]);
      setNewCategoryName("");
    } catch (e) {
      console.error("Erro ao criar categoria", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewQuestion = async () => {
    if (!newQuestionData.content.trim() || !newQuestionData.difficulty.trim())
      return;
    setLoading(true);
    try {
      const question = await createQuestion({
        text: newQuestionData.content,
        technologies: newQuestionData.technologies,
        order: 0,
        categoryId: "",
      });
      setAllQuestions((prev) => [...prev, question]);
      setNewQuestionData({ content: "", technologies: "", difficulty: "" });
    } catch (e) {
      console.error("Erro ao criar nova pergunta", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestionToCategory = async () => {
    if (!newQuestion.content || !newQuestion.categoryId) return;
    const questionToAdd = allQuestions.find(
      (q) => q.content === newQuestion.content
    );
    if (questionToAdd) {
      setLoading(true);
      try {
        await addQuestionToCategory(newQuestion.categoryId, questionToAdd.id);
        setCategoryQuestions((prev) => [
          ...prev,
          { ...questionToAdd, categoryId: newQuestion.categoryId },
        ]);
      } catch (e) {
        console.error("Erro ao adicionar pergunta à categoria", e);
      } finally {
        setLoading(false);
      }
    }
    setNewQuestion({ content: "", technologies: "", order: 0, categoryId: "" });
  };

  const handleEditQuestionInline = (
    questionId: string,
    currentContent: string
  ) => {
    setEditingQuestionId(questionId);
    setEditedContent(currentContent);
  };

  const handleSaveEditedQuestion = async (questionId: string) => {
    setLoading(true);
    try {
      await updateQuestion({ id: questionId, content: editedContent });
      setCategoryQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, content: editedContent } : q
        )
      );
      setEditingQuestionId(null);
      setEditedContent("");
    } catch (e) {
      console.error("Erro ao salvar edição da pergunta", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1>Configuração da Entrevista</h1>

      {loading && <p>Carregando...</p>}

      <div className="flex gap-4 border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === "view" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("view")}
        >
          Visualizar
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "manage" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("manage")}
        >
          Gerenciar
        </button>
      </div>

      <div className="flex gap-4 mt-4">
        {interviewTypes.map((type) => (
          <button
            key={type.id}
            className={`px-4 py-2 ${
              selectedType === type.id ? "border-b-2 border-blue-500" : ""
            }`}
            onClick={() => {
              setSelectedType(type.id);
              setCategories([]);
              setQuestions([]);
            }}
          >
            {type.name}
          </button>
        ))}
      </div>

      {activeTab === "view" && (
        <div>
          {!loading && selectedType && categories.length > 0 && (
            <div className="mt-6">
              {categories.map((category) => (
                <div key={category.id}>
                  <h2>{category.name}</h2>
                  <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-4 py-2">
                          Conteúdo
                        </th>
                        <th className="border border-gray-300 px-4 py-2">
                          Tecnologias
                        </th>
                        <th className="border border-gray-300 px-4 py-2">
                          Ordem
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions
                        .filter((q) => q.categoryId === category.id)
                        .map((q) => (
                          <tr key={q.id}>
                            <td className="border border-gray-300 px-4 py-2">
                              {q.content}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {q.technologies}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {q.order}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "manage" && (
        <div className="mt-6">
          <h2>Criar Nova Categoria</h2>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nome da Categoria"
            className="border px-4 py-2"
          />
          <button
            onClick={handleCreateCategory}
            className="ml-2 px-4 py-2 bg-blue-500 text-white"
          >
            Criar
          </button>
          <h2 className="mt-6">Criar Nova Pergunta</h2>
          <input
            type="text"
            value={newQuestionData.content}
            onChange={(e) =>
              setNewQuestionData((prev) => ({
                ...prev,
                content: e.target.value,
              }))
            }
            placeholder="Texto da Pergunta"
            className="border px-4 py-2 mt-2"
          />
          <select
            value={newQuestionData.technologies}
            onChange={(e) =>
              setNewQuestionData((prev) => ({
                ...prev,
                technologies: e.target.value,
              }))
            }
            className="border px-4 py-2 mt-2"
          >
            <option value="">Selecione Tecnologias</option>
            {mockTechnologies.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newQuestionData.difficulty}
            onChange={(e) =>
              setNewQuestionData((prev) => ({
                ...prev,
                difficulty: e.target.value,
              }))
            }
            placeholder="Dificuldade"
            className="border px-4 py-2 mt-2"
          />
          <button
            onClick={handleCreateNewQuestion}
            className="ml-2 px-4 py-2 bg-green-500 text-white mt-2"
          >
            Criar Pergunta
          </button>
          <h2 className="mt-6">Adicionar Pergunta à Categoria</h2>
          <select
            value={newQuestion.categoryId}
            onChange={(e) => {
              setNewQuestion((prev) => ({
                ...prev,
                categoryId: e.target.value,
              }));
              setSelectedCategory(e.target.value);
            }}
            className="border px-4 py-2"
          >
            <option value="">Selecione uma Categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={newQuestion.content}
            onChange={(e) =>
              setNewQuestion((prev) => ({ ...prev, content: e.target.value }))
            }
            className="border px-4 py-2 mt-2"
          >
            <option value="">Selecione uma Pergunta</option>
            {allQuestions.map((question) => (
              <option key={question.id} value={question.content}>
                {question.content}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddQuestionToCategory}
            className="ml-2 px-4 py-2 bg-blue-500 text-white mt-2"
          >
            Salvar
          </button>
          {selectedCategory && categoryQuestions.length > 0 && (
            <div className="mt-4">
              <h3>Perguntas na Categoria Selecionada:</h3>
              <ul className="list-disc pl-6">
                {categoryQuestions.map((question) => (
                  <li
                    key={question.id}
                    className="flex justify-between items-center"
                  >
                    {editingQuestionId === question.id ? (
                      <input
                        type="text"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="border px-2 py-1"
                      />
                    ) : (
                      <span>{question.content}</span>
                    )}
                    <div className="flex gap-2">
                      {editingQuestionId === question.id ? (
                        <button
                          onClick={() => handleSaveEditedQuestion(question.id)}
                          className="px-2 py-1 bg-green-500 text-white"
                        >
                          Salvar
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleEditQuestionInline(
                              question.id,
                              question.content
                            )
                          }
                          className="px-2 py-1 bg-yellow-500 text-white"
                        >
                          Editar
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleRemoveQuestionFromCategory(question.id)
                        }
                        className="px-2 py-1 bg-red-500 text-white"
                      >
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
