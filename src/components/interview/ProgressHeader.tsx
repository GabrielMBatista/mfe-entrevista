import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ProgressHeader({
  currentQuestionIndex,
  totalQuestions,
  progress,
}: any) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Entrevista - Desenvolvedor Frontend
        </h1>
        <Badge
          variant="outline"
          className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600"
        >
          {currentQuestionIndex + 1} de {totalQuestions}
        </Badge>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
