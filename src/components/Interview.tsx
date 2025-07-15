"use client";

import { useEffect, useState, useRef } from "react";

// Declaração de tipos para SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import { fetchInvitationById, createSession, saveAnswer } from "@/lib/api";
import { useRouter } from "next/router";

type Question = { id: string; content: string; order: number };

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  if (!id || typeof id !== "string") {
    return <p>Erro: ID do convite não encontrado.</p>;
  }

  useEffect(() => {
    const fetchInvitation = async () => {
      setLoading(true);
      try {
        const invitation = await fetchInvitationById(id);
        if (!invitation.questions || invitation.questions.length === 0) {
          throw new Error("Nenhuma pergunta encontrada para este convite.");
        }
        setQuestions(invitation.questions);
        const startTime = new Date().toISOString();
        const session = await createSession(id, startTime);
        setSessionId(session.id);
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
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Erro ao iniciar gravação", e);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleAnswerSubmit = async () => {
    if (!sessionId || !questions[currentQuestionIndex] || !audioBlob) return;

    setLoading(true);
    try {
      const transcription = await transcribeAudio(audioBlob); // Função para transcrever o áudio
      await saveAnswer(
        sessionId,
        questions[currentQuestionIndex].id,
        transcription
      );
      setAudioBlob(null);
      setCurrentQuestionIndex((prev) => prev + 1);
    } catch (e) {
      console.error("Erro ao salvar resposta", e);
      const recognition = new ((window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition)();
    }
  };

  // Função para transcrever o áudio
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
      const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      recognition.lang = "pt-BR"; // Configurar idioma para português

      return new Promise((resolve, reject) => {
        recognition.onresult = (event: { results: { transcript: any; }[][]; }) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript); // Retorna a transcrição
        };

        recognition.onerror = (event: { error: any; }) => {
          reject(new Error(`Erro na transcrição: ${event.error}`));
        };

        recognition.start();
      });
    } catch (error) {
      console.error("Erro na transcrição do áudio:", error);
      throw error;
    }
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (questions.length === 0) {
    return <p>Nenhuma pergunta disponível para este convite.</p>;
  }

  if (currentQuestionIndex >= questions.length) {
    return <p>Obrigado por responder à entrevista!</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1>Entrevista</h1>
      <p>{questions[currentQuestionIndex]?.content}</p>
      <div className="mt-4">
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-500 text-white"
          >
            Parar Gravação
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-blue-500 text-white"
          >
            Iniciar Gravação
          </button>
        )}
      </div>
      {audioBlob && (
        <div className="mt-4">
          <audio controls src={URL.createObjectURL(audioBlob)} />
          <button
            onClick={() => setAudioBlob(null)}
            className="ml-4 px-4 py-2 bg-yellow-500 text-white"
          >
            Regravar
          </button>
        </div>
      )}
      <button
        onClick={handleAnswerSubmit}
        disabled={!audioBlob}
        className="mt-4 px-4 py-2 bg-green-500 text-white"
      >
        Avançar
      </button>
    </div>
  );
}
