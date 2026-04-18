import api from "@/services/api";
import {
  LinkedInCampaign,
  LinkedInConnection,
  LinkedInGlobalAnalytics,
  LinkedInJobAnalytics,
  LinkedInPostVariation,
  LinkedInPublishedPost,
} from "@/types/employer";

export async function getLinkedInConnection() {
  const response = await api.get<LinkedInConnection>("/api/linkedin/connection/");
  return response.data;
}

export async function initiateLinkedInOAuth() {
  const response = await api.get<{ auth_url: string; state: string }>("/api/linkedin/oauth/init/");
  return response.data;
}

export async function updateLinkedInConnection(payload: Partial<Pick<LinkedInConnection, "automation_preference" | "posting_consent_given" | "auto_post_consent_given">>) {
  const response = await api.patch<LinkedInConnection>("/api/linkedin/connection/", payload);
  return response.data;
}

export async function disconnectLinkedIn() {
  const response = await api.post<{ message: string }>("/api/linkedin/disconnect/");
  return response.data;
}

export async function generateLinkedInPosts(jobId: string) {
  const response = await api.post<{
    variations: LinkedInPostVariation[];
    campaign: LinkedInCampaign;
    message: string;
  }>(`/api/linkedin/generate-posts/${jobId}/`);
  return response.data;
}

export async function getLinkedInPostVariations(jobId: string) {
  const response = await api.get<LinkedInPostVariation[]>(`/api/linkedin/posts/${jobId}/`);
  return response.data;
}

export async function updateLinkedInVariation(jobId: string, payload: {
  variation_id: string;
  content?: string;
  hashtags?: string[];
  image_url?: string;
}) {
  const response = await api.patch<LinkedInPostVariation>(`/api/linkedin/posts/${jobId}/`, payload);
  return response.data;
}

export async function generateLinkedInText(prompt: string) {
  const response = await api.post<{ generated_text: string }>("/api/linkedin/generate-text/", { prompt });
  return response.data;
}

export async function uploadLinkedInImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post<{ storage_path: string; image_url: string }>("/api/linkedin/image/upload/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function publishLinkedInPost(payload: {
  variation_id: string;
  step_id?: string;
  confirmed: boolean;
}) {
  const response = await api.post<{
    post: LinkedInPublishedPost;
    linkedin_post_url?: string;
    message: string;
    require_confirmation?: boolean;
  }>("/api/linkedin/publish/", payload);
  return response.data;
}

export async function getLinkedInCampaign(jobId: string) {
  const response = await api.get<LinkedInCampaign>(`/api/linkedin/campaign/${jobId}/`);
  return response.data;
}

export async function getLinkedInCampaigns() {
  const response = await api.get<LinkedInCampaign[]>("/api/linkedin/campaigns/");
  return response.data;
}

export async function updateLinkedInCampaign(jobId: string, status: LinkedInCampaign["status"]) {
  const response = await api.patch<LinkedInCampaign>(`/api/linkedin/campaign/${jobId}/`, { status });
  return response.data;
}

export async function updateLinkedInCampaignStep(stepId: string, payload: {
  status?: "skipped";
  scheduled_at?: string;
}) {
  const response = await api.patch(`/api/linkedin/campaign/step/${stepId}/`, payload);
  return response.data;
}

export async function getLinkedInPublishedPosts() {
  const response = await api.get<LinkedInPublishedPost[]>("/api/linkedin/published/");
  return response.data;
}

export async function getLinkedInGlobalAnalytics() {
  const response = await api.get<LinkedInGlobalAnalytics>("/api/linkedin/analytics/global/");
  return response.data;
}

export async function getLinkedInJobAnalytics(jobId: string) {
  const response = await api.get<LinkedInJobAnalytics>(`/api/linkedin/analytics/${jobId}/`);
  return response.data;
}

export async function syncLinkedInEngagement() {
  const response = await api.post<{
    success: boolean;
    message: string;
  }>("/api/linkedin/analytics/sync/engagement/");
  return response.data;
}
