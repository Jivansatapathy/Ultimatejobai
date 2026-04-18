import api from "@/services/api";
import {
  ApplicationStatus,
  CandidateApplication,
  CompanyReview,
  EmployerActivity,
  EmployerAnalyticsSummary,
  EmployerBrandingSnapshot,
  EmployerNotification,
  EmployerProfile,
  EmployerTeamMember,
  ExternalPostingRequest,
  JobPosting,
  JobTemplate,
  OfferLetter,
  OfferTemplate,
  PublicEmployerCompanyProfile,
  SalaryBenchmark,
  SavedSearch,
  TalentPoolCandidate,
  TalentPoolFolder,
} from "@/types/employer";

export interface EmployerOverviewResponse {
  stats: {
    total_jobs: number;
    total_applications: number;
    screening_candidates: number;
    shortlisted_candidates: number;
    interview_candidates: number;
    offer_candidates: number;
    hired_candidates: number;
    interview_rate: number;
    offer_rate: number;
    hire_rate: number;
    avg_applications_per_job: number;
  };
  analytics: Array<{ name: string; applications: number }>;
  recent_activity: EmployerActivity[];
  branding: EmployerBrandingSnapshot;
  permissions?: {
    workspace_role: "admin" | "recruiter" | "hiring_manager";
    can_manage_team: boolean;
    can_manage_jobs: boolean;
    can_manage_candidates: boolean;
    can_manage_integrations: boolean;
  };
}

type EmployerJobPayload = {
  title: string;
  description: string;
  salary: string;
  location: string;
  city?: string;
  region?: string;
  country?: string;
  department?: string;
  employment_type?: string;
  workplace_type?: string;
  is_remote?: boolean;
  quick_apply_enabled?: boolean;
  quick_apply_questions?: string[];
  skills: string[];
  deadline: string;
  employer_status: "draft" | "published" | "closed";
};

export interface EmployerJobOptions {
  departments: string[];
  countries: string[];
  cities: string[];
  regions: string[];
}

export interface EmployerJobDescriptionSuggestion {
  description: string;
  suggested_skills: string[];
}

export async function registerEmployerAccount({
  email,
  password,
  displayName,
  companyName,
}: {
  email: string;
  password: string;
  displayName: string;
  companyName: string;
}) {
  const response = await api.post("/api/employer/auth/register/", {
    email,
    password,
    full_name: displayName,
    company_name: companyName,
  });
  return response.data;
}

export async function getEmployerProfile() {
  const response = await api.get<EmployerProfile>("/api/employer/profile/");
  return response.data;
}

export async function updateEmployerPreferences(
  payload: Partial<
    Pick<
      EmployerProfile,
      | "full_name"
      | "company_name"
      | "contact_name"
      | "contact_email"
      | "contact_phone"
      | "website"
      | "notes"
      | "brand_tagline"
      | "brand_summary"
      | "linkedin_url"
    > & {
      linkedin_sync_enabled?: boolean;
      external_posting_enabled?: boolean;
    }
  >,
) {
  const response = await api.patch<EmployerProfile>("/api/employer/profile/", payload);
  return response.data;
}

export interface EmployerBootstrapResponse {
  user: {
    email: string;
    full_name: string;
    is_active: boolean;
  };
  profile: EmployerProfile;
  company: {
    id: string | null;
    name: string | null;
    slug: string | null;
  };
  summary: {
    total_applications: number;
    hired_count: number;
    unread_notifications: number;
  };
  permissions: {
    workspace_role: string;
    can_manage_team: boolean;
    can_manage_jobs: boolean;
    can_manage_candidates: boolean;
    can_manage_integrations: boolean;
  };
}

export async function getEmployerOverview() {
  const response = await api.get<EmployerOverviewResponse>("/api/employer/overview/");
  return response.data;
}

export async function getEmployerBootstrap() {
  const response = await api.get<EmployerBootstrapResponse>("/api/employer/bootstrap/");
  return response.data;
}

export async function getEmployerJobs(search = "") {
  const response = await api.get<JobPosting[]>("/api/employer/jobs/", {
    params: search ? { search } : undefined,
  });
  return response.data;
}

export async function getEmployerJobOptions() {
  const response = await api.get<EmployerJobOptions>("/api/employer/job-options/");
  return response.data;
}

export async function createEmployerJob(payload: EmployerJobPayload) {
  const response = await api.post<JobPosting>("/api/employer/jobs/", payload);
  return response.data;
}

export async function generateEmployerJobDescription(payload: {
  title: string;
  department?: string;
  skills?: string[];
  employment_type?: string;
  workplace_type?: string;
  location?: string;
}) {
  const response = await api.post<EmployerJobDescriptionSuggestion>("/api/employer/jobs/ai-suggest/", payload);
  return response.data;
}

export async function updateEmployerJob(jobId: string, payload: EmployerJobPayload) {
  const response = await api.patch<JobPosting>(`/api/employer/jobs/${jobId}/`, payload);
  return response.data;
}

export async function bulkEmployerJobAction(action: "publish" | "close", jobIds: string[]) {
  const response = await api.post<{ action: string; updated: number }>("/api/employer/jobs/bulk-action/", {
    action,
    job_ids: jobIds,
  });
  return response.data;
}

export async function prepareExternalPosting(platform: "linkedin" | "manual_export", jobIds: string[]) {
  const response = await api.post<{
    platform: string;
    count: number;
    requests: Array<{
      id: string;
      job: string;
      job_title: string;
      platform: string;
      status: string;
      export_payload: Record<string, unknown>;
      external_url?: string | null;
      created_at?: string;
    }>;
  }>("/api/employer/jobs/external-posting/", {
    platform,
    job_ids: jobIds,
  });
  return response.data;
}

export async function executeExternalPosting(requestIds: string[]) {
  const response = await api.post<ExternalPostingRequest[]>("/api/employer/jobs/external-posting/execute/", {
    request_ids: requestIds,
  });
  return response.data;
}

export async function getExternalPostingRequests() {
  const response = await api.get<ExternalPostingRequest[]>("/api/employer/jobs/external-posting/requests/");
  return response.data;
}

export async function deleteEmployerJob(jobId: string) {
  await api.delete(`/api/employer/jobs/${jobId}/`);
}

export async function getEmployerCandidates(params?: { search?: string; job?: string; status?: string }) {
  const response = await api.get<CandidateApplication[]>("/api/employer/candidates/", { params });
  return response.data;
}

export async function updateCandidateStatus(applicationId: string, status: ApplicationStatus) {
  const response = await api.patch<CandidateApplication>(`/api/employer/candidates/${applicationId}/status/`, { status });
  return response.data;
}

export async function bulkUpdateCandidateStatus(applicationIds: string[], status: ApplicationStatus) {
  const response = await api.post<CandidateApplication[]>("/api/employer/candidates/bulk-status/", {
    application_ids: applicationIds,
    status,
  });
  return response.data;
}

export async function addCandidateNote(applicationId: string, note: string) {
  const response = await api.patch<CandidateApplication>(`/api/employer/candidates/${applicationId}/notes/`, { note });
  return response.data;
}

export async function scheduleCandidateInterview(applicationId: string, payload: {
  title: string;
  mode: "virtual" | "phone" | "onsite";
  starts_at: string;
  ends_at?: string;
  meeting_link?: string;
  notes?: string;
}) {
  const response = await api.post<CandidateApplication>(`/api/employer/candidates/${applicationId}/interviews/`, payload);
  return response.data;
}

export async function logCandidateCommunication(applicationId: string, payload: {
  communication_type: "email" | "chat" | "note";
  direction: "outbound" | "inbound";
  subject?: string;
  message: string;
}) {
  const response = await api.post<CandidateApplication>(`/api/employer/candidates/${applicationId}/communications/`, payload);
  return response.data;
}

export async function seedEmployerDemoData() {
  const response = await api.post("/api/employer/seed-demo/");
  return response.data;
}

export async function getEmployerTeamMembers() {
  const response = await api.get<EmployerTeamMember[]>("/api/employer/team-members/");
  return response.data;
}

export async function createEmployerTeamMember(payload: {
  email: string;
  full_name: string;
  role: "admin" | "recruiter" | "hiring_manager";
}) {
  const response = await api.post<EmployerTeamMember>("/api/employer/team-members/", payload);
  return response.data;
}

export async function getEmployerInvitePreview(token: string) {
  const response = await api.get<{
    email: string;
    full_name: string;
    role: string;
    company_name: string;
    status: string;
  }>(`/api/employer/invite/${token}/`);
  return response.data;
}

export async function acceptEmployerInvite(token: string) {
  const response = await api.post<{ message: string; company_name: string; role: string }>(`/api/employer/invite/${token}/accept/`);
  return response.data;
}

export async function getPublicEmployerCompany(slug: string) {
  const response = await api.get<PublicEmployerCompanyProfile>(`/api/employer/public/company/${slug}/`);
  return response.data;
}

export async function createCompanyReview(
  slug: string,
  payload: Pick<CompanyReview, "reviewer_name" | "reviewer_title" | "rating" | "headline" | "body" | "employment_context">,
) {
  const response = await api.post<CompanyReview>(`/api/employer/public/company/${slug}/reviews/`, payload);
  return response.data;
}

// ─── LinkedIn Employer Auth ─────────────────────────────────────
export async function initiateEmployerLinkedInAuth() {
  const response = await api.get<{ auth_url: string }>("/api/employer/auth/linkedin/");
  return response.data;
}

export async function completeEmployerLinkedInAuth(code: string, state: string) {
  const response = await api.post<{
    access: string;
    refresh: string;
    is_admin: boolean;
    email: string;
    role: string;
    company_name: string;
  }>("/api/employer/auth/linkedin/callback/", { code, state });
  return response.data;
}

// ─── Salary Benchmarking ────────────────────────────────────────
export async function getSalaryBenchmark(payload: {
  title: string;
  location?: string;
  skills?: string[];
}) {
  const response = await api.post<SalaryBenchmark>("/api/employer/jobs/salary-benchmark/", payload);
  return response.data;
}

// ─── Job Templates ──────────────────────────────────────────────
export async function getJobTemplates() {
  const response = await api.get<JobTemplate[]>("/api/employer/jobs/templates/");
  return response.data;
}

export async function saveJobTemplate(payload: {
  name: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  department?: string;
  employment_type?: string;
  workplace_type?: string;
  skills: string[];
}) {
  const response = await api.post<JobTemplate>("/api/employer/jobs/templates/", payload);
  return response.data;
}

// ─── Top AI Candidates ──────────────────────────────────────────
export async function getTopCandidates(jobId?: string) {
  const response = await api.get<CandidateApplication[]>("/api/employer/candidates/top/", {
    params: jobId ? { job: jobId } : undefined,
  });
  return response.data;
}

// ─── Candidate Rating ───────────────────────────────────────────
export async function updateCandidateRating(applicationId: string, rating: number) {
  const response = await api.patch<CandidateApplication>(
    `/api/employer/candidates/${applicationId}/rating/`,
    { rating },
  );
  return response.data;
}

// ─── Candidate Bookmark ─────────────────────────────────────────
export async function bookmarkCandidate(applicationId: string, folderId?: string) {
  const response = await api.post<{ bookmarked: boolean }>(
    `/api/employer/candidates/${applicationId}/bookmark/`,
    { folder_id: folderId },
  );
  return response.data;
}

export async function removeBookmark(applicationId: string) {
  await api.delete(`/api/employer/candidates/${applicationId}/bookmark/`);
}

// ─── Talent Pool ────────────────────────────────────────────────
export async function getTalentPool(folderId?: string) {
  const response = await api.get<TalentPoolCandidate[]>("/api/employer/talent-pool/", {
    params: folderId ? { folder: folderId } : undefined,
  });
  return response.data;
}

export async function getTalentFolders() {
  const response = await api.get<TalentPoolFolder[]>("/api/employer/talent-pool/folders/");
  return response.data;
}

export async function createTalentFolder(name: string) {
  const response = await api.post<TalentPoolFolder>("/api/employer/talent-pool/folders/", { name });
  return response.data;
}

export async function deleteTalentFolder(folderId: string) {
  await api.delete(`/api/employer/talent-pool/folders/${folderId}/`);
}

export async function moveCandidateToFolder(applicationId: string, folderId: string | null) {
  const response = await api.post("/api/employer/talent-pool/move/", {
    application_id: applicationId,
    folder_id: folderId,
  });
  return response.data;
}

// ─── Offer Letters ──────────────────────────────────────────────
export async function getOfferTemplates() {
  const response = await api.get<OfferTemplate[]>("/api/employer/offer-templates/");
  return response.data;
}

export async function getOfferLetters() {
  const response = await api.get<OfferLetter[]>("/api/employer/offer-letters/");
  return response.data;
}

export async function generateOfferLetter(payload: {
  application_id: string;
  template_id?: string;
  salary: string;
  start_date: string;
  custom_content?: string;
}) {
  const response = await api.post<OfferLetter>("/api/employer/offer-letters/", payload);
  return response.data;
}

export async function sendOfferLetter(offerId: string) {
  const response = await api.post<OfferLetter>(`/api/employer/offer-letters/${offerId}/send/`);
  return response.data;
}

// ─── Notifications ──────────────────────────────────────────────
export async function getEmployerNotifications() {
  const response = await api.get<EmployerNotification[]>("/api/employer/notifications/");
  return response.data;
}

export async function markNotificationRead(notificationId: string) {
  const response = await api.patch<EmployerNotification>(
    `/api/employer/notifications/${notificationId}/read/`,
  );
  return response.data;
}

export async function markAllNotificationsRead() {
  await api.post("/api/employer/notifications/read-all/");
}

// ─── Saved Searches ─────────────────────────────────────────────
export async function getSavedSearches() {
  const response = await api.get<SavedSearch[]>("/api/employer/saved-searches/");
  return response.data;
}

export async function saveSearchQuery(payload: {
  name: string;
  filters: SavedSearch["filters"];
}) {
  const response = await api.post<SavedSearch>("/api/employer/saved-searches/", payload);
  return response.data;
}

export async function deleteSavedSearch(searchId: string) {
  await api.delete(`/api/employer/saved-searches/${searchId}/`);
}

// ─── Enhanced Analytics ─────────────────────────────────────────
export async function getEmployerAnalytics() {
  const response = await api.get<EmployerAnalyticsSummary>("/api/employer/analytics/");
  return response.data;
}
