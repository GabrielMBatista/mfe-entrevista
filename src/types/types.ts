export type Question = {
  text: string;
  difficulty: string;
  id: string;
  content: string;
  technologies: string; // String única, conforme o novo formato
  createdAt: string;
  updatedAt: string;
  // Novos/compatíveis com UI
  categoryId?: string;
  status?: "active" | "draft" | "archived";
  lastModified?: string;
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
  answers: Array<{
    question: string;
    response?: string; // Tornar opcional para compatibilidade
    id?: string; // Adicionar propriedades opcionais
    transcript?: string;
    audioBlob?: string | null;
  }>;
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

export interface Category {
  id: string;
  name: string;
  interviewTypeId: string;
  questionCount: number; // Adicionado
  questionIds: string[]; // Adicionado
}

export type NewQuestion = {
  content: string;
  technologies: string;
  difficulty: string;
};

export interface QuestionsManagerProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  allQuestions: Question[];
  newQuestion: NewQuestion;
  selectedCategory: string;
  setNewQuestion: React.Dispatch<React.SetStateAction<NewQuestion>>;
  editingQuestion: string | null;
  setEditingQuestion: React.Dispatch<React.SetStateAction<string | null>>;
  editContent: string;
  setEditContent: React.Dispatch<React.SetStateAction<string>>;
  handleCreateQuestion: () => void;
  handleUpdateQuestion: (
    questionId: string,
    updatedContent: string,
    updatedTechnologies: string
  ) => void;
  handleRemoveQuestion: (questionId: string) => void;
  handleSaveQuestions: () => void;
  addExistingQuestion: (questionId: string) => void;
  handleRemoveQuestionFromCategory: (questionId: string) => void;
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    search: string;
    setPage: (page: number) => void;
    setSearch: (search: string) => void;
  };
}
