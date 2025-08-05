import React from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Play,
  RotateCcw,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

export default function RecordingControls({
  isRecording,
  audioBlob,
  audioUrl,
  transcript,
  audioLevel,
  isTranscribing,
  startRecording,
  stopRecording,
  handleNextQuestion,
  setAudioBlob,
  setAudioUrl,
  setTranscript,
}: any) {
  return (
    <div className="text-center space-y-6">
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

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
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
            className="border-slate-300 dark:border-slate-600 w-full sm:w-auto"
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
              className="border-slate-300 dark:border-green-600 text-slate-700 dark:text-green-400 hover:bg-slate-100 dark:hover:bg-green-900/20 w-full sm:w-auto"
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
              className="border-slate-300 dark:border-yellow-600 text-slate-700 dark:text-yellow-400 hover:bg-slate-100 dark:hover:bg-yellow-900/20 w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Regravar
            </Button>
          </>
        )}
      </div>

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

      {audioBlob && !isTranscribing && (
        <Button
          onClick={handleNextQuestion}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <ChevronRight className="h-5 w-5 ml-2" />
          Próxima Pergunta
        </Button>
      )}
    </div>
  );
}
