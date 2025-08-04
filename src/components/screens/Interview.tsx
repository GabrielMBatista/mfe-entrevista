"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGoogleFont } from "@/utils/fonts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  CheckCircle,
  Volume2,
} from "lucide-react";
import Layout from "../Layout";

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
    return (
      <div
        style={{ fontFamily }}
        className="min-h-screen bg-slate-50 dark:bg-slate-900"
      >
        <Layout>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300">
                Carregando entrevista...
              </p>
            </div>
          </div>
        </Layout>
      </div>
    );
  }

  if (showSummary && sessionSummary) {
    return (
      <div
        style={{ fontFamily }}
        className="min-h-screen bg-slate-50 dark:bg-slate-900"
      >
        <Layout>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-800 dark:text-white flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Resumo da Entrevista
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400">
                  Revise suas respostas antes de finalizar a sessão
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {sessionSummary.answers.map((answer, index) => (
                  <div
                    key={answer.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Badge
                          variant="outline"
                          className="mb-2 border-slate-300 dark:border-slate-600"
                        >
                          Pergunta {index + 1}
                        </Badge>
                        <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">
                          {answer.question.content}
                        </p>
                      </div>
                      {answer.audioBlob && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const audio = new Audio(answer.audioBlob!);
                            audio.play();
                          }}
                          className="ml-4 border-slate-300 dark:border-slate-600"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {editingAnswerId === answer.id ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editTranscript}
                          onChange={(e) => setEditTranscript(e.target.value)}
                          className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white"
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditTranscript(answer.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Salvar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingAnswerId(null);
                              setEditTranscript("");
                            }}
                            className="border-slate-300 dark:border-slate-600"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-800 dark:text-slate-200 mb-3 leading-relaxed">
                          {answer.transcript}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingAnswerId(answer.id);
                            setEditTranscript(answer.transcript);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          Editar transcrição
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    onClick={handleFinalizeSession}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Finalizar Sessão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Layout>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div
      style={{ fontFamily }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
    >
      <Layout>
        <div className="max-w-4xl mx-auto">
          {/* Header com progresso */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                Entrevista - Desenvolvedor Frontend
              </h1>
              <Badge
                variant="outline"
                className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600"
              >
                {currentQuestionIndex + 1} de {questions.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Pergunta atual */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-white text-xl">
                Pergunta {currentQuestionIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed">
                {currentQuestion?.content}
              </p>
            </CardContent>
          </Card>

          {/* Controles de gravação */}
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                {/* Indicador visual de gravação */}
                <div className="relative">
                  <div
                    className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
                      isRecording
                        ? "bg-red-500 animate-pulse"
                        : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="h-10 w-10 text-white" />
                    ) : (
                      <Mic className="h-10 w-10 text-slate-600 dark:text-slate-300" />
                    )}
                  </div>

                  {/* Nível de áudio */}
                  {isRecording && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 bg-red-400 rounded-full transition-all duration-100 ${
                              audioLevel > i * 50 ? "h-4" : "h-1"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  {isRecording ? (
                    <p className="text-red-500 font-medium">
                      🔴 Gravando... Fale naturalmente
                    </p>
                  ) : audioBlob ? (
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      ✅ Gravação concluída
                    </p>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-400">
                      Clique no botão abaixo para iniciar a gravação
                    </p>
                  )}
                </div>

                {/* Controles */}
                <div className="flex justify-center gap-4">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="lg"
                      disabled={!!audioBlob}
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      Iniciar Gravação
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      variant="outline"
                      size="lg"
                      className="border-slate-300 dark:border-slate-600"
                    >
                      <MicOff className="h-5 w-5 mr-2" />
                      Parar Gravação
                    </Button>
                  )}

                  {audioBlob && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const audio = new Audio(audioUrl!);
                          audio.play();
                        }}
                        className="border-slate-300 dark:border-slate-600"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Reproduzir
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setAudioBlob(null);
                          setAudioUrl(null);
                          setTranscript("");
                        }}
                        className="border-slate-300 dark:border-slate-600"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Regravar
                      </Button>
                    </>
                  )}
                </div>

                {/* Transcrição em andamento */}
                {isTranscribing && (
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <p className="text-slate-600 dark:text-slate-300">
                        Transcrevendo áudio...
                      </p>
                    </div>
                  </div>
                )}

                {/* Transcrição */}
                {transcript && (
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 text-left">
                    <h4 className="text-slate-800 dark:text-white font-medium mb-2">
                      Transcrição:
                    </h4>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                      {transcript}
                    </p>
                  </div>
                )}

                {/* Botão avançar */}
                {audioBlob && !isTranscribing && (
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    {currentQuestionIndex === questions.length - 1 ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Finalizar Entrevista
                      </>
                    ) : (
                      <>
                        Próxima Pergunta
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </div>
  );
}
