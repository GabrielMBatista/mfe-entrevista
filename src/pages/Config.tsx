"use client";

import { useEffect, useState } from "react";
import {
  getInterviewTypes,
  getCategoriesByInterviewType,
  getQuestionsByCategory,
  fetchAllQuestions,
} from "@/lib/api";
import { Category, InterviewType, Question } from "@/types/types";
import InterviewTypeSelector from "@/components/InterviewTypeSelector";
import CategoryManager from "@/components/CategoryManager";

export default function ConfigPage() {
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [categoryQuestions, setCategoryQuestions] = useState<Question[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
            text: q.content,
            content: q.content,
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
