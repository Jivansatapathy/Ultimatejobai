import { InterviewType } from "@/lib/interview-api";
import { cn } from "@/lib/utils";
import { Code2, Users, MessageSquare, GraduationCap } from "lucide-react";

interface InterviewTypeSelectorProps {
  selectedType: InterviewType | null;
  onSelect: (type: InterviewType) => void;
  disabled?: boolean;
}

const interviewTypes: {
  type: InterviewType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: "technical",  title: "Technical",  description: "Coding, system design, and problem-solving questions", icon: Code2 },
  { type: "behavioral", title: "Behavioral", description: "Situational and experience-based questions",            icon: Users },
  { type: "general",    title: "General",    description: "Mixed topics covering your background and goals",       icon: MessageSquare },
  { type: "mock",       title: "Mock",       description: "Practice run with varied questions",                   icon: GraduationCap },
];

export function InterviewTypeSelector({ selectedType, onSelect, disabled }: InterviewTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
      {interviewTypes.map(({ type, title, description, icon: Icon }) => (
        <div
          key={type}
          onClick={() => !disabled && onSelect(type)}
          className={cn(
            "bg-white border rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
            selectedType === type
              ? "border-teal-500 ring-2 ring-teal-500 shadow-md"
              : "border-gray-200 hover:border-teal-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "p-2 rounded-lg",
              selectedType === type ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      ))}
    </div>
  );
}
