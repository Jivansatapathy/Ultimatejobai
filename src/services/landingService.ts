import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://jobai-production-7672.up.railway.app";

export interface HeroContent {
  badge_text: string;
  headline_line1: string;
  headline_line2: string;
  headline_suffix: string;
  subtitle: string;
  search_role_placeholder: string;
  search_location_placeholder: string;
  quick_roles: string[];
  stats: Array<{ num: number; suffix: string; label: string; sub: string }>;
  venus_banner_title: string;
  venus_banner_subtitle: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  tag: string;
  icon_name: string;
  is_accent: boolean;
  order: number;
  is_active: boolean;
}

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
  icon_name: string;
  checklist_items: string[];
  is_accent: boolean;
  order: number;
  is_active: boolean;
}

export interface CTAContent {
  badge_text: string;
  headline: string;
  subtitle: string;
  benefits: string[];
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string;
  secondary_button_url: string;
}

export interface TestimonialItem {
  author_name: string;
  author_role: string;
  quote: string;
  avatar_initials: string;
  avatar_color: string;
  order: number;
  is_active: boolean;
}

export interface LandingContent {
  hero: HeroContent;
  features: FeatureItem[];
  how_it_works: HowItWorksStep[];
  cta: CTAContent;
  testimonials: TestimonialItem[];
}

export async function fetchLandingContent(): Promise<LandingContent> {
  const res = await axios.get(`${BASE_URL}/api/landing/content/`);
  return res.data;
}
