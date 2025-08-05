"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGoogleFont } from "@/utils/fonts";
import Header from "@/components/ui/Header";
import LoadingScreen from "@/components/interview/LoadingScreen";
import Summary from "@/components/interview/Summary";
import ProgressHeader from "@/components/interview/ProgressHeader";
import QuestionCard from "@/components/interview/QuestionCard";
import RecordingControls from "@/components/interview/RecordingControls";
import {
  fetchInvitationById,
  createSession,
  transcribeAudio,
  saveAnswer,
  fetchSessionSummary,
  updateTranscript,
  finalizeSession,
} from "@/lib/api";
import { useRouter } from "next/router"; // Importar para redirecionamento
import { toast, ToastContainer } from "react-toastify"; // Importar biblioteca de toast
import "react-toastify/dist/ReactToastify.css"; // Estilos do toast

// Tipagens conforme especificação
type Question = {
  id: string;
  content: string;
};

import { Answer, SessionSummary } from "@/types/types";

export default function Interview() {
  const fontFamily = useGoogleFont("Inter");
  const router = useRouter(); // Para redirecionamento

  // Captura o `invitationId` diretamente da URL
  const invitationId =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").pop()
      : null;

  // Estados principais
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(
    null
  );

  // Estados de gravação
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editTranscript, setEditTranscript] = useState("");

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  console.log("invitationId", invitationId);
  // Inicialização
  useEffect(() => {
    if (!invitationId) {
      console.log("Aguardando invitationId...");
      return; // Aguarda o `invitationId` estar disponível
    }

    const initializeInterview = async () => {
      try {
        const invitation = await fetchInvitationById(invitationId);
        setQuestions(invitation.questions);

        const session = await createSession(
          invitationId,
          new Date().toISOString()
        );
        setSessionId(session.id);

        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao inicializar entrevista:", error);
        setIsLoading(false);
      }
    };

    initializeInterview();
  }, [invitationId]);

  if (!invitationId) {
    return <LoadingScreen fontFamily={fontFamily} />; // Exibe uma tela de carregamento enquanto o `invitationId` não está disponível
  }

  // Configuração do áudio
  const setupAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Configurar MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      // Configurar análise de áudio para nível
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      return true;
    } catch (error) {
      console.error("Erro ao configurar áudio:", error);
      return false;
    }
  };

  // Monitorar nível de áudio
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateLevel = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);

      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      }
    };

    updateLevel();
  };

  // Controles de gravação
  const startRecording = async () => {
    const audioSetup = await setupAudio();
    if (!audioSetup || !mediaRecorderRef.current) return;

    setIsRecording(true);
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscript("");

    mediaRecorderRef.current.start();
    monitorAudioLevel();
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    setIsRecording(false);
    mediaRecorderRef.current.stop();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setAudioLevel(0);
  };

  // Avançar para próxima pergunta
  const handleNextQuestion = async () => {
    if (!sessionId || !audioBlob) return;

    try {
      // Transcrever áudio
      const transcriptText = await transcribeAudio(audioBlob);
      setTranscript(transcriptText);

      // Salvar resposta
      const audioBlobString = audioBlob ? await audioBlob.text() : "";
      const answer = await saveAnswer(
        sessionId,
        questions[currentQuestionIndex].id,
        transcriptText,
        audioBlobString
      );

      setAnswers((prev) => [
        ...prev,
        {
          ...answer,
          question: questions[currentQuestionIndex].content,
          audioBlob: answer.audioBlob ?? null,
        },
      ]);

      // Verificar se é a última pergunta
      if (currentQuestionIndex === questions.length - 1) {
        const summary = await fetchSessionSummary(sessionId);
        setSessionSummary(summary);
        setShowSummary(true);
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setAudioBlob(null);
        setAudioUrl(null);
        setTranscript("");
      }
    } catch (error) {
      console.error("Erro ao processar resposta:", error);
    }
  };

  // Editar transcrição
  const handleEditTranscript = async (answerId: string) => {
    if (!sessionId) return;

    try {
      await updateTranscript(sessionId, answerId, editTranscript);

      setAnswers((prev) =>
        prev.map((answer) =>
          answer.id === answerId
            ? { ...answer, transcript: editTranscript }
            : answer
        )
      );

      setEditingAnswerId(null);
      setEditTranscript("");
    } catch (error) {
      console.error("Erro ao atualizar transcrição:", error);
    }
  };

  // Finalizar sessão
const handleFinalizeSession = async () => {
  if (!sessionId) return;

  try {
    setIsLoading(true);

    const response = await finalizeSession(sessionId);

    if (response.ok) {
      toast.success("Entrevista finalizada com sucesso! Redirecionando...");

      setTimeout(() => {
        router.push("/thank-you");
      }, 2000);
    } else {
      const errorText = await response.text();
      console.error("Erro da API:", errorText);

      toast.error("Erro ao finalizar a entrevista. Por favor, tente novamente.");
    }
  } catch (error) {
    console.error("Erro inesperado:", error);
    toast.error("Ocorreu um erro inesperado. Tente reenviar.");
  } finally {
    setIsLoading(false);
  }
};


  if (isLoading) {
    return <LoadingScreen fontFamily={fontFamily} />;
  }

  if (showSummary && sessionSummary) {
    return (
      <Summary
        fontFamily={fontFamily}
        sessionSummary={sessionSummary}
        editingAnswerId={editingAnswerId}
        editTranscript={editTranscript}
        setEditingAnswerId={setEditingAnswerId}
        setEditTranscript={setEditTranscript}
        handleEditTranscript={handleEditTranscript}
        handleFinalizeSession={handleFinalizeSession}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <>
      <div
        style={{ fontFamily }}
        className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
      >
        <Header showLinks={false} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProgressHeader
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            progress={progress}
          />
          <QuestionCard
            question={currentQuestion}
            index={currentQuestionIndex}
          />
          <RecordingControls
            isRecording={isRecording}
            audioBlob={audioBlob}
            audioUrl={audioUrl}
            transcript={transcript}
            audioLevel={audioLevel}
            isTranscribing={isTranscribing}
            startRecording={startRecording}
            stopRecording={stopRecording}
            handleNextQuestion={handleNextQuestion}
            setAudioBlob={setAudioBlob}
            setAudioUrl={setAudioUrl}
            setTranscript={setTranscript}
          />
        </main>
      </div>
      <ToastContainer /> {/* Componente para exibir os toasts */}
    </>
  );
}
