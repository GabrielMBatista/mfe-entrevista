import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Volume2 } from "lucide-react";

export default function Summary({
  fontFamily,
  sessionSummary,
  editingAnswerId,
  editTranscript,
  setEditingAnswerId,
  setEditTranscript,
  handleEditTranscript,
  handleFinalizeSession,
}: any) {
  return (
    <div
      style={{ fontFamily }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900"
    >
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-white flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Resumo da Entrevista
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400">
              Revise suas respostas antes de finalizar a sessão
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {sessionSummary.answers.map((answer: any, index: number) => (
              <div
                key={answer.id}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Badge
                      variant="outline"
                      className="mb-2 border-slate-300 dark:border-slate-600"
                    >
                      Pergunta {index + 1}
                    </Badge>
                    <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">
                      {answer.question.content}
                    </p>
                  </div>
                  {answer.audioBlob && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const audio = new Audio(answer.audioBlob!);
                        audio.play();
                      }}
                      className="ml-4 border-slate-300 dark:border-slate-600"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {editingAnswerId === answer.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editTranscript}
                      onChange={(e) => setEditTranscript(e.target.value)}
                      className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditTranscript(answer.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Salvar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingAnswerId(null);
                          setEditTranscript("");
                        }}
                        className="border-slate-300 dark:border-slate-600"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-800 dark:text-slate-200 mb-3 leading-relaxed">
                      {answer.transcript}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingAnswerId(answer.id);
                        setEditTranscript(answer.transcript);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Editar transcrição
                    </Button>
                  </div>
                )}
              </div>
            ))}

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                onClick={handleFinalizeSession}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Finalizar Sessão
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
