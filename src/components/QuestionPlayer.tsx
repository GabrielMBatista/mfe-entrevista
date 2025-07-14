import { Question, Answer } from "@/types/types";

type QuestionPlayerProps = {
  question: Question;
  onAnswer: (answer: Answer) => Promise<void>;
};

const QuestionPlayer = ({ question, onAnswer }: QuestionPlayerProps) => {
  const handleAnswer = () => {
    const answer: Answer = {
      questionId: question.id,
      audioUrl: "example-audio-url", // Substituir pela lógica real
    };
    onAnswer(answer);
  };

  return (
    <div>
      <h2>{question.text}</h2>
      {/* Implementação do player */}
      <button onClick={handleAnswer}>Responder</button>
    </div>
  );
};

export default QuestionPlayer;
