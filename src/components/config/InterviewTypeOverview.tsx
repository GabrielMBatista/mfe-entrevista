import React from "react";
import { FolderOpen, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InterviewTypeOverviewProps {
  currentInterviewType: {
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    categoryCount: number;
  };
  activeQuestions: number;
}

export default function InterviewTypeOverview({
  currentInterviewType,
  activeQuestions,
}: InterviewTypeOverviewProps) {
  return (
    <Card className="mb-8 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl bg-${currentInterviewType.color}-100 dark:bg-${currentInterviewType.color}-900`}
          >
            {currentInterviewType.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {currentInterviewType.name}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              {currentInterviewType.description}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <FolderOpen className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {currentInterviewType.categoryCount}
                </span>
                <span className="text-slate-500">categorias</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="h-4 w-4 text-green-600" />
                <span className="font-medium">{activeQuestions}</span>
                <span className="text-slate-500">perguntas ativas</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
