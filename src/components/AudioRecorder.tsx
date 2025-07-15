import React, { useState, useRef } from "react";

const AudioRecorder = ({ onAnswer }: { onAnswer: (blob: Blob) => void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
      setAudioChunks((prev) => [...prev, event.data]);
    };
    recorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      onAnswer(blob);
      setAudioChunks([]);
    };
    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>
        Iniciar Gravação
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Parar Gravação
      </button>
      {isRecording && <p>Microfone ativo...</p>}
      <audio ref={audioRef} controls />
    </div>
  );
};

export default AudioRecorder;
