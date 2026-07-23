import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Plus, Edit3, Trash2, Eye, EyeOff, BookOpen,
  ArrowLeft, Save, Loader2, X, CheckCircle, AlertCircle,
  Globe, FolderPlus, Upload, FileText,
} from "lucide-react";
import {
  adminLogin, adminFetchAllPosts, adminFetchPost,
  adminCreatePost, adminUpdatePost, adminDeletePost,
  adminTogglePublish, requestPasswordReset, fetchCategories,
  adminCreateCategory, adminDeleteCategory, adminUploadImage,
  BlogPost, BlogPostDetail, Category,
} from "@/services/blogService";
import { ContentBlockEditor } from "@/components/blog/ContentBlockEditor";
import { CKEditorComponent, COMPACT_TOOLBAR } from "@/components/blog/CKEditorComponent";
import { ContentBlock, FaqItem, ImageFitMode } from "@/components/blog/blockTypes";
import { stripHtml, slugifyText } from "@/lib/sanitize";

// ── Tag Input ─────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");

  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  };

  return (
    <div className="flex flex-wrap gap-2 items-center border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 min-h-[44px] bg-white dark:bg-gray-900">
      {tags.map((t) => (
        <span key={t} className="flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full">
          {t}
          <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder={tags.length === 0 ? "Add tags, press Enter" : ""}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent placeholder-gray-400 dark:text-white"
      />
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: "ok" | "err" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl shadow-lg px-5 py-3 text-sm font-semibold text-white
        ${type === "ok" ? "bg-emerald-600" : "bg-red-600"}`}
    >
      {type === "ok" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {msg}
    </motion.div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type View = "list" | "create" | "edit";

interface FormState {
  title: string;
  subtitle: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  author_name: string;
  tags: string[];
  status: "draft" | "published";
  category_id: number | null;
  date: string;
  featured: boolean;
  image_fit: ImageFitMode;
  meta_title: string;
  meta_description: string;
  content_blocks: ContentBlock[];
  faq: FaqItem[];
}

const BLANK: FormState = {
  title: "",
  subtitle: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  author_name: "Hizorex Team",
  tags: [],
  status: "draft",
  category_id: null,
  date: "",
  featured: false,
  image_fit: "fill",
  meta_title: "",
  meta_description: "",
  content_blocks: [],
  faq: [],
};

function slugifyFromRichText(html: string) {
  return slugifyText(stripHtml(html));
}

// ── Login Screen ──────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [mode, setMode] = useState<"login" | "forgot" | "sent">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = await adminLogin(email, password);
      onLogin(token);
    } catch {
      setError("Invalid email or password. Staff account required.");
    } finally {
      setLoading(false);
    }
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setMode("sent");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Blog Admin</h1>
            <p className="text-xs text-gray-400">Hizorex · Staff only</p>
          </div>
        </div>

        {mode === "login" && (
          <form onSubmit={submit} className="bg-gray-900 rounded-2xl p-7 border border-gray-800 space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950 rounded-xl px-4 py-2.5 border border-red-900">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@hizorex.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("forgot");
                }}
                className="text-xs text-gray-400 hover:text-blue-400 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={submitForgot} className="bg-gray-900 rounded-2xl p-7 border border-gray-800 space-y-4">
            <h2 className="text-base font-bold text-white mb-1">Reset Password</h2>
            <p className="text-xs text-gray-400 mb-4">Enter your email and we'll send reset instructions.</p>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950 rounded-xl px-4 py-2.5 border border-red-900">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@hizorex.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("login");
                }}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {mode === "sent" && (
          <div className="bg-gray-900 rounded-2xl p-7 border border-gray-800 text-center space-y-4">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
            <h2 className="text-base font-bold text-white">Check Your Email</h2>
            <p className="text-xs text-gray-400">
              We sent a password reset link to <span className="text-white">{email}</span>.
            </p>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export default function BlogAdmin() {
  const [authed, setAuthed] = useState(() => Boolean(localStorage.getItem("blog_admin_token")));
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [view, setView] = useState<View>("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // New Category Dialog state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pData, cData] = await Promise.all([adminFetchAllPosts(), fetchCategories()]);
      setPosts(pData);
      setCategories(cData);
    } catch {
      showToast("Session expired or unauthorized. Please sign in again.", "err");
      localStorage.removeItem("blog_admin_token");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) loadData();
  }, [authed]);

  const handleLogout = () => {
    localStorage.removeItem("blog_admin_token");
    setAuthed(false);
  };

  const handleCreateNew = () => {
    setForm({ ...BLANK });
    setEditingId(null);
    setView("create");
  };

  const handleEdit = async (post: BlogPost) => {
    setLoading(true);
    try {
      const detail: BlogPostDetail = await adminFetchPost(post.id);
      setForm({
        title: detail.title || "",
        subtitle: detail.subtitle || "",
        slug: detail.slug || "",
        excerpt: detail.excerpt || "",
        content: detail.content || "",
        cover_image_url: detail.cover_image_url || "",
        author_name: detail.author_name || "Hizorex Team",
        tags: detail.tags || [],
        status: detail.status || "draft",
        category_id: detail.category?.id || null,
        date: detail.date || "",
        featured: detail.featured || false,
        image_fit: detail.image_fit || "fill",
        meta_title: detail.meta_title || "",
        meta_description: detail.meta_description || "",
        content_blocks: detail.content_blocks || [],
        faq: detail.faq || [],
      });
      setEditingId(post.id);
      setView("edit");
    } catch {
      showToast("Failed to load post details", "err");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripHtml(form.title).trim()) {
      showToast("Title is required", "err");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<BlogPostDetail> = {
        title: form.title,
        subtitle: form.subtitle,
        slug: form.slug || slugifyFromRichText(form.title),
        excerpt: form.excerpt,
        content: form.content,
        cover_image_url: form.cover_image_url,
        author_name: form.author_name,
        tags: form.tags,
        status: form.status,
        category_id: form.category_id,
        date: form.date || null,
        featured: form.featured,
        image_fit: form.image_fit,
        meta_title: form.meta_title,
        meta_description: form.meta_description,
        content_blocks: form.content_blocks,
        faq: form.faq,
      };

      if (view === "create") {
        await adminCreatePost(payload);
        showToast("Post created successfully!");
      } else if (editingId) {
        await adminUpdatePost(editingId, payload);
        showToast("Post updated successfully!");
      }

      setView("list");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Failed to save post", "err");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await adminDeletePost(id);
      showToast("Post deleted");
      loadData();
    } catch {
      showToast("Failed to delete post", "err");
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      const res = await adminTogglePublish(id);
      showToast(`Post ${res.status === "published" ? "published" : "moved to draft"}`);
      loadData();
    } catch {
      showToast("Failed to toggle status", "err");
    }
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const created = await adminCreateCategory(newCatName.trim());
      setCategories([...categories, created]);
      setForm({ ...form, category_id: created.id });
      setNewCatName("");
      setShowCategoryModal(false);
      showToast("Category created!");
    } catch (err: any) {
      showToast(err.message || "Failed to create category", "err");
    } finally {
      setCreatingCat(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    try {
      const url = await adminUploadImage(file);
      setForm({ ...form, cover_image_url: url });
      showToast("Cover image uploaded!");
    } catch (err: any) {
      showToast(err.message || "Cover upload failed", "err");
    }
  };

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      <AnimatePresence>{toast && <Toast msg={toast.msg} type={toast.type} />}</AnimatePresence>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-none">Blog Admin Dashboard</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage articles, categories, and content blocks</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/blog"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
          >
            <Globe className="h-3.5 w-3.5" /> View Live Blog
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* LIST VIEW */}
        {view === "list" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">All Articles ({posts.length})</h2>
                <p className="text-sm text-gray-500">Draft and published articles</p>
              </div>

              <button
                type="button"
                onClick={handleCreateNew}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition"
              >
                <Plus className="h-4 w-4" /> Create New Post
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-white dark:bg-gray-900 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                <BookOpen className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 font-medium">No posts found.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {posts.map((post) => (
                    <div key={post.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                      <div className="flex items-center gap-4 min-w-0">
                        {post.cover_image_url ? (
                          <img src={post.cover_image_url} alt="" className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">{stripHtml(post.title)}</h3>
                            {post.featured && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{post.category?.name || "Uncategorized"}</span>
                            <span>•</span>
                            <span>{post.author_name}</span>
                            <span>•</span>
                            <span className={post.status === "published" ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                              {post.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(post.id)}
                          className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          title={post.status === "published" ? "Unpublish" : "Publish"}
                        >
                          {post.status === "published" ? <Eye className="h-4 w-4 text-emerald-600" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(post)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CREATE / EDIT FORM VIEW */}
        {(view === "create" || view === "edit") && (
          <form onSubmit={handleSave} className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
              <button
                type="button"
                onClick={() => setView("list")}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back to list
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-md transition disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {view === "create" ? "Publish Article" : "Save Changes"}
                </button>
              </div>
            </div>

            {/* General Info */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" /> Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Post Title *
                  </label>
                  <CKEditorComponent
                    value={form.title}
                    toolbar={COMPACT_TOOLBAR}
                    placeholder="Enter article title..."
                    onChange={(html) =>
                      setForm((f) => ({
                        ...f,
                        title: html,
                        // Only auto-fill the slug on a fresh, untouched post — never
                        // clobber a slug the admin already saved or edited by hand.
                        slug: view === "create" && !f.slug ? slugifyFromRichText(html) : f.slug,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Subtitle / Deck
                  </label>
                  <CKEditorComponent
                    value={form.subtitle}
                    toolbar={COMPACT_TOOLBAR}
                    placeholder="Secondary headline..."
                    onChange={(html) => setForm({ ...form, subtitle: html })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="custom-url-slug"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={form.category_id || ""}
                        onChange={(e) => setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : null })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                      >
                        <option value="">-- No Category --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        className="p-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Add Category"
                      >
                        <FolderPlus className="h-4 w-4 text-blue-600" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Publish Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Publication Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Author
                  </label>
                  <CKEditorComponent
                    value={form.author_name}
                    toolbar={COMPACT_TOOLBAR}
                    placeholder="Author byline..."
                    onChange={(html) => setForm({ ...form, author_name: html })}
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="h-4 w-4 rounded text-blue-600"
                    />
                    <span>Featured Article</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Excerpt / Card Summary
                  </label>
                  <CKEditorComponent
                    value={form.excerpt}
                    toolbar={COMPACT_TOOLBAR}
                    placeholder="Short summary for list cards and search engines..."
                    onChange={(html) => setForm({ ...form, excerpt: html })}
                  />
                </div>

                {/* Cover Image */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Cover Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={form.cover_image_url}
                        onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                        placeholder="https://example.com/cover.jpg"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                      />
                      <label className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-pointer hover:bg-gray-200">
                        <Upload className="h-3.5 w-3.5" /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCoverUpload(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Cover Image Fit
                    </label>
                    <select
                      value={form.image_fit}
                      onChange={(e) => setForm({ ...form, image_fit: e.target.value as ImageFitMode })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="fill">Fill (Cover)</option>
                      <option value="fit">Fit (Contain)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tags
                  </label>
                  <TagInput tags={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
                </div>
              </div>
            </div>

            {/* Content Blocks Editor */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" /> Article Content Blocks
              </h3>
              <p className="text-xs text-gray-500">
                Build rich content visually using block elements (CKEditor Rich Text, FAQ Accordions, Images, Videos, Callouts, Quotes, Code).
              </p>

              <ContentBlockEditor
                blocks={form.content_blocks}
                onChange={(blocks) => setForm({ ...form, content_blocks: blocks })}
              />
            </div>

            {/* SEO Metadata */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" /> SEO & Social Metadata
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Meta Title (Recommended max 60 chars)
                  </label>
                  <input
                    type="text"
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    placeholder={form.title || "Meta title for search results"}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Meta Description (Recommended max 160 chars)
                  </label>
                  <textarea
                    rows={2}
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder={form.excerpt || "Meta description for Google search..."}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Action */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold px-8 py-3 rounded-xl shadow-lg transition disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                {view === "create" ? "Publish Article" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Category</h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Salary Advice, Career Planning"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-300 dark:border-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCat}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition"
                >
                  {creatingCat ? "Creating..." : "Create Category"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
