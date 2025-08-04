"use client";

import { useState } from "react";
import { Category, Question } from "@/types/types";
import { addQuestionToCategory, updateQuestion } from "@/lib/api";

interface CategoryManagerProps {
  categories: Category[];
  allQuestions: Question[];
  categoryQuestions: Question[];
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
  setCategoryQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

export default function CategoryManager({
  categories,
  allQuestions,
  categoryQuestions,
  selectedCategory,
  setSelectedCategory,
  setCategoryQuestions,
}: CategoryManagerProps) {
  const [newQuestion, setNewQuestion] = useState({
    content: "",
    categoryId: "",
  });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [editedContent, setEditedContent] = useState<string>("");

  const handleAddQuestionToCategory = async () => {
    if (!newQuestion.content || !newQuestion.categoryId) return;
    const questionToAdd = allQuestions.find(
      (q) => q.content === newQuestion.content
    );
    if (questionToAdd) {
      try {
        await addQuestionToCategory(newQuestion.categoryId, questionToAdd.id);
        setCategoryQuestions([
          ...categoryQuestions,
          { ...questionToAdd, categoryId: newQuestion.categoryId },
        ]);
      } catch (e) {
        console.error("Erro ao adicionar pergunta à categoria", e);
      }
    }
    setNewQuestion({ content: "", categoryId: "" });
  };

  const handleEditQuestionInline = (
    questionId: string,
    currentContent: string
  ) => {
    setEditingQuestionId(questionId);
    setEditedContent(currentContent);
  };

  const handleSaveEditedQuestion = async (questionId: string) => {
    try {
      await updateQuestion({ id: questionId, content: editedContent });
      setCategoryQuestions((prev) =>
        Array.isArray(prev)
          ? prev.map((q) =>
              q.id === questionId ? { ...q, content: editedContent } : q
            )
          : []
      );
      setEditingQuestionId(null);
      setEditedContent("");
    } catch (e) {
      console.error("Erro ao salvar edição da pergunta", e);
    }
  };

  const handleRemoveQuestionFromCategory = (questionId: string) => {
    setCategoryQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  return (
    <div className="mt-6">
      <h2>Adicionar Pergunta à Categoria</h2>
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
                        handleEditQuestionInline(question.id, question.content)
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
  );
}
