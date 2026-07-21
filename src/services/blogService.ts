const API = import.meta.env.VITE_API_URL ?? "";

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  author_name: string;
  tags: string[];
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
  updated_at: string;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("blog_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Public ────────────────────────────────────────────────────────────────────

export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API}/api/blog/posts/`);
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
  // Handle DRF pagination wrapper { count, results } or plain array
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
