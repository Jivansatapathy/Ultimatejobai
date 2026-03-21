import api_instance from "@/services/api";

export type InterviewType = "technical" | "behavioral" | "general" | "mock" | "salary_negotiation" | "career_advice";

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

export interface StartInterviewResponse {
  session_id: string;
  interviewer_message: string;
  min_questions?: number;
  max_questions?: number;
}

export interface ChatResponse {
  interviewer_message: string;
  question_count: number;
  min_questions?: number;
  max_questions?: number;
  is_finished: boolean;
}

export interface FeedbackResponse {
  feedback: string;
}

export interface StartLocalInterviewResponse {
  session_id: string;
  interviewer_message: string;
  interviewer_audio_url: string;
  question_count: number;
  min_questions: number;
  max_questions: number;
}

export interface ProcessLocalAnswerResponse {
  status: "next" | "finished";
  transcription: string;
  interviewer_message?: string;
  interviewer_audio_url?: string;
  question_count?: number;
}

export interface HealthResponse {
  status: string;
  apis_configured: {
    groq: boolean;
    elevenlabs: boolean;
    d_id: boolean;
    shotstack: boolean;
  };
}

export interface ValidationResponse {
  is_valid: boolean;
  message?: string;
  suggestions?: string;
}

export interface SessionResponse {
  session_id: string;
  type: InterviewType;
  job_description?: string;
  question_count: number;
  history: { role: string; content: string }[];
}

export interface RenderVideoResponse {
  session_id: string;
  video_url: string;
  status: "done" | "error";
  logs: string[];
}

export interface DIDStreamResponse {
  id: string;
  session_id: string;
  offer: any;
  ice_servers: any[];
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  async checkHealth(): Promise<HealthResponse> {
    const response = await api_instance.get("/api/interviews/health/");
    return response.data;
  },

  async startInterview(interviewType: InterviewType, jobDescription?: string): Promise<StartInterviewResponse> {
    const response = await api_instance.post("/api/interviews/start/", {
      interview_type: interviewType,
      job_description: jobDescription
    });
    return response.data;
  },

  async sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
    const response = await api_instance.post("/api/interviews/chat/", {
      session_id: sessionId,
      message
    });
    return response.data;
  },

  async getFeedback(sessionId: string): Promise<FeedbackResponse> {
    const response = await api_instance.post("/api/interviews/feedback/", {
      session_id: sessionId
    });
    return response.data;
  },

  async validateResponse(sessionId: string, message: string): Promise<ValidationResponse> {
    const response = await api_instance.post("/api/interviews/validate/", {
      session_id: sessionId,
      message
    });
    return response.data;
  },

  async startLocalInterview(interviewType: InterviewType, jobDescription?: string): Promise<StartLocalInterviewResponse> {
    const response = await api_instance.post("/api/interviews/local-start/", {
      interview_type: interviewType,
      job_description: jobDescription
    });
    return response.data;
  },

  async processLocalAnswer(sessionId: string, audioBlob: Blob): Promise<ProcessLocalAnswerResponse> {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("audio", audioBlob, "answer.wav");

    const response = await api_instance.post("/api/interviews/local-process/", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  },

  async getSession(sessionId: string): Promise<SessionResponse> {
    const response = await api_instance.get(`/api/interviews/session/${sessionId}/`);
    return response.data;
  },

  async renderVideo(sessionId: string, includeCandidate = true): Promise<RenderVideoResponse> {
    const response = await api_instance.post("/api/interviews/render-video/", {
      session_id: sessionId,
      include_candidate: includeCandidate
    });
    return response.data;
  },

  did: {
    async createStream(): Promise<DIDStreamResponse> {
      const response = await api_instance.post("/api/interviews/did/stream/create/");
      return response.data;
    },
    async sdp(streamId: string, answer: any, sessionId: string): Promise<any> {
      const response = await api_instance.post(`/api/interviews/did/stream/${streamId}/sdp/`, {
        answer,
        session_id: sessionId
      });
      return response.data;
    },
    async ice(streamId: string, candidate: string, sdpMid: string | null, sdpMLineIndex: number | null, sessionId: string): Promise<any> {
      const response = await api_instance.post(`/api/interviews/did/stream/${streamId}/ice/`, {
        candidate,
        sdpMid,
        sdpMLineIndex,
        session_id: sessionId
      });
      return response.data;
    },
    async talk(streamId: string, text: string, sessionId: string): Promise<any> {
      const response = await api_instance.post(`/api/interviews/did/stream/${streamId}/talk/`, {
        text,
        session_id: sessionId
      });
      return response.data;
    },
    async deleteStream(streamId: string, sessionId: string): Promise<any> {
      const response = await api_instance.delete(`/api/interviews/did/stream/${streamId}/delete/`, {
        params: { session_id: sessionId }
      });
      return response.data;
    }
  }
};

