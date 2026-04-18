import { useInterview } from "@/hooks/use-interview";
import { useHealthCheck } from "@/hooks/use-health-check";
import { useTheme } from "@/hooks/use-theme";
import { AIStatusBadge } from "@/components/interview/AIStatusBadge";
import { InterviewTypeSelector } from "@/components/interview/InterviewTypeSelector";
import { InterviewHeader } from "@/components/interview/InterviewHeader";
import { ChatMessage } from "@/components/interview/ChatMessage";
import { ChatInput } from "@/components/interview/ChatInput";
import { TypingIndicator } from "@/components/interview/TypingIndicator";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";
import { ThemeToggle } from "@/components/interview/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { InterviewType } from "@/lib/interview-api";
import { useState } from "react";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { activityService } from "@/services/activityService";

export const TextInterview = ({ onBack, initialJobDescription = "" }: { onBack: () => void, initialJobDescription?: string }) => {
    const { isHealthy, isChecking } = useHealthCheck();
    const { theme, toggleTheme } = useTheme();
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
    const [jobDescription, setJobDescription] = useState(initialJobDescription);
    const [isStarting, setIsStarting] = useState(false);

    const handleStart = async () => {
        if (!selectedType || !isHealthy) return;
        setIsStarting(true);
        await startInterview(selectedType, jobDescription);
        activityService.logActivity({
            activity_type: 'INTERVIEW',
            description: `Started Text ${selectedType} interview`,
            metadata: { type: selectedType, jobDescription: jobDescription.substring(0, 100) }
        });
        setIsStarting(false);
    };

    const handleRestart = () => {
        resetInterview();
        setSelectedType(null);
        setJobDescription("");
    };

    // Landing screen - before interview starts
    if (!state.sessionId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="p-2 rounded-xl bg-primary">
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-xl font-semibold">Text Interview Setup</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <AIStatusBadge isHealthy={isHealthy} isChecking={isChecking} />
                        <ThemeToggle theme={theme} onToggle={toggleTheme} />
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
                    <div className="text-center space-y-3 max-w-lg">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Ready to Practice Typing?
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Select an interview type below and begin your text-based AI practice session.
                        </p>
                    </div>

                    <InterviewTypeSelector
                        selectedType={selectedType}
                        onSelect={setSelectedType}
                        disabled={isStarting}
                    />

                    <div className="w-full max-w-lg space-y-2">
                        <Label htmlFor="jd" className="text-sm font-medium">
                            Job Description (Optional)
                        </Label>
                        <Textarea
                            id="jd"
                            placeholder="Paste the job description here to help the AI tailor the questions..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            disabled={isStarting}
                            className="min-h-[120px] resize-none rounded-xl"
                        />
                    </div>

                    <Button
                        onClick={handleStart}
                        disabled={!selectedType || !isHealthy || isStarting}
                        size="lg"
                        className="mt-4 px-8 gap-2"
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

                    {isHealthy === false && (
                        <p className="text-sm text-destructive">
                            AI service is currently unavailable. Please try again later.
                        </p>
                    )}
                </main>
            </div>
        );
    }

    // Interview chat screen
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Interview header */}
            <div className="flex items-center px-4 relative">
                <Button variant="ghost" size="icon" onClick={onBack} className="absolute left-4 top-4 z-10">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="w-full pl-12">
                    <InterviewHeader
                        interviewType={state.interviewType!}
                        questionCount={state.questionCount}
                        maxQuestions={state.maxQuestions}
                        theme={theme}
                        onThemeToggle={toggleTheme}
                    />
                </div>
            </div>

            {/* Chat area */}
            <ScrollArea className="flex-1">
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
