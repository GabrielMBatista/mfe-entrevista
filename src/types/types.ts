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
  transcript: string;
  question: {
    id: string;
    content: string;
  };
  audioBlob: string | null;
};

export type SessionSummary = {
  id: string;
  answers: Answer[];
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
