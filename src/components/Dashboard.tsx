"use client";

import { useEffect, useState } from "react";
import { fetchCompletedSessions, reEvaluateSession } from "@/lib/api";

export default function Dashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const data = await fetchCompletedSessions();
        setSessions(data);
      } catch (e) {
        console.error("Erro ao buscar sessões concluídas:", e);
        setError("Erro ao buscar sessões concluídas.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const toggleRowExpansion = (sessionId: string) => {
    setExpandedRow((prev) => (prev === sessionId ? null : sessionId));
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Sessões Concluídas</h2>
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr>
              {/* <th className="border border-gray-300 p-2">ID</th> */}
              <th className="border border-gray-300 p-2">Candidato</th>
              <th className="border border-gray-300 p-2">Pontuação</th>
              <th className="border border-gray-300 p-2">Data</th>
              <th className="border border-gray-300 p-2">Categoria</th>
              <th className="border border-gray-300 p-2">Tipo de Entrevista</th>
              <th className="border border-gray-300 p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <>
                <tr key={session.id}>
                  {/* <td className="border border-gray-300 p-2">{session.id}</td> */}
                  <td className="border border-gray-300 p-2">
                    {session.candidateName}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {session.score}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {new Date(session.completedAt).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {session.category}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {session.interviewType}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => toggleRowExpansion(session.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                      {expandedRow === session.id ? "Fechar" : "Expandir"}
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await reEvaluateSession(session.id);
                          alert("Avaliação reenviada com sucesso!");
                        } catch {
                          alert("Erro ao reenviar avaliação.");
                        }
                      }}
                      className="ml-2 px-4 py-2 bg-green-500 text-white rounded"
                    >
                      Reenviar Avaliação
                    </button>
                  </td>
                </tr>
                {expandedRow === session.id && (
                  <tr>
                    <td colSpan={7} className="border border-gray-300 p-4">
                      <h3 className="text-lg font-semibold">Resumo</h3>
                      <p>{session.summary}</p>
                      {session.fullReport && (
                        <div className="mt-4">
                          <h3 className="text-lg font-semibold">
                            Relatório Completo
                          </h3>
                          <div className="mt-2">
                            {(() => {
                              try {
                                const report = JSON.parse(session.fullReport);
                                return (
                                  <>
                                    <p>
                                      <span className="font-semibold">
                                        Nível de Conhecimento:
                                      </span>{" "}
                                      {report.nivelDeConhecimento}
                                    </p>
                                    <p>
                                      <span className="font-semibold">
                                        Comunicação:
                                      </span>{" "}
                                      {report.comunicacao}
                                    </p>
                                    <div className="mt-2">
                                      <h4 className="font-semibold">
                                        Pontos Fortes:
                                      </h4>
                                      <ul className="list-disc ml-5">
                                        {report.pontosFortes.map(
                                          (ponto: string, index: number) => (
                                            <li key={index}>{ponto}</li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                    <div className="mt-2">
                                      <h4 className="font-semibold">
                                        Pontos de Melhoria:
                                      </h4>
                                      <ul className="list-disc ml-5">
                                        {report.pontosDeMelhoria.map(
                                          (ponto: string, index: number) => (
                                            <li key={index}>{ponto}</li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                    <div className="mt-2">
                                      <h4 className="font-semibold">
                                        Potencial de Crescimento:
                                      </h4>
                                      {report.potencialDeCrescimento}
                                    </div>
                                  </>
                                );
                              } catch (e) {
                                console.error(
                                  "Erro ao analisar o JSON de fullReport:",
                                  e
                                );
                                return (
                                  <p className="text-red-500">
                                    Erro ao carregar o relatório completo.
                                  </p>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      )}
                      <h3 className="text-lg font-semibold mt-4">
                        Perguntas e Respostas
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {session.answers.map((answer: any, index: number) => (
                          <li key={index}>
                            <p className="font-semibold">
                              Pergunta: {answer.question}
                            </p>
                            <p>Resposta: {answer.response}</p>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
