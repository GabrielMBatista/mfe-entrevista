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
  technologies: string[];
  order: number;
  categoryId: string;
};

export default function Config() {
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Carrega os tipos de entrevista
  useEffect(() => {
    const fetchInterviewTypes = async () => {
      try {
        setLoading(true);
        const types = await getInterviewTypes();
        setInterviewTypes(
          types.map((type) => ({
            ...type,
            description: type.description || "",
          }))
        );
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
      try {
        setLoading(true);
        console.log("Fetching categories for interviewTypeId:", selectedType); // Log atualizado
        const categories = await getCategoriesByInterviewType(selectedType); // Ajustado para enviar interviewTypeId
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
      try {
        const responses = await Promise.all(
          categories.map((category) =>
            getQuestionsByCategory(category.id).then((questions) =>
              questions.map((q) => ({
                id: q.id,
                text: q.content,
                technologies: q.technologies,
                order: new Date(q.createdAt).getTime(),
                categoryId: category.id,
              }))
            )
          )
        );

        // responses é um array de arrays de perguntas transformadas
        setQuestions(responses.flat());
      } catch (e) {
        console.error("Erro ao buscar perguntas", e);
      }
    };

    fetchQuestions();
  }, [categories]);

  const handleTabChange = (event: { detail: string }) => {
    setSelectedType(event.detail);
  };

  console.log("interviewTypes", interviewTypes); // Adicionado para depuração
  console.log("selectedType", selectedType); // Adicionado para depuração

  return (
    <div className="max-w-3xl mx-auto p-6">
      <ui-heading>Configuração da Entrevista</ui-heading>

      {loading && <ui-loading />}

      {!loading && interviewTypes.length === 0 && (
        <ui-empty-state message="Nenhum tipo de entrevista encontrado." />
      )}

      {!loading && interviewTypes.length > 0 && (
        <div className="flex gap-4 border-b">
          {interviewTypes.map((type) => (
            <button
              key={type.id}
              className={`px-4 py-2 ${
                selectedType === type.id ? "border-b-2 border-blue-500" : ""
              }`}
              onClick={() => handleTabChange({ detail: type.id })}
            >
              {type.name}
            </button>
          ))}
        </div>
      )}

      {selectedType && categories.length > 0 && (
        <div className="mt-6">
          {categories.map((category) => (
            <ui-data-table
              columns={["Texto", "Tecnologias", "Ordem"]}
              data={questions
                .filter((q) => q.categoryId === category.id)
                .map((q) => ({
                  Texto: q.text,
                  Tecnologias: q.technologies,
                  Ordem: new Date(q.order).toLocaleString(),
                }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
