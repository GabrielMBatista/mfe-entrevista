"use client";

import { useEffect, useState } from "react";
import {
  getInterviewTypes,
  getCategoriesByInterviewType,
  sendInvitation,
} from "@/lib/api";

type InterviewType = { id: string; name: string; description: string };
type Category = { id: string; name: string; interviewTypeId: string };

export default function Invite() {
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Novo estado para categoria selecionada
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [candidateName, setCandidateName] = useState(""); // Novo estado para o nome do candidato
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInterviewTypes = async () => {
      setLoading(true);
      try {
        const types = await getInterviewTypes();
        console.log("Tipos de entrevista carregados:", types); // Log para depuração
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
        console.log("Categorias carregadas:", categories); // Log para depuração
        setCategories(categories);
      } catch (e) {
        console.error("Erro ao buscar categorias", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [selectedType]);

  const handleTabChange = (typeId: string) => {
    setSelectedType(typeId);
    setCategories([]);
    setSelectedCategory(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSendInvitation = async () => {
    if (!candidateName || !email || !selectedCategory) {
      alert("Por favor, preencha o nome, email e selecione uma categoria.");
      return;
    }
    setLoading(true);
    try {
      await sendInvitation(candidateName, email, selectedCategory); // Enviar apenas a categoria selecionada
      alert("Convite enviado com sucesso!");
      setCandidateName(""); // Limpar o campo de nome
      setEmail("");
      setSelectedCategory(null); // Limpar a categoria selecionada
    } catch (e) {
      console.error("Erro ao enviar convite", e);
      alert("Erro ao enviar convite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1>Enviar Convite</h1>

      {loading && <p>Carregando...</p>}

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
              <label>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === category.id}
                  onChange={() => handleCategorySelect(category.id)}
                />
                {category.name}
              </label>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <label>
          Nome do Candidato:
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            className="border px-4 py-2 w-full"
          />
        </label>
      </div>
      <div className="mt-6">
        <label>
          Email do Usuário:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-4 py-2 w-full"
          />
        </label>
      </div>
      <button
        onClick={handleSendInvitation}
        className="mt-4 px-4 py-2 bg-blue-500 text-white"
      >
        Enviar Convite
      </button>
    </div>
  );
}
