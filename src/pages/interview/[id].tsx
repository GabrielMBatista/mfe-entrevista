import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import QuestionPlayer from "@/components/QuestionPlayer";
import { fetchInvitationById, saveAnswer, createSession } from "@/lib/api";
import { Invitation, Answer } from "@/types/types";

const Spinner = () => <div>Carregando...</div>; // Placeholder caso ainda não tenha um componente

const InterviewPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id === "string") {
      fetchInvitationById(id)
        .then((data) => {
          setInvitation(data);
        })
        .catch(() => {
          alert("Erro ao carregar os dados do convite.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleAnswer = async (answer: Answer) => {
    const updatedAnswers = [...answers, answer];
    setAnswers(updatedAnswers);

    try {
      if (!sessionId) {
        const session = await createSession(invitation!.id);
        setSessionId(session.id);
        await saveAnswer(session.id, answer.questionId, answer.audioUrl);
      } else {
        await saveAnswer(sessionId, answer.questionId, answer.audioUrl);
      }

      const nextIndex = currentQuestionIndex + 1;
      if (invitation && nextIndex < invitation.questions.length) {
        setCurrentQuestionIndex(nextIndex);
      } else if (sessionId) {
        router.push(`/result-summary/${sessionId}`);
      }
    } catch (err) {
      console.error("Erro ao salvar resposta:", err);
      alert("Erro ao salvar resposta.");
    }
  };

  if (loading) return <Spinner />;
  if (!invitation) return <div>Convite não encontrado.</div>;

  return (
    <div>
      <h1>{invitation.title}</h1>
      <QuestionPlayer
        question={invitation.questions[currentQuestionIndex]}
        onAnswer={handleAnswer}
      />
    </div>
  );
};

export default InterviewPage;
