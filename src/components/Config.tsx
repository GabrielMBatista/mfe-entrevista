"use client";

import { useEffect, useState } from "react";
import {
  getInterviewTypes,
  getCategoriesByInterviewType,
  getQuestionsByCategory,
} from "@/lib/api";

type InterviewType = { id: string; name: string; description: string };
type Category = { id: string; name: string; interviewTypeId: string };
type Question = {
  id: string;
  text: string;
  technologies: string[] | string; // Pode ser array ou string
  order: number;
  categoryId: string;
};

export default function Config() {
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

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

  // Carrega todas as perguntas das categorias visíveis
  useEffect(() => {
    if (categories.length === 0) return;
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const responses = await Promise.all(
          categories.map((category) =>
            getQuestionsByCategory(category.id).then((questions) =>
              questions.map((q) => ({
                id: q.id,
                text: q.text || q.content, // Garantir que o texto seja exibido
                technologies: Array.isArray(q.technologies)
                  ? q.technologies.join(", ")
                  : q.technologies || "N/A", // Verificar se é array ou string
                order: q.order || new Date(q.createdAt).toLocaleString(),
                categoryId: category.id,
              }))
            )
          )
        );
        setQuestions(responses.flat());
      } catch (e) {
        console.error("Erro ao buscar perguntas", e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [categories]);

  const handleTabChange = (typeId: string) => {
    setSelectedType(typeId);
    setCategories([]);
    setQuestions([]);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1>Configuração da Entrevista</h1>

      {loading && <p>Carregando...</p>}

      {!loading && interviewTypes.length === 0 && (
        <p>Nenhum tipo de entrevista encontrado.</p>
      )}

      {!loading && interviewTypes.length > 0 && (
        <div className="flex gap-4 border-b">
          {interviewTypes.map((type) => (
            <button
              key={type.id}
              className={`px-4 py-2 ${
                selectedType === type.id ? "border-b-2 border-blue-500" : ""
              }`}
              onClick={() => handleTabChange(type.id)}
            >
              {type.name}
            </button>
          ))}
        </div>
      )}

      {selectedType && categories.length > 0 && (
        <div className="mt-6">
          {categories.map((category) => (
            <div key={category.id}>
              <h2>{category.name}</h2>
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Texto</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Tecnologias
                    </th>
                    <th className="border border-gray-300 px-4 py-2">Ordem</th>
                  </tr>
                </thead>
                <tbody>
                  {questions
                    .filter((q) => q.categoryId === category.id)
                    .map((q) => (
                      <tr key={q.id}>
                        <td className="border border-gray-300 px-4 py-2">
                          {q.text}
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
  );
}
