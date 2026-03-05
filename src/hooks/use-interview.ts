import { useState, useCallback, useEffect, useRef } from "react";
import { api, InterviewState, InterviewType, Message, ApiError } from "@/lib/interview-api";
import { toast } from "@/hooks/use-toast";

const initialState: InterviewState = {
  sessionId: null,
  interviewType: null,
  jobDescription: null,
  messages: [],
  questionCount: 0,
  minQuestions: 0,
  maxQuestions: 10,
  isFinished: false,
  loading: false,
  feedback: null,
};

export function useInterview() {
  const [state, setState] = useState<InterviewState>(initialState);
  const [isTyping, setIsTyping] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationFeedback, setValidationFeedback] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, scrollToBottom]);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        toast({
          variant: "destructive",
          title: "Session not found",
          description: "Your interview session has expired. Please start a new interview.",
        });
        setState(initialState);
      } else if (error.status === 400) {
        if (error.message.includes("finished")) {
          toast({
            title: "Interview completed",
            description: "This interview has already ended. Please view your feedback.",
          });
        } else {
          // Instead of just a toast, let's add an interviewer message to the chat
          const validationMessage: Message = {
            role: "interviewer",
            content: "I'm sorry, but I'll need a bit more detail in your response to properly evaluate it. Could you please expand on that?",
            timestamp: new Date(),
          };

          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, validationMessage],
            loading: false,
          }));

          toast({
            title: "More detail needed",
            description: "Please provide a more comprehensive answer.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: "Please try again in a moment.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Unable to reach the server. Please check your connection.",
      });
    }
    setState((prev) => ({ ...prev, loading: false }));
  }, []);

  const startInterview = useCallback(
    async (type: InterviewType, jobDescription?: string) => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const response = await api.startInterview(type, jobDescription);
        const firstMessage: Message = {
          role: "interviewer",
          content: response.interviewer_message,
          timestamp: new Date(),
        };
        setState({
          ...initialState,
          sessionId: response.session_id,
          interviewType: response.interview_type,
          jobDescription: response.job_description || jobDescription || null,
          messages: [firstMessage],
          loading: false,
        });
      } catch (error) {
        handleError(error);
      }
    },
    [handleError]
  );

  const validateMessage = useCallback(
    async (content: string) => {
      if (!state.sessionId || !content.trim()) {
        setIsValid(null);
        setValidationFeedback(null);
        return;
      }

      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      validationTimeoutRef.current = setTimeout(async () => {
        setIsValidating(true);
        try {
          const response = await api.validateResponse(state.sessionId!, content);
          setIsValid(response.is_valid);
          setValidationFeedback(response.suggestions || response.message || null);
        } catch (error) {
          console.error("Validation error:", error);
          // On error, we default to valid to not block the user if the validation service is down
          setIsValid(true);
          setValidationFeedback(null);
        } finally {
          setIsValidating(false);
        }
      }, 800); // 800ms debounce
    },
    [state.sessionId]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!state.sessionId || state.isFinished || !content.trim()) return;

      const candidateMessage: Message = {
        role: "candidate",
        content: content.trim(),
        timestamp: new Date(),
      };

      setIsValid(null);
      setValidationFeedback(null);

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, candidateMessage],
        loading: true,
      }));

      setIsTyping(true);

      try {
        const response = await api.sendMessage(state.sessionId, content);

        // Simulate a brief typing delay for natural feel
        await new Promise((resolve) => setTimeout(resolve, 500));

        const interviewerMessage: Message = {
          role: "interviewer",
          content: response.interviewer_message,
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, interviewerMessage],
          questionCount: response.question_count,
          minQuestions: response.min_questions,
          maxQuestions: response.max_questions,
          isFinished: response.is_finished,
          loading: false,
        }));
      } catch (error) {
        handleError(error);
      } finally {
        setIsTyping(false);
      }
    },
    [state.sessionId, state.isFinished, handleError]
  );

  const getFeedback = useCallback(async () => {
    if (!state.sessionId) return;

    setState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await api.getFeedback(state.sessionId);
      setState((prev) => ({
        ...prev,
        feedback: response.feedback,
        loading: false,
      }));
    } catch (error) {
      handleError(error);
    }
  }, [state.sessionId, handleError]);

  const resetInterview = useCallback(() => {
    setState(initialState);
    setVideoUrl(null);
    setIsRenderingVideo(false);
  }, []);

  const exportTranscript = useCallback(() => {
    if (state.messages.length === 0) return;

    const transcript = state.messages
      .map((msg) => {
        const time = msg.timestamp.toLocaleTimeString();
        const role = msg.role === "interviewer" ? "Interviewer" : "You";
        return `[${time}] ${role}: ${msg.content}`;
      })
      .join("\n\n");

    const header = `AI Interview Transcript\nType: ${state.interviewType}\nDate: ${new Date().toLocaleDateString()}\n${"=".repeat(50)}\n\n`;
    const footer = state.feedback
      ? `\n\n${"=".repeat(50)}\nFeedback:\n${state.feedback}`
      : "";

    const blob = new Blob([header + transcript + footer], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-transcript-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Transcript exported",
      description: "Your interview transcript has been downloaded.",
    });
  }, [state.messages, state.interviewType, state.feedback]);

  const renderVideo = useCallback(async () => {
    if (!state.sessionId) return;
    setIsRenderingVideo(true);
    toast({
      title: "Rendering video…",
      description: "This may take 3–10 minutes. Please keep this tab open.",
    });
    try {
      const response = await api.renderVideo(state.sessionId, true);
      if (response.status === "done" && response.video_url) {
        setVideoUrl(response.video_url);
        toast({ title: "Video ready!", description: "Your interview video has been rendered." });
      } else {
        toast({
          variant: "destructive",
          title: "Video rendering failed",
          description: response.logs?.at(-1) || "Unknown error",
        });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsRenderingVideo(false);
    }
  }, [state.sessionId, handleError]);

  return {
    state,
    isTyping,
    isValidating,
    isValid,
    validationFeedback,
    videoUrl,
    isRenderingVideo,
    messagesEndRef,
    startInterview,
    sendMessage,
    validateMessage,
    getFeedback,
    renderVideo,
    resetInterview,
    exportTranscript,
  };
}
