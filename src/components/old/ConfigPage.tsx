"use client";

import { useEffect, useState } from "react";
import {
  getInterviewTypes,
  getCategoriesByInterviewType,
  getQuestionsByCategory,
  fetchAllQuestions,
  createCategory,
  createQuestion,
} from "@/lib/api";
import { Category, InterviewType, Question } from "@/types/types";
import InterviewTypeSelector from "@/components/old/InterviewTypeSelector";
import CategoryManager from "@/components/old/CategoryManager";

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

export default function ConfigPage() {
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [categoryQuestions, setCategoryQuestions] = useState<Question[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newQuestionData, setNewQuestionData] = useState({
    content: "",
    technologies: "",
    difficulty: "",
  });

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

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const questions = await fetchAllQuestions();
        setAllQuestions(
          questions.map((q) => ({
            id: q.id,
            content: q.content,
            text: q.content,
            technologies: [],
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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1>Configuração da Entrevista</h1>

      {loading && <p>Carregando...</p>}

      <InterviewTypeSelector
        interviewTypes={interviewTypes}
        selectedType={selectedType}
        onSelectType={(typeId) => {
          setSelectedType(typeId);
          setCategories([]);
          setCategoryQuestions([]);
        }}
      />

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
      </div>

      <div className="mt-6">
        <h2>Criar Nova Pergunta</h2>
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
      </div>

      <CategoryManager
        categories={categories}
        allQuestions={allQuestions}
        categoryQuestions={categoryQuestions}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setCategoryQuestions={setCategoryQuestions}
      />
    </div>
  );
}
