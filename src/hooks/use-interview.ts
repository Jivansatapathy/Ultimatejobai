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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
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
        if (error.message.toLowerCase().includes("finished")) {
          toast({
            title: "Interview completed",
            description: "This interview has already ended. Please view your feedback.",
          });
        } else {
          toast({
            title: "Error",
            description: error.message || "An error occurred with your request.",
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
          interviewType: type,
          jobDescription: jobDescription || null,
          messages: [firstMessage],
          loading: false,
          questionCount: 0,
          minQuestions: response.min_questions || 0,
          maxQuestions: response.max_questions || 10,
        });
      } catch (error) {
        handleError(error);
      }
    },
    [handleError]
  );

  const startLocalInterview = useCallback(
    async (type: InterviewType, jobDescription?: string) => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const response = await api.startLocalInterview(type, jobDescription);
        const firstMessage: Message = {
          role: "interviewer",
          content: response.interviewer_message,
          timestamp: new Date(),
        };
        setState({
          ...initialState,
          sessionId: response.session_id,
          interviewType: type,
          jobDescription: jobDescription || null,
          messages: [firstMessage],
          loading: false,
          questionCount: response.question_count,
          minQuestions: response.min_questions,
          maxQuestions: response.max_questions,
        });
        setAudioUrl(response.interviewer_audio_url);
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
          setIsValid(true);
          setValidationFeedback(null);
        } finally {
          setIsValidating(false);
        }
      }, 800);
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

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, candidateMessage],
        loading: true,
      }));

      setIsTyping(true);

      try {
        const response = await api.sendMessage(state.sessionId, content);

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
          minQuestions: response.min_questions || prev.minQuestions,
          maxQuestions: response.max_questions || prev.maxQuestions,
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

  const submitLocalAnswer = useCallback(
    async (audioBlob: Blob) => {
      if (!state.sessionId || state.isFinished) return;

      setState((prev) => ({ ...prev, loading: true }));
      setIsTyping(true);

      try {
        const response = await api.processLocalAnswer(state.sessionId, audioBlob);

        const candidateMessage: Message = {
          role: "candidate",
          content: response.transcription,
          timestamp: new Date(),
        };

        const newMessages = [...state.messages, candidateMessage];

        if (response.status === "finished") {
          setState((prev) => ({
            ...prev,
            messages: newMessages,
            isFinished: true,
            loading: false,
          }));
        } else if (response.interviewer_message && response.interviewer_audio_url) {
          const interviewerMessage: Message = {
            role: "interviewer",
            content: response.interviewer_message,
            timestamp: new Date(),
          };

          setState((prev) => ({
            ...prev,
            messages: [...newMessages, interviewerMessage],
            questionCount: response.question_count || prev.questionCount,
            loading: false,
          }));
          setAudioUrl(response.interviewer_audio_url);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setIsTyping(false);
      }
    },
    [state.sessionId, state.isFinished, state.messages, handleError]
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
    setAudioUrl(null);
    setIsRenderingVideo(false);
  }, []);

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
          description: response.logs?.[response.logs.length - 1] || "Unknown error",
        });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsRenderingVideo(false);
    }
  }, [state.sessionId, handleError]);

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
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }, [state]);

  return {
    state,
    isTyping,
    isValidating,
    isValid,
    validationFeedback,
    videoUrl,
    audioUrl,
    isRenderingVideo,
    messagesEndRef,
    validateMessage,
    sendMessage,
    submitLocalAnswer,
    startInterview,
    startLocalInterview,
    getFeedback,
    resetInterview,
    renderVideo,
    exportTranscript,
  };
}
