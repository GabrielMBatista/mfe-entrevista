import {
  Invitation,
  Answer,
  InterviewSession,
  Question,
  InterviewType,
  Category,
  SessionSummary,
} from "@/types/types";
import emailjs from "@emailjs/browser";

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
  transcript: string,
  audioBlob: string
): Promise<Answer> {
  try {
    const formData = new FormData();
    formData.append("sessionId", sessionId);
    formData.append("questionId", questionId);
    formData.append("transcript", transcript);
    formData.append("audioBlob", audioBlob);

    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/answer`,
      {
        method: "POST",
        body: formData,
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
  interviewTypeId: string,
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<{ data: Category[]; total: number; page: number; limit: number }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories?interviewTypeId=${interviewTypeId}&page=${page}&limit=${limit}&search=${search}`
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

async function getQuestionsByCategory(
  categoryId: string,
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<{ data: Question[]; total: number; page: number; limit: number }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/questions?categoryId=${categoryId}&page=${page}&limit=${limit}&search=${search}`
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

async function fetchAllQuestions(
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<{ data: Question[]; total: number; page: number; limit: number }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/questions/all?page=${page}&limit=${limit}&search=${search}`
    );
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

async function finalizeSession(sessionId: string): Promise<Response> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/evaluate`,
      {
        method: "POST",
      }
    );

    return response;
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

async function fetchCompletedSessions({
  page = 1,
  limit = 10,
  startDate,
  endDate,
  sortBy = "completedAt",
  sortOrder = "desc",
}: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  data: SessionSummary[];
  total: number;
  page: number;
  limit: number;
}> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);
    queryParams.append("sortBy", sortBy);
    queryParams.append("sortOrder", sortOrder);

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

async function reEvaluateSession(sessionId: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/re-evaluate`,
      {
        method: "POST",
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao reenviar avaliação.");
    }
  } catch (error) {
    console.error("Erro em reEvaluateSession:", error);
    throw error;
  }
}

async function sendInvitationEmail(
  candidateEmail: string,
  candidateName: string,
  invitationId: string
): Promise<void> {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey || !API_BASE_URL) {
    throw new Error("Variáveis de ambiente do EmailJS/API estão ausentes.");
  }

  const invitationLink = `https://mfe-entrevista.vercel.app/invitations/${invitationId}`;

  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: candidateEmail,
        candidateName: candidateName,
        invitationLink: invitationLink,
      },
      publicKey
    );
  } catch (error) {
    console.error("Erro ao enviar email com EmailJS:", error);
    throw new Error("Erro ao enviar email.");
  }
}

async function saveQuestions(
  categoryId: string,
  questions: Question[]
): Promise<void> {
  try {
    const questionIds = questions.map((q) => q.id); // Extraindo apenas os IDs das perguntas
    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/questions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionIds }), // Enviando os IDs no formato correto
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao salvar perguntas.");
    }
  } catch (error) {
    console.error("Erro em saveQuestions:", error);
    throw error;
  }
}

async function removeQuestionFromCategory(
  categoryId: string,
  questionId: string
): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/questions/${questionId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao remover vínculo da pergunta com a categoria.");
    }
  } catch (error) {
    console.error("Erro em removeQuestionFromCategory:", error);
    throw error;
  }
}

async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Erro ao deletar categoria.");
    }
  } catch (error) {
    console.error("Erro em deleteCategory:", error);
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
  reEvaluateSession,
  sendInvitationEmail,
  saveQuestions,
  removeQuestionFromCategory,
  deleteCategory,
};
