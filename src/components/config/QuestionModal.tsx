"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, Plus, Edit2, Code, Zap, CheckCircle2 } from "lucide-react";
import { Question, NewQuestion } from "@/types/types";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    question: Omit<Question, "id" | "createdAt" | "lastModified"> & {
      difficulty: "easy" | "medium" | "hard";
    }
  ) => void;
  question?: Question | null;
  categoryId?: string;
  isLoading?: boolean;
}

const CHAR_LIMIT = 500;

export default function QuestionModal({
  isOpen,
  onClose,
  onSave,
  question,
  categoryId,
  isLoading = false,
}: QuestionModalProps) {
  const [formData, setFormData] = useState({
    content: "",
    technologies: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    status: "active" as "active" | "draft" | "archived",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (question) {
      setFormData({
        content: question.content || question.text || "",
        technologies: question.technologies || "",
        difficulty: ["easy", "medium", "hard"].includes(question.difficulty)
          ? (question.difficulty as "easy" | "medium" | "hard")
          : "medium",
        status: "active",
      });
    } else {
      setFormData({
        content: "",
        technologies: "",
        difficulty: "medium",
        status: "active",
      });
    }
    setErrors({});
  }, [question, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim()) {
      newErrors.content = "O conteúdo da pergunta é obrigatório";
    } else if (formData.content.length < 10) {
      newErrors.content = "A pergunta deve ter pelo menos 10 caracteres";
    }

    if (formData.technologies && formData.technologies.length > 100) {
      newErrors.technologies = "Tecnologias não podem exceder 100 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onSave({
      content: formData.content.trim(),
      text: formData.content.trim(),
      technologies: formData.technologies.trim(),
      difficulty: formData.difficulty,
      status: formData.status,
      categoryId,
      order: 1,
    } as any);
  };

  const canSave =
    formData.content.trim().length >= 10 &&
    (!formData.technologies || formData.technologies.length <= 100) &&
    !isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[720px] w-[95vw] p-0 overflow-hidden bg-white dark:bg-slate-900">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <DialogTitle className="text-lg font-semibold">
            {question ? "Editar Pergunta" : "Nova Pergunta"}
          </DialogTitle>
        </DialogHeader>

        {/* Corpo do modal */}
        <div className="px-6 py-5 space-y-5">
          {/* Pergunta */}
          <div>
            <Label htmlFor="content" className="text-sm">
              Pergunta *
            </Label>
            <Textarea
              id="content"
              placeholder="Digite a pergunta que será feita durante a entrevista..."
              value={formData.content}
              onChange={(e) =>
                setFormData((s) => ({ ...s, content: e.target.value }))
              }
              maxLength={CHAR_LIMIT}
              aria-invalid={!!errors.content}
              aria-describedby={errors.content ? "content-error" : undefined}
              className={`mt-2 min-h-32 resize-y ${
                errors.content
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700"
              }`}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.content ? (
                <p id="content-error" className="text-xs text-red-500">
                  {errors.content}
                </p>
              ) : (
                <span className="text-xs text-transparent">.</span>
              )}
              <span className="text-xs text-slate-500">
                {formData.content.length}/{CHAR_LIMIT} caracteres
              </span>
            </div>
          </div>

          {/* Tecnologias */}
          <div>
            <Label htmlFor="technologies" className="text-sm">
              Tecnologias
            </Label>
            <Input
              id="technologies"
              placeholder="React, JavaScript, Node.js, etc."
              value={formData.technologies}
              onChange={(e) =>
                setFormData((s) => ({ ...s, technologies: e.target.value }))
              }
              aria-invalid={!!errors.technologies}
              aria-describedby={
                errors.technologies ? "tech-error" : "tech-help"
              }
              className={`mt-2 ${
                errors.technologies
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-slate-300 focus-visible:ring-slate-400 dark:border-slate-700"
              }`}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.technologies ? (
                <p id="tech-error" className="text-xs text-red-500">
                  {errors.technologies}
                </p>
              ) : (
                <p id="tech-help" className="text-xs text-slate-500">
                  Opcional. Máx. 100 caracteres.
                </p>
              )}
            </div>
          </div>

          {/* Dificuldade e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Dificuldade</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(v) =>
                  setFormData((s) => ({
                    ...s,
                    difficulty: v as "easy" | "medium" | "hard",
                  }))
                }
              >
                <SelectTrigger className="mt-2 border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) =>
                  setFormData((s) => ({
                    ...s,
                    status: v as "active" | "draft" | "archived",
                  }))
                }
              >
                <SelectTrigger className="mt-2 border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {question
              ? isLoading
                ? "Salvando..."
                : "Salvar"
              : isLoading
                ? "Criando..."
                : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
