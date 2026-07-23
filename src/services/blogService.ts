import { ContentBlock, FaqItem } from "@/components/blog/blockTypes";

const API = import.meta.env.VITE_API_URL ?? "";

export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  subtitle?: string;
  cover_image_url: string;
  author_name: string;
  tags: string[];
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  category?: Category | null;
  category_id?: number | null;
  date?: string | null;
  featured?: boolean;
  image_fit?: "fill" | "fit";
  meta_title?: string;
  meta_description?: string;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
  content_blocks?: ContentBlock[];
  faq?: FaqItem[];
  updated_at: string;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("blog_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API}/api/blog/categories/`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
}

export async function adminCreateCategory(name: string): Promise<Category> {
  const res = await fetch(`${API}/api/blog/admin/categories/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.name?.[0] || err.error || "Failed to create category");
  }
  return res.json();
}

export async function adminDeleteCategory(id: number): Promise<void> {
  const res = await fetch(`${API}/api/blog/admin/categories/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete category");
}

// ── Public ────────────────────────────────────────────────────────────────────

export async function fetchPublishedPosts(params?: { category?: string; featured?: boolean }): Promise<BlogPost[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append("category", params.category);
  if (params?.featured) query.append("featured", "true");

  const url = `${API}/api/blog/posts/${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load posts");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
}

export async function fetchPostBySlug(slug: string): Promise<BlogPostDetail> {
  const res = await fetch(`${API}/api/blog/posts/${slug}/`);
  if (!res.ok) throw new Error("Post not found");
  return res.json();
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function adminLogin(username: string, password: string): Promise<string> {
  const res = await fetch(`${API}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: username, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  const data = await res.json();
  const token = data.token ?? data.access ?? data.key;
  if (!token) throw new Error("No token returned");
  return token;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch(`${API}/api/auth/password-reset/request/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to request password reset");
}

export async function confirmPasswordReset(uid: string, token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API}/api/auth/password-reset/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, token, new_password: newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to reset password");
  }
}

export async function adminFetchAllPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API}/api/blog/admin/posts/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Unauthorized");
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
}

export async function adminFetchPost(id: number): Promise<BlogPostDetail> {
  const res = await fetch(`${API}/api/blog/admin/posts/${id}/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

export async function adminCreatePost(data: Partial<BlogPostDetail>): Promise<BlogPostDetail> {
  const res = await fetch(`${API}/api/blog/admin/posts/create/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function adminUpdatePost(id: number, data: Partial<BlogPostDetail>): Promise<BlogPostDetail> {
  const res = await fetch(`${API}/api/blog/admin/posts/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function adminDeletePost(id: number): Promise<void> {
  const res = await fetch(`${API}/api/blog/admin/posts/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Delete failed");
}

export async function adminTogglePublish(id: number): Promise<{ status: string; published_at: string | null }> {
  const res = await fetch(`${API}/api/blog/admin/posts/${id}/toggle/`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Toggle failed");
  return res.json();
}

export async function adminUploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API}/api/blog/admin/upload-image/`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Image upload failed");
  }
  const data = await res.json();
  return data.url;
}
