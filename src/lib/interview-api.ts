import { API_BASE_URL } from "../config";

const BASE_URL = API_BASE_URL;

export type InterviewType = "technical" | "behavioral" | "general" | "mock";

export interface Message {
  role: "interviewer" | "candidate";
  content: string;
  timestamp: Date;
}

export interface InterviewState {
  sessionId: string | null;
  interviewType: InterviewType | null;
  jobDescription: string | null;
  messages: Message[];
  questionCount: number;
  minQuestions: number;
  maxQuestions: number;
  isFinished: boolean;
  loading: boolean;
  feedback: string | null;
}

export interface HealthResponse {
  status: string;
}

export interface StartInterviewResponse {
  session_id: string;
  interview_type: InterviewType;
  job_description?: string;
  interviewer_message: string;
}

export interface ChatResponse {
  interviewer_message: string;
  question_count: number;
  min_questions: number;
  max_questions: number;
  is_finished: boolean;
}

export interface FeedbackResponse {
  feedback: string;
}

export interface RenderVideoResponse {
  session_id: string;
  video_url: string;
  status: "done" | "error";
  logs: string[];
  shotstack_render_id?: string;
}

export interface SessionResponse {
  session_id: string;
  type: InterviewType;
  job_description?: string;
  question_count: number;
  history: any[];
}

export interface ValidationResponse {
  is_valid: boolean;
  message?: string;
  suggestions?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || errorData.message || "An error occurred"
    );
  }
  return response.json();
}

export const api = {
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await handleResponse<HealthResponse>(response);
      return data.status === "ok" || response.ok;
    } catch {
      return false;
    }
  },

  async startInterview(interviewType: InterviewType, jobDescription?: string): Promise<StartInterviewResponse> {
    const response = await fetch(`${BASE_URL}/interview/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interview_type: interviewType,
        job_description: jobDescription
      }),
    });
    return handleResponse<StartInterviewResponse>(response);
  },

  async sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
    const response = await fetch(`${BASE_URL}/interview/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message }),
    });
    return handleResponse<ChatResponse>(response);
  },

  async getFeedback(sessionId: string): Promise<FeedbackResponse> {
    const response = await fetch(`${BASE_URL}/interview/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    return handleResponse<FeedbackResponse>(response);
  },

  async validateResponse(sessionId: string, message: string): Promise<ValidationResponse> {
    const response = await fetch(`${BASE_URL}/interview/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message }),
    });
    return handleResponse<ValidationResponse>(response);
  },

  async getSession(sessionId: string): Promise<SessionResponse> {
    const response = await fetch(`${BASE_URL}/interview/session/${sessionId}`);
    return handleResponse<SessionResponse>(response);
  },

  async renderVideo(sessionId: string, includeCandidate = true): Promise<RenderVideoResponse> {
    const response = await fetch(`${BASE_URL}/interview/render-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, include_candidate: includeCandidate }),
    });
    return handleResponse<RenderVideoResponse>(response);
  },
};

export { ApiError };
