"use client";

import { useEffect, useState, useRef } from "react";
import {
  fetchInvitationById,
  createSession,
  saveAnswer,
  transcribeAudio,
  fetchSessionSummary,
  updateTranscript,
  finalizeSession,
} from "@/lib/api";
import { useRouter } from "next/router";
import { Question, SessionSummary } from '@/types/types';

export default function Interview() {
  const router = useRouter();
  const { id } = router.query;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(
    null
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") {
      setError("Erro: ID do convite não encontrado.");
      return;
    }

    const fetchInvitation = async () => {
      setLoading(true);
      try {
        const invitation = await fetchInvitationById(id);
        if (!invitation.questions || invitation.questions.length === 0) {
          throw new Error("Nenhuma pergunta encontrada para este convite.");
        }

        const session = await createSession(id, new Date().toISOString());
        setSessionId(session.id);

        // Verificar se a sessão já possui respostas
        const summary = await fetchSessionSummary(session.id);
        if (summary.answers.length > 0) {
          setSessionSummary(summary); // Direcionar para a etapa final
        } else {
          setQuestions(invitation.questions);
        }
      } catch (e) {
        console.error("Erro ao carregar convite ou criar sessão", e);
        setError("Convite não encontrado ou inválido.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [id]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.warn("MimeType não suportado: usando padrão.");
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType)
          ? mimeType
          : undefined,
      });

      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Erro ao iniciar gravação", e);
      setError("Não foi possível iniciar a gravação.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleAnswerSubmit = async () => {
    if (!sessionId || !questions[currentQuestionIndex] || !audioBlob) {
      console.log("Erro: Dados insuficientes para salvar resposta.");
      return;
    }

    setLoading(true);
    try {
      const transcription = await transcribeAudio(audioBlob);
      console.log("Transcrição obtida:", transcription);

      await saveAnswer(
        sessionId,
        questions[currentQuestionIndex].id,
        transcription
      );

      setAudioBlob(null);
      setCurrentQuestionIndex((prev) => prev + 1);
    } catch (e) {
      console.error("Erro ao salvar resposta:", e);
      setError("Erro ao salvar resposta.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const summary = await fetchSessionSummary(sessionId);
      setSessionSummary(summary);
    } catch (e) {
      console.error("Erro ao buscar resumo da sessão:", e);
      setError("Erro ao buscar resumo da sessão.");
    } finally {
      setLoading(false);
    }
  };

  const handleTranscriptUpdate = async (
    answerId: string,
    transcript: string
  ) => {
    try {
      const updatedAnswer = await updateTranscript(
        sessionId!,
        answerId,
        transcript
      );
      setSessionSummary((prev) =>
        prev
          ? {
              ...prev,
              answers: prev.answers.map((answer) =>
                answer.id === answerId
                  ? { ...updatedAnswer, audioBlob: answer.audioBlob }
                  : answer
              ),
            }
          : null
      );
    } catch (e) {
      console.error("Erro ao atualizar transcrição:", e);
      setError("Erro ao atualizar transcrição.");
    }
  };

  const handleFinalizeSession = async () => {
    try {
      await finalizeSession(sessionId!);
      alert("Sessão enviada para avaliação com sucesso!");
      router.push("/"); // Redireciona para a página inicial
    } catch (e) {
      console.error("Erro ao finalizar sessão:", e);
      setError("Erro ao finalizar sessão.");
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (sessionSummary) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Resumo da Entrevista</h1>
        <ul className="mt-4 space-y-4">
          {sessionSummary.answers.map((answer) => (
            <li key={answer.id} className="border p-4 rounded">
              <p className="font-semibold">{answer.question.content}</p>
              <textarea
                className="w-full mt-2 p-2 border rounded"
                value={answer.transcript}
                onChange={(e) =>
                  handleTranscriptUpdate(answer.id, e.target.value)
                }
              />
              <div className="mt-2">
                <audio
                  controls
                  src={`data:audio/webm;base64,${answer.audioBlob}`}
                >
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            </li>
          ))}
        </ul>
        <button
          onClick={handleFinalizeSession}
          className="mt-6 px-4 py-2 bg-green-600 text-white rounded"
        >
          Finalizar Sessão
        </button>
      </div>
    );
  }

  if (currentQuestionIndex >= questions.length && !sessionSummary) {
    fetchSummary();
    return <p>Carregando resumo...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Entrevista</h1>
      <p className="mt-4 text-lg">{questions[currentQuestionIndex]?.content}</p>

      <div className="mt-6">
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Parar Gravação
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Iniciar Gravação
          </button>
        )}
      </div>

      {audioBlob && (
        <div className="mt-4">
          <audio controls src={URL.createObjectURL(audioBlob)} />
          <div className="mt-2 flex gap-4">
            <button
              onClick={() => setAudioBlob(null)}
              className="px-4 py-2 bg-yellow-500 text-white rounded"
            >
              Regravar
            </button>
            <button
              onClick={handleAnswerSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded"
              disabled={loading}
            >
              Avançar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
