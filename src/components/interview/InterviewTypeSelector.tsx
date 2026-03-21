import { InterviewType } from "@/lib/interview-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    {
      type: "technical",
      title: "Technical",
      description: "Coding, system design, and problem-solving questions",
      icon: Code2,
    },
    {
      type: "behavioral",
      title: "Behavioral",
      description: "Situational and experience-based questions",
      icon: Users,
    },
    {
      type: "general",
      title: "General",
      description: "Mixed topics covering your background and goals",
      icon: MessageSquare,
    },
    {
      type: "mock",
      title: "Mock",
      description: "Practice run with varied questions",
      icon: GraduationCap,
    },
    {
      type: "salary_negotiation",
      title: "Salary Negotiation",
      description: "Practice negotiating salary and benefits",
      icon: MessageSquare,
    },
    {
      type: "career_advice",
      title: "Career Advice",
      description: "Strategic planning and career growth session",
      icon: GraduationCap,
    },
  ];

export function InterviewTypeSelector({
  selectedType,
  onSelect,
  disabled,
}: InterviewTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
      {interviewTypes.map(({ type, title, description, icon: Icon }) => (
        <Card
          key={type}
          onClick={() => !disabled && onSelect(type)}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50",
            selectedType === type && "ring-2 ring-primary border-primary shadow-md",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  selectedType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm">{description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
