export const calculateScoreDistribution = (sessions: any[]) => {
  return {
    poor: sessions.filter((s) => s.score < 40).length,
    low: sessions.filter((s) => s.score >= 40 && s.score < 60).length,
    medium: sessions.filter((s) => s.score >= 60 && s.score < 80).length,
    excellent: sessions.filter((s) => s.score >= 80).length,
  };
};

export const calculateAverageScoresByDate = (sessions: any[]) => {
  const groupedByDate: { [key: string]: number[] } = {};
  sessions.forEach((session) => {
    const date = new Date(session.completedAt).toLocaleDateString("pt-BR");
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date].push(session.score);
  });

  return Object.entries(groupedByDate).map(([date, scores]) => ({
    date,
    average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
  }));
};

export const calculateTechnicalCriteriaAverages = (sessions: any[]) => {
  const criteria: { [key: string]: number[] } = {};
  sessions.forEach((session) => {
    const report = session.fullReport ? JSON.parse(session.fullReport) : null;
    if (report) {
      Object.entries(report).forEach(([key, value]) => {
        if (!criteria[key]) criteria[key] = [];
        if (typeof value === "number") criteria[key].push(value);
      });
    }
  });

  return Object.entries(criteria).map(([key, values]) => ({
    key,
    average: values.reduce((sum, value) => sum + value, 0) / values.length,
  }));
};

export const calculateStrengthsVsImprovements = (sessions: any[]) => {
  let strengths = 0;
  let improvements = 0;

  sessions.forEach((session) => {
    const report = session.fullReport ? JSON.parse(session.fullReport) : null;
    if (report) {
      strengths += report.pontosFortes?.length || 0;
      improvements += report.pontosDeMelhoria?.length || 0;
    }
  });

  return { strengths, improvements };
};

export const calculateInterviewFunnelData = (sessions: any[]) => {
  return {
    sent: sessions.length,
    started: sessions.filter((s) => s.answers.length > 0).length,
    completed: sessions.filter((s) => s.score > 0).length,
    abandoned: sessions.filter((s) => s.score === 0 && s.answers.length > 0)
      .length,
    rejected: sessions.filter((s) => s.score < 40).length,
    approved: sessions.filter((s) => s.score >= 80).length,
  };
};

export const calculateCompletionRateByType = (sessions: any[]) => {
  const groupedByType: Record<string, { total: number; completed: number }> =
    {};

  sessions.forEach((session) => {
    const type = session.interviewType;
    if (!groupedByType[type]) groupedByType[type] = { total: 0, completed: 0 };
    groupedByType[type].total += 1;
    if (session.score > 0) groupedByType[type].completed += 1;
  });

  return Object.entries(groupedByType).map(([type, data]) => ({
    type,
    completionRate: (data.completed / data.total) * 100,
  }));
};

export const calculateAverageTimeByLevel = (sessions: any[]) => {
  const groupedByLevel: Record<string, { totalTime: number; count: number }> =
    {};

  sessions.forEach((session) => {
    const level = session.category;
    const startTime = new Date(session.completedAt).getTime() - 3600000; // Exemplo: 1h antes de completedAt
    const duration =
      (new Date(session.completedAt).getTime() - startTime) / 60000; // Duração em minutos
    if (!groupedByLevel[level])
      groupedByLevel[level] = { totalTime: 0, count: 0 };
    groupedByLevel[level].totalTime += duration;
    groupedByLevel[level].count += 1;
  });

  return Object.entries(groupedByLevel).map(([level, data]) => ({
    level,
    averageTime: data.totalTime / data.count,
  }));
};

export const calculateInterviewsByStatusOverTime = (sessions: any[]) => {
  const groupedByDate: Record<
    string,
    { sent: number; completed: number; abandoned: number; rejected: number }
  > = {};

  sessions.forEach((session) => {
    const date = new Date(session.completedAt).toLocaleDateString("pt-BR");
    if (!groupedByDate[date]) {
      groupedByDate[date] = {
        sent: 0,
        completed: 0,
        abandoned: 0,
        rejected: 0,
      };
    }
    groupedByDate[date].sent += 1;
    if (session.score > 0) groupedByDate[date].completed += 1;
    if (session.score === 0 && session.answers.length > 0)
      groupedByDate[date].abandoned += 1;
    if (session.score < 40) groupedByDate[date].rejected += 1;
  });

  return Object.entries(groupedByDate).map(([date, statuses]) => ({
    date,
    ...statuses,
  }));
};
