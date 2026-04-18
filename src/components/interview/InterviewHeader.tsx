import { InterviewType } from "@/lib/interview-api";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { InterviewProgress } from "./InterviewProgress";
import { cn } from "@/lib/utils";
import { Code2, Users, MessageSquare, GraduationCap, BadgeDollarSign, Sparkles } from "lucide-react";

interface InterviewHeaderProps {
  interviewType: InterviewType;
  questionCount: number;
  maxQuestions: number;
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

const typeIcons: Record<InterviewType, React.ComponentType<{ className?: string }>> = {
  technical: Code2,
  behavioral: Users,
  general: MessageSquare,
  mock: GraduationCap,
  salary_negotiation: BadgeDollarSign,
  career_advice: Sparkles,
};

const typeLabels: Record<InterviewType, string> = {
  technical: "Technical Interview",
  behavioral: "Behavioral Interview",
  general: "General Interview",
  mock: "Mock Interview",
  salary_negotiation: "Salary Negotiation",
  career_advice: "Career Advice",
};

export function InterviewHeader({
  interviewType,
  questionCount,
  maxQuestions,
  theme,
  onThemeToggle,
}: InterviewHeaderProps) {
  const Icon = typeIcons[interviewType];

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className={cn("gap-1.5 capitalize")}>
          <Icon className="h-3.5 w-3.5" />
          {typeLabels[interviewType]}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <InterviewProgress current={questionCount} max={maxQuestions} />
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>
    </div>
  );
}
