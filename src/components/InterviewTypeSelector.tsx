"use client";

import { InterviewType } from "@/types/types";

interface InterviewTypeSelectorProps {
  interviewTypes: InterviewType[];
  selectedType: string | null;
  onSelectType: (typeId: string) => void;
}

export default function InterviewTypeSelector({
  interviewTypes,
  selectedType,
  onSelectType,
}: InterviewTypeSelectorProps) {
  return (
    <div className="flex gap-4 mt-4">
      {interviewTypes.map((type) => (
        <button
          key={type.id}
          className={`px-4 py-2 ${
            selectedType === type.id ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => onSelectType(type.id)}
        >
          {type.name}
        </button>
      ))}
    </div>
  );
}
