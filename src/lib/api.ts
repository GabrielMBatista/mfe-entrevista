import {
  Invitation,
  Answer,
  InterviewSession,
  Question,
  InterviewType,
  Category,
} from "@/types/types";

// Funções

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

async function fetchInvitationById(invitationId: string): Promise<Invitation> {
  try {
    const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}`);
    if (!response.ok) {
      throw new Error("Erro ao buscar dados do convite.");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function createSession(
  invitationId: string,
  startTime: string
): Promise<InterviewSession> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invitationId, startTime }),
    });
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error("Já existe uma sessão para este convite.");
      }
      throw new Error("Erro ao criar sessão.");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro em createSession:", error);
    throw error;
  }
}

async function saveAnswer(
  sessionId: string,
  questionId: string,
  transcription: string // Salvar a transcrição do áudio
): Promise<Answer> {
  try {
    const response = await fetch(`/api/sessions/${sessionId}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId,
        transcription, // Enviar a transcrição como resposta
      }),
    });

    if (!response.ok) {
      throw new Error("Erro ao salvar resposta.");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na API saveAnswer:", error);
    throw error;
  }
}

async function getInvitation(invitationId: string): Promise<Invitation> {
  try {
    const res = await fetch(`${API_BASE_URL}/invitations/${invitationId}`);

    if (!res.ok) {
      throw new Error(`Erro ao buscar convite: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Erro em getInvitation:", error);
    throw error;
  }
}

async function getInterviewTypes(): Promise<InterviewType[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/interview-types`);
    if (!response.ok) {
      throw new Error("Erro ao buscar tipos de entrevista.");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro em getInterviewTypes:", error);
    throw error;
  }
}

async function getCategoriesByInterviewType(
  interviewTypeId: string
): Promise<Category[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories?interviewTypeId=${interviewTypeId}`
    );
    if (!response.ok) {
      throw new Error("Erro ao buscar categorias por tipo de entrevista.");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro em getCategoriesByInterviewType:", error);
    throw error;
  }
}

async function getQuestionsByCategory(categoryId: string): Promise<Question[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/questions?categoryId=${categoryId}`
    );
    if (!response.ok) {
      throw new Error("Erro ao buscar perguntas por categoria.");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro em getQuestionsByCategory:", error);
    throw error;
  }
}

async function fetchAllQuestions(): Promise<{ id: string; content: string }[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/all`);
    if (!response.ok) {
      throw new Error("Erro ao buscar todas as perguntas.");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro em fetchAllQuestions:", error);
    throw error;
  }
}

async function sendInvitation(
  candidateName: string,
  candidateEmail: string,
  categoryId: string
): Promise<{
  id: string;
  candidateName: string;
  candidateEmail: string;
  categoryId: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ candidateName, candidateEmail, categoryId }),
    });
    if (!response.ok) {
      throw new Error("Erro ao enviar convite.");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro em sendInvitation:", error);
    throw error;
  }
}

export {
  fetchInvitationById,
  createSession,
  saveAnswer,
  getInvitation,
  getInterviewTypes,
  getCategoriesByInterviewType,
  getQuestionsByCategory,
  fetchAllQuestions,
  sendInvitation,
};
