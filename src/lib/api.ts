import {
  Invitation,
  Answer,
  InterviewSession,
  Question,
  InterviewType,
  Category,
  SessionSummary,
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

async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  try {
    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erro ao transcrever áudio.");
    }

    const data = await response.json();
    return data.transcription;
  } catch (error) {
    console.error("Erro na transcrição do áudio:", error);
    throw error;
  }
}

async function saveAnswer(
  sessionId: string,
  questionId: string,
  transcript: string
): Promise<Answer> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/answer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          questionId,
          transcript,
        }),
      }
    );

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

async function fetchSessionSummary(sessionId: string): Promise<SessionSummary> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/summary`
    );
    if (!response.ok) {
      throw new Error("Erro ao buscar resumo da sessão.");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro em fetchSessionSummary:", error);
    throw error;
  }
}

async function updateTranscript(
  sessionId: string,
  answerId: string,
  transcript: string
): Promise<Answer> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/answers/${answerId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao atualizar transcrição.");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro em updateTranscript:", error);
    throw error;
  }
}

async function finalizeSession(sessionId: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/evaluate`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao finalizar sessão.");
    }
  } catch (error) {
    console.error("Erro em finalizeSession:", error);
    throw error;
  }
}

async function completeSession(sessionId: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/complete`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao encerrar sessão.");
    }
  } catch (error) {
    console.error("Erro em completeSession:", error);
    throw error;
  }
}

async function fetchCompletedSessions(
  startDate?: string,
  endDate?: string,
  columns?: string[]
): Promise<any[]> {
  try {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    if (columns) queryParams.append("columns", columns.join(","));

    const response = await fetch(
      `${API_BASE_URL}/sessions/completed?${queryParams.toString()}`
    );
    if (!response.ok) {
      throw new Error("Erro ao buscar sessões concluídas.");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro em fetchCompletedSessions:", error);
    throw error;
  }
}

async function createCategory(
  interviewTypeId: string,
  name: string
): Promise<Category> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ interviewTypeId, name }),
    });
    if (!response.ok) {
      throw new Error("Erro ao criar categoria.");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro em createCategory:", error);
    throw error;
  }
}

async function createQuestion(data: {
  text: string;
  technologies: string;
  order: number;
  categoryId: string;
}): Promise<Question> {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Erro ao criar pergunta.");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro em createQuestion:", error);
    throw error;
  }
}

async function updateQuestion(data: {
  id: string;
  content?: string;
  technologies?: string;
  order?: number;
}): Promise<Question> {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Erro ao atualizar pergunta.");
    }
    return await response.json();
  } catch (error) {
    console.error("Erro em updateQuestion:", error);
    throw error;
  }
}

async function addQuestionToCategory(
  categoryId: string,
  questionId: string
): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/questions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionId }),
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao adicionar pergunta à categoria.");
    }
  } catch (error) {
    console.error("Erro em addQuestionToCategory:", error);
    throw error;
  }
}

export {
  fetchInvitationById,
  createSession,
  saveAnswer,
  transcribeAudio,
  getInvitation,
  getInterviewTypes,
  getCategoriesByInterviewType,
  getQuestionsByCategory,
  fetchAllQuestions,
  sendInvitation,
  fetchSessionSummary,
  updateTranscript,
  finalizeSession,
  completeSession,
  fetchCompletedSessions,
  createCategory,
  createQuestion,
  updateQuestion,
  addQuestionToCategory,
};
