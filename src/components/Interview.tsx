"use client";

import { useEffect, useState, useRef } from "react";
import {
  fetchInvitationById,
  createSession,
  transcribeAudio,
  fetchSessionSummary,
  updateTranscript,
  finalizeSession,
  saveAnswer,
} from "@/lib/api";
import { useRouter } from "next/router";
import { Question, SessionSummary } from "@/types/types";
import { FaMicrophone } from "react-icons/fa"; // Certifique-se de instalar react-icons

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
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0); // Estado para capturar o nível do áudio
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
      setIsMicrophoneActive(true); // Ativar indicador de microfone

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const level = Math.max(...dataArray) / 255; // Normalizar nível do áudio
        setAudioLevel(level);
        if (isMicrophoneActive) {
          requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();

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
        setIsMicrophoneActive(false); // Desativar indicador de microfone
        audioContext.close(); // Fechar contexto de áudio
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Erro ao iniciar gravação", e);
      setError("Não foi possível iniciar a gravação.");
      setIsMicrophoneActive(false); // Desativar indicador de microfone em caso de erro
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setIsMicrophoneActive(false); // Desativar indicador de microfone
  };

  const handleAnswerSubmit = async () => {
    if (!sessionId || !questions[currentQuestionIndex]) {
      console.log("Erro: Dados insuficientes para salvar resposta.");
      return;
    }

    setLoading(true);
    try {
      if (!audioBlob) {
        throw new Error("Erro: Nenhum áudio disponível para transcrição.");
      }
      const transcription = await transcribeAudio(audioBlob); // Ignorar o áudio
      console.log("Transcrição obtida:", transcription);

      await saveAnswer(
        sessionId,
        questions[currentQuestionIndex].id,
        transcription,
        "" // Ignorar o envio do áudio
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

      {isMicrophoneActive && (
        <div className="mt-4 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <FaMicrophone className="text-pink-500 text-2xl animate-pulse" />
            <span className="text-pink-500 font-semibold">
              Capturando áudio...
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            {[...Array(10)].map((_, index) => (
              <div
                key={index}
                className="w-2 h-6 bg-gradient-to-t from-blue-500 to-purple-500 rounded"
                style={{
                  transform: `scaleY(${audioLevel})`,
                  transition: "transform 0.1s",
                }}
              ></div>
            ))}
          </div>
        </div>
      )}

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

      <style jsx>{`
        @keyframes wave {
          0%,
          100% {
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1);
          }
        }
        .animate-wave {
          animation: wave infinite;
        }
      `}</style>
    </div>
  );
}
