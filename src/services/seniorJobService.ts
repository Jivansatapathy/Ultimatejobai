import api from './api';

export interface SeniorJob {
  id: string;
  job_id: string | null;
  title: string;
  company_name: string | null;
  location: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  employment_type: string | null;
  workplace_type: string | null;
  is_remote: boolean;
  apply_url: string | null;
  department: string | null;
  salary: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  seniority_level: 'C-Suite' | 'VP' | 'Director';
  industry: string;
  skills: string[] | null;
  posted_at: string | null;
  source: string | null;
  platform: string | null;
  description?: string;
}

export interface SeniorJobSearchFilters {
  q?: string;
  industry?: string;
  seniority_level?: string;
  country?: string;
  employment_type?: string;
  workplace_type?: string;
  fractional?: boolean;
  has_salary?: boolean;
  page?: number;
  page_size?: number;
}

export interface SeniorJobSearchResponse {
  count: number;
  page: number;
  page_size: number;
  has_next: boolean;
  results: SeniorJob[];
}

export interface FilterOption {
  industry?: string;
  seniority_level?: string;
  country?: string;
  employment_type?: string;
  workplace_type?: string;
  count: number;
}

export interface SeniorJobFilterOptions {
  industries: FilterOption[];
  seniority_levels: FilterOption[];
  countries: FilterOption[];
  employment_types: FilterOption[];
  workplace_types: FilterOption[];
  total: number;
}

export const searchSeniorJobs = async (
  filters: SeniorJobSearchFilters = {}
): Promise<SeniorJobSearchResponse> => {
  const params = new URLSearchParams();
  if (filters.q)               params.set('q', filters.q);
  if (filters.industry)        params.set('industry', filters.industry);
  if (filters.seniority_level) params.set('seniority_level', filters.seniority_level);
  if (filters.country)         params.set('country', filters.country);
  if (filters.employment_type) params.set('employment_type', filters.employment_type);
  if (filters.workplace_type)  params.set('workplace_type', filters.workplace_type);
  if (filters.fractional)      params.set('fractional', 'true');
  if (filters.has_salary)      params.set('has_salary', 'true');
  if (filters.page)            params.set('page', String(filters.page));
  if (filters.page_size)       params.set('page_size', String(filters.page_size));

  const response = await api.get(`/api/search/senior/?${params.toString()}`);
  return response.data;
};

export const fetchSeniorJobById = async (id: string): Promise<SeniorJob | null> => {
  try {
    const response = await api.get(`/api/search/senior/${id}/`);
    return response.data;
  } catch {
    return null;
  }
};

export const fetchSeniorJobFilterOptions = async (): Promise<SeniorJobFilterOptions> => {
  const response = await api.get('/api/search/senior/filters/');
  return response.data;
};

export interface SeniorJobSuggestion {
  type: 'role' | 'company' | 'location';
  label: string;
  value: string;
  count: number;
}

export const suggestSeniorJobs = async (
  q: string,
  signal?: AbortSignal
): Promise<SeniorJobSuggestion[]> => {
  if (q.trim().length < 2) return [];
  const response = await api.get('/api/search/senior/suggest/', {
    params: { q },
    signal,
  });
  return response.data.suggestions ?? [];
};
