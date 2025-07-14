export interface Question {
  content: any;
  createdAt: any;
  technologies: any;
  order: any;
  categoryId: any;
  id: string;
  text: string;
}

export interface Invitation {
  id: string;
  title: string;
  questions: Question[];
}

export interface Answer {
  questionId: string;
  audioUrl: string;
}

export interface InterviewSession {
  id: string;
  invitationId: string;
  startedAt: string;
}

export type InterviewType = {
  description: string;
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  interviewTypeId: string;
};
