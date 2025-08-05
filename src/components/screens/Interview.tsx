"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGoogleFont } from "@/utils/fonts";
import Header from "@/components/ui/Header";
import LoadingScreen from "@/components/interview/LoadingScreen";
import Summary from "@/components/interview/Summary";
import ProgressHeader from "@/components/interview/ProgressHeader";
import QuestionCard from "@/components/interview/QuestionCard";
import RecordingControls from "@/components/interview/RecordingControls";

// Tipagens conforme especificação
type Question = {
  id: string;
  content: string;
};

type Answer = {
  id: string;
  transcript: string;
  question: { id: string; content: string };
  audioBlob: string | null;
};

type SessionSummary = {
  id: string;
  answers: Answer[];
};

export default function Interview() {
  const fontFamily = useGoogleFont("Inter");

  // Estados principais
  const [invitationId] = useState("inv-123"); // Simulado - viria da URL
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

  // Simulação das APIs
  const fetchInvitationById = async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      id,
      candidateName: "João Silva",
      position: "Desenvolvedor Frontend",
      questions: [
        {
          id: "q1",
          content:
            "Conte-me sobre sua experiência com React e suas principais funcionalidades.",
        },
        {
          id: "q2",
          content:
            "Como você abordaria a otimização de performance em uma aplicação web?",
        },
        {
          id: "q3",
          content:
            "Descreva um projeto desafiador que você trabalhou recentemente.",
        },
        {
          id: "q4",
          content:
            "Quais são suas expectativas para esta posição e como você se vê contribuindo?",
        },
      ],
    };
  };

  const createSession = async (invitationId: string, startTime: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { id: `session-${Date.now()}`, invitationId, startTime };
  };

  const transcribeAudio = async (blob: Blob): Promise<string> => {
    setIsTranscribing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsTranscribing(false);

    // Simulação de transcrição baseada na pergunta atual
    const mockTranscripts = [
      "Tenho 3 anos de experiência com React, trabalhando principalmente com hooks, context API e gerenciamento de estado. Já desenvolvi várias SPAs e tenho experiência com Next.js também.",
      "Para otimização, foco em lazy loading, code splitting, otimização de imagens, memoização de componentes e uso de ferramentas como Lighthouse para monitoramento.",
      "Recentemente trabalhei em um sistema de dashboard complexo com múltiplas visualizações de dados em tempo real, usando WebSockets e otimizações de rendering.",
      "Busco uma posição onde possa crescer tecnicamente e contribuir com soluções inovadoras. Tenho interesse em arquitetura frontend e liderança técnica.",
    ];

    return (
      mockTranscripts[currentQuestionIndex] ||
      "Transcrição da resposta do candidato..."
    );
  };

  const saveAnswer = async (
    sessionId: string,
    questionId: string,
    transcript: string,
    audioBlob: Blob | null
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: `answer-${Date.now()}`,
      transcript,
      question: questions.find((q) => q.id === questionId)!,
      audioBlob: audioBlob ? URL.createObjectURL(audioBlob) : null,
    };
  };

  const fetchSessionSummary = async (
    sessionId: string
  ): Promise<SessionSummary> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { id: sessionId, answers };
  };

  const updateTranscript = async (
    sessionId: string,
    answerId: string,
    transcript: string
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  };

  const finalizeSession = async (sessionId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      success: true,
      message: "Sessão finalizada e enviada para avaliação!",
    };
  };

  // Inicialização
  useEffect(() => {
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
      const answer = await saveAnswer(
        sessionId,
        questions[currentQuestionIndex].id,
        transcriptText,
        audioBlob
      );

      setAnswers((prev) => [...prev, answer]);

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
      await finalizeSession(sessionId);
      // Aqui poderia redirecionar para uma página de sucesso
      alert("Entrevista finalizada com sucesso! Obrigado pela participação.");
    } catch (error) {
      console.error("Erro ao finalizar sessão:", error);
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
        <QuestionCard question={currentQuestion} index={currentQuestionIndex} />
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
  );
}
