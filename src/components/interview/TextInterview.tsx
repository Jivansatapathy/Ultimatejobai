import { useInterview } from "@/hooks/use-interview";
import { useHealthCheck } from "@/hooks/use-health-check";
import { AIStatusBadge } from "@/components/interview/AIStatusBadge";
import { InterviewTypeSelector } from "@/components/interview/InterviewTypeSelector";
import { InterviewHeader } from "@/components/interview/InterviewHeader";
import { ChatMessage } from "@/components/interview/ChatMessage";
import { ChatInput } from "@/components/interview/ChatInput";
import { TypingIndicator } from "@/components/interview/TypingIndicator";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InterviewType } from "@/lib/interview-api";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";

type ExperienceLevel = "junior" | "mid" | "senior" | "lead";

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; years: string }[] = [
    { value: "junior", label: "Junior", years: "0–2 yrs" },
    { value: "mid", label: "Mid-Level", years: "2–5 yrs" },
    { value: "senior", label: "Senior", years: "5–8 yrs" },
    { value: "lead", label: "Lead / Principal", years: "8+ yrs" },
];

export const TextInterview = ({ onBack, initialJobDescription = "" }: { onBack: () => void, initialJobDescription?: string }) => {
    const { isHealthy, isChecking } = useHealthCheck();
    const {
        state,
        isTyping,
        isValidating,
        isValid,
        validationFeedback,
        messagesEndRef,
        startInterview,
        sendMessage,
        validateMessage,
        getFeedback,
        resetInterview,
        exportTranscript,
    } = useInterview();

    const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
    const [targetRole, setTargetRole] = useState("");
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
    const [jobDescription, setJobDescription] = useState(initialJobDescription);
    const [isStarting, setIsStarting] = useState(false);

    const canStart = !!selectedType && !!targetRole.trim() && !!experienceLevel && isHealthy !== false && !isStarting;

    const handleStart = async () => {
        if (!canStart) return;
        setIsStarting(true);
        await startInterview(selectedType!, jobDescription, targetRole.trim(), experienceLevel!);
        setIsStarting(false);
    };

    const handleRestart = () => {
        resetInterview();
        setSelectedType(null);
        setTargetRole("");
        setExperienceLevel(null);
        setJobDescription("");
    };

    const handleBack = () => {
        if (state.sessionId && state.messages.length > 0) {
            if (!window.confirm("Leave this interview? Your current session will be lost.")) return;
        }
        onBack();
    };

    // Landing screen - before interview starts
    if (!state.sessionId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={handleBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="p-2 rounded-xl bg-primary">
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-xl font-semibold">Text Interview Setup</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <AIStatusBadge isHealthy={isHealthy} isChecking={isChecking} />
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
                    <div className="text-center space-y-3 max-w-lg">
                        <h2 className="text-3xl font-bold tracking-tight">Set Up Your Interview</h2>
                        <p className="text-muted-foreground text-lg">
                            Tell us the role and your level so we can tailor question difficulty.
                        </p>
                    </div>

                    {/* Target role + experience level */}
                    <div className="w-full max-w-lg space-y-5">
                        {/* Target Job Role */}
                        <div className="space-y-2">
                            <Label htmlFor="targetRole" className="text-sm font-medium">
                                Target Job Role <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="targetRole"
                                placeholder="e.g. Senior Frontend Engineer, Product Manager…"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                disabled={isStarting}
                                className="rounded-xl"
                            />
                        </div>

                        {/* Experience Level */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Experience Level <span className="text-destructive">*</span>
                            </Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {EXPERIENCE_LEVELS.map(({ value, label, years }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => !isStarting && setExperienceLevel(value)}
                                        disabled={isStarting}
                                        className={cn(
                                            "flex flex-col items-center py-3 px-2 rounded-xl border text-sm font-medium transition-all",
                                            experienceLevel === value
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground",
                                            isStarting && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <span>{label}</span>
                                        <span className="text-[10px] font-normal opacity-70 mt-0.5">{years}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Interview type */}
                    <InterviewTypeSelector
                        selectedType={selectedType}
                        onSelect={setSelectedType}
                        disabled={isStarting}
                    />

                    {/* Job Description (optional) */}
                    <div className="w-full max-w-lg space-y-2">
                        <Label htmlFor="jd" className="text-sm font-medium">
                            Job Description <span className="text-muted-foreground font-normal">(Optional)</span>
                        </Label>
                        <Textarea
                            id="jd"
                            placeholder="Paste the job description here to further tailor the questions…"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            disabled={isStarting}
                            className="min-h-[100px] resize-none rounded-xl"
                        />
                    </div>

                    <Button
                        onClick={handleStart}
                        disabled={!canStart}
                        size="lg"
                        className="mt-2 px-8 gap-2"
                    >
                        {isStarting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Starting Interview...
                            </>
                        ) : (
                            "Start Text Interview"
                        )}
                    </Button>

                    {!targetRole.trim() || !experienceLevel ? (
                        <p className="text-xs text-muted-foreground -mt-4">
                            Fill in your target role and experience level to continue.
                        </p>
                    ) : isHealthy === false ? (
                        <p className="text-sm text-destructive">
                            AI service is currently unavailable. Please try again later.
                        </p>
                    ) : null}
                </main>
            </div>
        );
    }

    // Interview chat screen
    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            {/* Interview header */}
            <div className="flex items-center px-4 relative flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={handleBack} className="absolute left-4 top-4 z-10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="w-full pl-12">
                    <InterviewHeader
                        interviewType={state.interviewType!}
                        questionCount={state.questionCount}
                        maxQuestions={state.maxQuestions}
                    />
                </div>
            </div>

            {/* Chat area */}
            <ScrollArea className="flex-1 min-h-0">
                <div className="max-w-3xl mx-auto p-4 space-y-4">
                    {state.messages.map((message, index) => (
                        <ChatMessage key={index} message={message} />
                    ))}
                    {isTyping && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input or feedback area */}
            {state.isFinished ? (
                <FeedbackPanel
                    feedback={state.feedback}
                    isLoading={state.loading}
                    onGetFeedback={getFeedback}
                    onExportTranscript={exportTranscript}
                    onRestart={handleRestart}
                />
            ) : (
                <div className="max-w-3xl mx-auto w-full">
                    <ChatInput
                        onSend={sendMessage}
                        onTextChange={validateMessage}
                        disabled={state.isFinished}
                        isLoading={state.loading}
                        isValidating={isValidating}
                        isValid={isValid}
                        feedback={validationFeedback}
                        placeholder="Type your answer and press Enter to send..."
                    />
                </div>
            )}
        </div>
    );
};
