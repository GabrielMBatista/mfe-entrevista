import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterValues {
  candidateName?: string;
  score?: number;
  completedAt?: string;
  interviewType?: string;
  category?: string;
}

export interface InterviewType {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

interface InterviewFiltersProps {
  isOpen: boolean;
  filters: FilterValues;
  interviewTypes?: InterviewType[];
  categories?: Category[];
  onFilterChange: (key: keyof FilterValues, value: string | number) => void;
  onInterviewTypeChange?: (value: string) => Promise<void>;
  showScore?: boolean;
  showDate?: boolean;
  className?: string;
}

export const InterviewFilters: React.FC<InterviewFiltersProps> = ({
  isOpen,
  filters,
  interviewTypes = [],
  categories = [],
  onFilterChange,
  onInterviewTypeChange,
  showScore = true,
  showDate = true,
  className = "",
}) => {
  if (!isOpen) return null;

  const handleInterviewTypeChange = async (value: string) => {
    onFilterChange("interviewType", value);
    if (onInterviewTypeChange) {
      await onInterviewTypeChange(value);
    }
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}
    >
      <Input
        type="text"
        placeholder="Nome do Candidato"
        value={filters.candidateName || ""}
        onChange={(e) => onFilterChange("candidateName", e.target.value)}
        className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
      />

      {showScore && (
        <Input
          type="number"
          placeholder="Pontuação"
          value={filters.score || ""}
          onChange={(e) => onFilterChange("score", Number(e.target.value))}
          className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      )}

      {showDate && (
        <Input
          type="date"
          value={filters.completedAt || ""}
          onChange={(e) => onFilterChange("completedAt", e.target.value)}
          className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 w-auto"
        />
      )}

      <Select
        value={filters.category || ""}
        onValueChange={(value) => onFilterChange("category", value)}
      >
        <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.interviewType || ""}
        onValueChange={handleInterviewTypeChange}
      >
        <SelectTrigger className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
          <SelectValue placeholder="Tipo de Entrevista" />
        </SelectTrigger>
        <SelectContent>
          {interviewTypes.map((type) => (
            <SelectItem key={type.id} value={type.name}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
