import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuestionCard({ question, index }: any) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 mb-8">
      <CardHeader>
        <CardTitle className="text-slate-800 dark:text-white text-xl">
          Pergunta {index + 1}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed">
          {question?.content}
        </p>
      </CardContent>
    </Card>
  );
}
