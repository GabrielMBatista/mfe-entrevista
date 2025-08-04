export type Question = {
  content: string;
  id: string;
  text: string;
  technologies: string[] | string; // Pode ser array ou string
  order: number;
  categoryId: string;
};

export type Answer = {
  id: string;
  transcript: string; // Transcrição da resposta
  question: string; // Ajustado para ser uma string diretamente
  audioBlob?: string | null; // Blob de áudio opcional
};

export type Session = {
  id: string;
  candidateName: string;
  score: number;
  completedAt: string;
  category: string;
  interviewType: string;
  summary: string;
  fullReport?: string; // JSON com campos {nivelDeConhecimento, comunicacao, pontosFortes[], pontosDeMelhoria[], potencialDeCrescimento}
  answers: { question: string; response: string }[];
};

export type SessionSummary = {
  id: string;
  candidateName?: string;
  score?: number;
  completedAt?: string;
  category?: string;
  interviewType?: string;
  summary?: string;
  fullReport?: string;
  answers?: { question: string; response: string }[]; // Ajustado para refletir o formato correto
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface Invitation {
  id: string;
  title: string;
  questions: Question[];
}

export interface InterviewSession {
  id: string;
  invitationId: string;
  startedAt: string;
}

export type InterviewType = {
  id: string;
  name: string;
  description: string;
};

export type Category = {
  id: string;
  name: string;
  interviewTypeId: string;
};
