import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExecutiveProfile {
  id?: string;
  role: string;
  growth_stage: string;
  industries: string[];
  functional_strengths: string[];
  leadership_years: number;
  exit_history: { company: string; type: string; year: number }[];
  board_seats: { company: string; type: string }[];
  fractional_open: boolean;
  advisory_open: boolean;
  confidential_mode: boolean;
  comp_floor?: number;
  risk_tolerance?: 'low' | 'medium' | 'high';
  eos_score?: number;
}

export interface ExecutiveOpportunity {
  id: string;
  title: string;
  company_name: string;
  type: 'full_time' | 'fractional' | 'advisory' | 'board' | 'consulting' | 'interim';
  seniority_level: string;
  industry: string;
  location: string;
  city?: string;
  country?: string;
  is_remote: boolean;
  compensation_cash_min?: number;
  compensation_cash_max?: number;
  equity_percent?: number;
  salary_currency?: string;
  stage?: string;
  eos_score?: number;
  source?: string;
  platform?: string;
  posted_at?: string;
  apply_url?: string;
  description?: string;
}

export interface EOSResult {
  score: number;
  breakdown: {
    financial: number;
    career: number;
    risk: number;
  };
  verdict: string;
  recommendation: string;
}

export interface DailyBriefing {
  greeting: string;
  date: string;
  opportunity_count: number;
  board_openings: number;
  fractional_roles: number;
  funding_alerts: number;
  network_moves: number;
  recommended_action: string;
  top_opportunities: ExecutiveOpportunity[];
}

export interface CompanyIntel {
  id: string;
  company_name: string;
  linkedin_url?: string;
  industry?: string;
  headcount?: number;
  headcount_growth?: string;
  description?: string;
  funding_stage?: string;
  founded_year?: number;
  website?: string;
  avoid_score: number;
  news: CompanyNewsItem[];
  exec_turnover_signal?: string;
  last_updated?: string;
}

export interface CompanyNewsItem {
  title: string;
  url: string;
  published_at: string;
  source: string;
  snippet: string;
}

export interface CompBenchmark {
  role: string;
  stage: string;
  location: string;
  years_experience?: number | null;
  base_min: number;
  base_max: number;
  bonus_percent_min: number;
  bonus_percent_max: number;
  equity_min: number;
  equity_max: number;
  rsu_min: number;
  rsu_max: number;
  total_min: number;
  total_max: number;
  p50_total: number;
  your_ask?: number;
}

export interface EquityScenario {
  id?: string;
  company_name: string;
  stage: string;
  grant_percent: number;
  current_valuation: number;
  vesting_years: number;
  cliff_months: number;
  scenarios: {
    label: string;
    multiple: number;
    dilution: number;
    gross: number;
    net_after_tax: number;
  }[];
}

export interface CRMContact {
  id?: string;
  name: string;
  firm: string;
  title: string;
  email?: string;
  linkedin_url?: string;
  contact_type: 'recruiter' | 'vc' | 'pe_firm' | 'founder' | 'board_member' | 'exec_search' | 'advisor' | 'family_office';
  warmth_score: number;
  last_interaction?: string;
  next_action?: string;
  notes?: string;
}

export interface NetworkRecommendation {
  type: 'warm_intro' | 'community' | 'alumni' | 'conference' | 'exec_move';
  title: string;
  description: string;
  action_label: string;
  action_url?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ResumeVersion {
  id?: string;
  mode: 'startup' | 'pe_portfolio' | 'board' | 'fractional';
  version_label: string;
  target_company?: string;
  content: string;
  created_at: string;
}

export interface BrandingContent {
  id?: string;
  content_type: 'linkedin_post' | 'thought_leadership' | 'video_script' | 'board_bio';
  topic?: string;
  content: string;
  created_at: string;
}

export interface InterviewQuestion {
  question: string;
  model_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InterviewPrepPack {
  interview_type: string;
  company: string;
  role: string;
  likely_questions: InterviewQuestion[];
  red_flags: string[];
  questions_to_ask: string[];
  prep_tips: string[];
}

export interface ReadinessDimension {
  name: string;
  score: number;
  weight: number;
  insight: string;
}

export interface ReadinessScoreResult {
  overall_score: number;
  target_role: string;
  dimensions: ReadinessDimension[];
  key_gaps: string[];
  action_plan: { week: number; action: string; priority: 'high' | 'medium' }[];
  verdict: string;
}

export interface CareerTwinMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── Phase 1: Profile & Opportunities ────────────────────────────────────────

export const venusService = {
  // Profile
  getProfile: () =>
    api.get('/api/venus/profile/').then(r => r.data as ExecutiveProfile),

  createProfile: (data: Partial<ExecutiveProfile>) =>
    api.post('/api/venus/profile/', data).then(r => r.data as ExecutiveProfile),

  updateProfile: (data: Partial<ExecutiveProfile>) =>
    api.patch('/api/venus/profile/', data).then(r => r.data as ExecutiveProfile),

  getProfileCompleteness: () =>
    api.get('/api/venus/profile/completeness/').then(r => r.data as { percent: number; missing: string[] }),

  saveOnboardingStep: (step: number, data: Record<string, unknown>) =>
    api.post('/api/venus/onboarding/step/', { step, ...data }).then(r => r.data),

  // Opportunities (backed by SeniorJob table)
  getOpportunities: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return api.get(`/api/venus/opportunities/?${qs}`).then(r => r.data as {
      results: ExecutiveOpportunity[];
      count: number;
      has_next: boolean;
    });
  },

  getOpportunity: (id: string) =>
    api.get(`/api/venus/opportunities/${id}/`).then(r => r.data as ExecutiveOpportunity),

  getEOS: (id: string) =>
    api.get(`/api/venus/opportunities/${id}/eos/`).then(r => r.data as EOSResult),

  // ─── Phase 2: Intelligence ─────────────────────────────────────────────────

  getDailyBriefing: () =>
    api.get('/api/venus/briefing/').then(r => r.data as DailyBriefing),

  getCompanyIntel: (companyName: string) =>
    api.get(`/api/venus/company/${toSlug(companyName)}/intel/`).then(r => r.data as CompanyIntel),

  refreshCompanyIntel: (companyName: string) =>
    api.post(`/api/venus/company/${toSlug(companyName)}/refresh/`).then(r => r.data),

  getCompanyNews: (companyId: string) =>
    api.get(`/api/venus/company/${companyId}/news/`).then(r => r.data as CompanyNewsItem[]),

  getDecision: (opportunityId: string) =>
    api.post(`/api/venus/opportunities/${opportunityId}/decision/`).then(r => r.data as {
      verdict: string;
      reasoning: string;
      risks: string[];
      upsides: string[];
      action: string;
    }),

  benchmarkCompensation: (data: { role: string; stage: string; location: string; years_experience?: number }) =>
    api.post('/api/venus/compensation/benchmark/', data).then(r => r.data as CompBenchmark),

  getCompBenchmarkHistory: () =>
    api.get('/api/venus/compensation/history/').then(r => r.data as CompBenchmark[]),

  calculateEquity: (data: Omit<EquityScenario, 'id' | 'scenarios'>) =>
    api.post('/api/venus/equity/calculate/', data).then(r => r.data as EquityScenario),

  getEquityScenarios: () =>
    api.get('/api/venus/equity/scenarios/').then(r => r.data as EquityScenario[]),

  // ─── Phase 3: CRM, Network, Resume, Branding ──────────────────────────────

  // CRM
  getContacts: () =>
    api.get('/api/venus/crm/contacts/').then(r => r.data as CRMContact[]),

  addContact: (data: Omit<CRMContact, 'id'>) =>
    api.post('/api/venus/crm/contacts/', data).then(r => r.data as CRMContact),

  updateContact: (id: string, data: Partial<CRMContact>) =>
    api.patch(`/api/venus/crm/contacts/${id}/`, data).then(r => r.data as CRMContact),

  deleteContact: (id: string) =>
    api.delete(`/api/venus/crm/contacts/${id}/`),

  enrichContact: (id: string) =>
    api.post(`/api/venus/crm/contacts/${id}/enrich/`).then(r => r.data as CRMContact),

  // Networking
  getNetworkRecommendations: () =>
    api.get('/api/venus/network/recommendations/').then(r => r.data as NetworkRecommendation[]),

  getExecMoves: () =>
    api.get('/api/venus/network/exec-moves/').then(r => r.data as { title: string; source: string; url: string; published_at: string }[]),

  // Resume Studio
  generateResume: (data: { mode: ResumeVersion['mode']; target_company?: string; target_role?: string }) =>
    api.post('/api/venus/resume/generate/', data).then(r => r.data as ResumeVersion),

  getResumeVersions: () =>
    api.get('/api/venus/resume/versions/').then(r => r.data as ResumeVersion[]),

  // Branding
  generateBrandingContent: (data: { content_type: BrandingContent['content_type']; topic?: string }) =>
    api.post('/api/venus/branding/generate/', data).then(r => r.data as BrandingContent),

  getBrandingLibrary: () =>
    api.get('/api/venus/branding/library/').then(r => r.data as BrandingContent[]),

  publishToLinkedIn: (contentId: string) =>
    api.post('/api/venus/linkedin/publish/', { content_id: contentId }).then(r => r.data),

  // Interview Prep AI
  generateInterviewPrep: (data: { interview_type: string; company: string; role: string }) =>
    api.post('/api/venus/interview-prep/', data).then(r => r.data as InterviewPrepPack),

  // Executive Readiness Score
  calculateReadinessScore: (data: { target_role: string; dimensions: Record<string, number> }) =>
    api.post('/api/venus/readiness-score/', data).then(r => r.data as ReadinessScoreResult),

  // AI Career Twin
  sendCareerTwinMessage: (data: { message: string; history: CareerTwinMessage[] }) =>
    api.post('/api/venus/career-twin/chat/', data).then(r => r.data as { reply: string }),
};
