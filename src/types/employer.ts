export type UserRole = "admin" | "employer" | "candidate";
export type JobStatus = "draft" | "published" | "closed";
export type ApplicationStatus = "applied" | "screening" | "shortlisted" | "interview" | "offer" | "rejected" | "hired";

export interface CandidateStatusHistoryItem {
  id: string;
  from_status?: ApplicationStatus | null;
  to_status: ApplicationStatus;
  note?: string | null;
  created_at?: string | null;
}

export interface CandidateInterviewSchedule {
  id: string;
  title: string;
  mode: "virtual" | "phone" | "onsite";
  starts_at: string;
  ends_at?: string | null;
  meeting_link?: string | null;
  notes?: string | null;
  status: "scheduled" | "completed" | "cancelled";
  invite_sent_at?: string | null;
}

export interface CandidateCommunicationItem {
  id: string;
  communication_type: "email" | "chat" | "note";
  direction: "outbound" | "inbound";
  subject?: string | null;
  message: string;
  delivery_status?: "pending" | "sent" | "failed";
  delivery_error?: string | null;
  created_at?: string | null;
}

export interface EmployerProfile {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  role: UserRole;
  workspace_role?: "admin" | "recruiter" | "hiring_manager";
  permissions?: EmployerWorkspacePermissions;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  notes?: string;
  brand_tagline?: string;
  brand_summary?: string;
  linkedin_url?: string;
  integrations?: {
    linkedin_sync_enabled: boolean;
    external_posting_enabled: boolean;
  };
  team_members?: EmployerTeamMember[];
}

export interface EmployerTeamMember {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "recruiter" | "hiring_manager";
  status: "active" | "invited";
  invite_url?: string;
  created_at?: string | null;
}

export interface EmployerWorkspacePermissions {
  can_manage_team: boolean;
  can_manage_jobs: boolean;
  can_manage_candidates: boolean;
  can_manage_integrations: boolean;
}

export interface ExternalPostingRequest {
  id: string;
  job: string;
  job_title: string;
  platform: string;
  status: "queued" | "prepared" | "executed" | "failed";
  export_payload: Record<string, unknown>;
  external_url?: string | null;
  created_at?: string | null;
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  department?: string | null;
  employment_type?: string | null;
  workplace_type?: string | null;
  is_remote?: boolean;
  quick_apply_enabled?: boolean;
  quick_apply_questions?: string[];
  skills: string[];
  deadline: string;
  employer_status: JobStatus;
  company_name: string;
  applications_count: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PublicEmployerCompanyJob {
  id: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  department?: string | null;
  employment_type?: string | null;
  workplace_type?: string | null;
  skills: string[];
  posted_at?: string | null;
  deadline?: string | null;
  company_name: string;
}

export interface PublicEmployerCompanyProfile {
  slug: string;
  name: string;
  website?: string;
  careers_url?: string | null;
  domain?: string | null;
  brand_tagline?: string;
  brand_summary?: string;
  linkedin_url?: string;
  locations: string[];
  departments: string[];
  stats: {
    open_roles: number;
    total_applications: number;
    teams_hiring: number;
  };
  review_summary: {
    count: number;
    average_rating: number;
  };
  reviews: CompanyReview[];
  jobs: PublicEmployerCompanyJob[];
}

export interface CompanyReview {
  id: string;
  reviewer_name: string;
  reviewer_title?: string;
  rating: number;
  headline: string;
  body: string;
  employment_context: "candidate" | "current_employee" | "former_employee" | "interview";
  created_at?: string | null;
}

export interface CandidateApplication {
  id: string;
  job: string;
  job_title: string;
  name: string;
  email: string;
  resume_link: string;
  status: ApplicationStatus;
  skills: string[];
  application_answers?: Record<string, string>;
  notes?: string | null;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  recommendation?: "shortlist" | "screening" | "review" | null;
  stage_changed_at?: string | null;
  history: CandidateStatusHistoryItem[];
  interviews: CandidateInterviewSchedule[];
  communications: CandidateCommunicationItem[];
  rating?: number | null;
  is_bookmarked?: boolean;
  experience_years?: number | null;
  expected_salary?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EmployerActivity {
  id: string;
  activity_type: string;
  description: string;
  timestamp?: string | null;
}

export interface EmployerBrandingSnapshot {
  company_name: string;
  website?: string;
  brand_tagline?: string;
  brand_summary?: string;
  linkedin_url?: string;
  integrations: {
    linkedin_sync_enabled: boolean;
    external_posting_enabled: boolean;
  };
}

export type LinkedInConnectionStatus = "connected" | "disconnected" | "expired";
export type LinkedInAutomationPreference = "suggest" | "suggest_prefilled" | "auto";
export type LinkedInCampaignStatus = "active" | "paused" | "completed";
export type LinkedInCampaignStepStatus = "pending" | "scheduled" | "posted" | "failed" | "skipped";
export type LinkedInPostTone = "formal" | "casual" | "urgent" | "referral";

export interface LinkedInConnection {
  connected?: boolean;
  id?: string;
  status: LinkedInConnectionStatus;
  is_verified?: boolean;
  linkedin_name?: string;
  linkedin_email?: string;
  linkedin_photo_url?: string;
  linkedin_member_urn?: string;
  posting_consent_given?: boolean;
  auto_post_consent_given?: boolean;
  automation_preference?: LinkedInAutomationPreference;
  token_expires_at?: string | null;
  is_token_valid?: boolean;
  is_token_expiring_soon?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LinkedInPostVariation {
  id: string;
  job: string;
  tone: LinkedInPostTone;
  content: string;
  hashtags: string[];
  hook: string;
  image_url?: string | null;
  application_link: string;
  utm_params: string;
  is_edited: boolean;
  generation: number;
  created_at?: string;
  updated_at?: string;
}

export interface LinkedInCampaignStep {
  id: string;
  day_offset: number;
  scheduled_at?: string | null;
  status: LinkedInCampaignStepStatus;
  retry_count: number;
  linkedin_post_urn?: string;
  posted_at?: string | null;
  utm_link_clicks: number;
  applications_after_post: number;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  variation?: string | null;
  variation_tone?: LinkedInPostTone;
  variation_content?: string;
  variation_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LinkedInCampaign {
  id: string;
  job: string;
  job_title: string;
  status: LinkedInCampaignStatus;
  started_at: string;
  completed_at?: string | null;
  steps: LinkedInCampaignStep[];
}

export interface LinkedInPublishedPost {
  id: string;
  job?: string | null;
  tone: string;
  content: string;
  image_url?: string | null;
  linkedin_post_urn?: string;
  linkedin_post_url?: string;
  published_at: string;
  application_link_with_utm?: string;
  link_clicks: number;
  applications_received: number;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
}

export interface LinkedInJobAnalytics {
  job_id: string;
  total_posts: number;
  total_link_clicks: number;
  total_applications_from_linkedin: number;
  breakdown: Array<{
    post_id: string;
    tone: string;
    published_at: string;
    link_clicks: number;
    applications_received: number;
    linkedin_post_url?: string;
  }>;
}

export interface LinkedInGlobalAnalytics {
  total_posts: number;
  total_clicks: number;
  total_applications: number;
  conversion_rate: number;
  best_performing_tone: string;
  advancement: number;
}

// ─── Notifications ──────────────────────────────────────────────
export type NotificationType =
  | "new_applicant"
  | "status_change"
  | "interview_reminder"
  | "job_expiring"
  | "message_received"
  | "offer_accepted"
  | "offer_rejected"
  | "system";

export interface EmployerNotification {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string | null;
}

// ─── Talent Pool ────────────────────────────────────────────────
export interface TalentPoolFolder {
  id: string;
  name: string;
  candidate_count: number;
  created_at?: string | null;
}

export interface TalentPoolCandidate {
  id: string;
  folder?: string | null;
  folder_name?: string | null;
  application_id: string;
  candidate_name: string;
  candidate_email: string;
  skills: string[];
  match_score: number;
  job_title?: string | null;
  resume_link?: string | null;
  notes?: string | null;
  bookmarked_at?: string | null;
}

// ─── Offer Letters ──────────────────────────────────────────────
export interface OfferTemplate {
  id: string;
  name: string;
  content: string;
  placeholders: string[];
  created_at?: string | null;
}

export interface OfferLetter {
  id: string;
  application_id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  template_id?: string | null;
  content: string;
  salary: string;
  start_date: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  sent_at?: string | null;
  created_at?: string | null;
}

// ─── Salary Benchmark ──────────────────────────────────────────
export interface SalaryBenchmark {
  title: string;
  location: string;
  currency: string;
  min_salary: number;
  max_salary: number;
  median_salary: number;
  formatted_range: string;
  source: string;
}

// ─── Saved Searches ─────────────────────────────────────────────
export interface SavedSearch {
  id: string;
  name: string;
  filters: {
    search?: string;
    skills?: string[];
    location?: string;
    min_experience?: number;
    max_experience?: number;
    min_salary?: string;
    max_salary?: string;
    status?: string;
    job_id?: string;
  };
  created_at?: string | null;
}

// ─── Job Templates ──────────────────────────────────────────────
export interface JobTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  department?: string;
  employment_type?: string;
  workplace_type?: string;
  skills: string[];
  created_at?: string | null;
}

// ─── Enhanced Analytics ─────────────────────────────────────────
export interface EmployerAnalyticsSummary {
  views_per_job: Array<{ job_id: string; job_title: string; views: number }>;
  conversion_rate: number;
  avg_time_to_hire_days: number;
  source_breakdown: Array<{ source: string; count: number; percentage: number }>;
  daily_applications: Array<{ date: string; count: number }>;
  top_performing_jobs: Array<{ job_id: string; job_title: string; applications: number; hire_rate: number }>;
  pipeline_funnel: Array<{ stage: string; count: number }>;
}
