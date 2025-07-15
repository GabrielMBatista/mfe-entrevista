import { Question, Answer } from "@/types/types";
import { useState, useRef } from "react";

type QuestionPlayerProps = {
  question: Question;
  onAnswer: (answer: Answer) => Promise<void>;
};

const QuestionPlayer = ({ question, onAnswer }: QuestionPlayerProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        audioChunksRef.current = []; // Limpa os chunks após o uso
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Erro ao acessar o microfone:", error);
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleAnswer = () => {
    if (!audioUrl) {
      alert("Por favor, grave um áudio antes de responder.");
      return;
    }

    const answer: Answer = {
      questionId: question.id,
      audioUrl,
    };
    onAnswer(answer);
  };

  return (
    <div>
      <h2>{question.text}</h2>
      {isRecording ? (
        <button onClick={stopRecording}>Parar Gravação</button>
      ) : (
        <button onClick={startRecording}>Iniciar Gravação</button>
      )}
      {audioUrl && <audio controls src={audioUrl}></audio>}
      <button onClick={handleAnswer} disabled={!audioUrl}>
        Responder
      </button>
    </div>
  );
};

export default QuestionPlayer;
