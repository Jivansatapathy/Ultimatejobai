import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Plus, Edit3, Trash2, Eye, EyeOff, BookOpen,
  ArrowLeft, Save, Loader2, Tag, X, CheckCircle, AlertCircle,
  Globe, FileText,
} from "lucide-react";
import {
  adminLogin, adminFetchAllPosts, adminFetchPost,
  adminCreatePost, adminUpdatePost, adminDeletePost,
  adminTogglePublish, BlogPost, BlogPostDetail,
} from "@/services/blogService";

// ── Tiny TipTap-like rich text toolbar (no external deps) ─────────────────────
// Using a contenteditable div with execCommand for basic formatting

function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, []); // only on mount

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    ref.current?.focus();
  };

  const TOOLS = [
    { label: "B", cmd: "bold", title: "Bold" },
    { label: "I", cmd: "italic", title: "Italic" },
    { label: "U", cmd: "underline", title: "Underline" },
    { label: "H1", cmd: "formatBlock", arg: "h2", title: "Heading 1" },
    { label: "H2", cmd: "formatBlock", arg: "h3", title: "Heading 2" },
    { label: "¶", cmd: "formatBlock", arg: "p", title: "Paragraph" },
    { label: "• List", cmd: "insertUnorderedList", title: "Bullet list" },
    { label: "1. List", cmd: "insertOrderedList", title: "Ordered list" },
    { label: "—", cmd: "insertHorizontalRule", title: "Divider" },
  ];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-1 bg-gray-50 border-b border-gray-200 p-2">
        {TOOLS.map(t => (
          <button
            key={t.cmd + (t.arg ?? "")}
            type="button"
            title={t.title}
            onMouseDown={e => { e.preventDefault(); exec(t.cmd, t.arg); }}
            className="px-2.5 py-1 rounded text-xs font-semibold text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        className="min-h-[320px] p-4 outline-none prose prose-sm max-w-none focus:ring-0 text-gray-800"
        style={{ lineHeight: 1.8 }}
      />
    </div>
  );
}

// ── Tag input ──────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");

  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput("");
  };

  return (
    <div className="flex flex-wrap gap-2 items-center border border-gray-200 rounded-xl p-2.5 min-h-[44px]">
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {t}
          <button type="button" onClick={() => onChange(tags.filter(x => x !== t))}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={tags.length === 0 ? "Add tags, press Enter" : ""}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent placeholder-gray-300"
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
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  author_name: string;
  tags: string[];
  status: "draft" | "published";
}

const BLANK: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  author_name: "Hizorex Team",
  tags: [],
  status: "draft",
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ── Login screen ──────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
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
              onChange={e => setEmail(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
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
        </form>
      </motion.div>
    </div>
  );
}

// ── Post form (create / edit) ─────────────────────────────────────────────────

function PostForm({
  initial,
  onSave,
  onBack,
  saving,
}: {
  initial: FormState;
  onSave: (data: FormState) => void;
  onBack: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleTitleChange = (v: string) => {
    set("title", v);
    if (!initial.slug) set("slug", slugify(v));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to posts
      </button>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Title *</label>
          <input
            value={form.title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Post title"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-base text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors font-semibold"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Slug *</label>
          <input
            value={form.slug}
            onChange={e => set("slug", e.target.value)}
            placeholder="post-url-slug"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors font-mono"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Excerpt (SEO description)</label>
          <textarea
            value={form.excerpt}
            onChange={e => set("excerpt", e.target.value)}
            rows={2}
            placeholder="Short summary shown in search results and cards…"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Cover image URL</label>
          <input
            value={form.cover_image_url}
            onChange={e => set("cover_image_url", e.target.value)}
            placeholder="https://..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Author */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Author name</label>
            <input
              value={form.author_name}
              onChange={e => set("author_name", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={e => set("status", e.target.value as "draft" | "published")}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-colors"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Tags</label>
          <div className="bg-white rounded-xl">
            <TagInput tags={form.tags} onChange={v => set("tags", v)} />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Content *</label>
          <div className="bg-white rounded-xl">
            <RichEditor value={form.content} onChange={v => set("content", v)} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.title || !form.slug}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-6 py-2.5 text-sm transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save post"}
          </button>
          <button
            onClick={onBack}
            className="px-5 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main admin shell ──────────────────────────────────────────────────────────

export default function BlogAdmin() {
  const [token, setToken] = useState(() => localStorage.getItem("blog_admin_token") ?? "");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [view, setView] = useState<View>("list");
  const [editPost, setEditPost] = useState<BlogPostDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      setPosts(await adminFetchAllPosts());
    } catch {
      showToast("Failed to load posts", "err");
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    if (token) loadPosts();
  }, [token, loadPosts]);

  const handleLogin = (t: string) => {
    localStorage.setItem("blog_admin_token", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("blog_admin_token");
    setToken("");
  };

  const openEdit = async (id: number) => {
    try {
      const p = await adminFetchPost(id);
      setEditPost(p);
      setView("edit");
    } catch {
      showToast("Failed to load post", "err");
    }
  };

  const handleCreate = async (form: FormState) => {
    setSaving(true);
    try {
      await adminCreatePost(form);
      showToast("Post created!");
      await loadPosts();
      setView("list");
    } catch (e: unknown) {
      showToast(String(e), "err");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (form: FormState) => {
    if (!editPost) return;
    setSaving(true);
    try {
      await adminUpdatePost(editPost.id, form);
      showToast("Post updated!");
      await loadPosts();
      setView("list");
    } catch (e: unknown) {
      showToast(String(e), "err");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminDeletePost(id);
      showToast("Post deleted");
      setPosts(ps => ps.filter(p => p.id !== id));
    } catch {
      showToast("Delete failed", "err");
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await adminTogglePublish(id);
      setPosts(ps => ps.map(p => p.id === id ? { ...p, status: res.status as "draft" | "published", published_at: res.published_at } : p));
      showToast(res.status === "published" ? "Post published!" : "Post unpublished");
    } catch {
      showToast("Toggle failed", "err");
    }
  };

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Topbar */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white">Blog Admin</span>
          <span className="text-gray-600 text-xs hidden sm:inline">· Hizorex</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <Globe className="h-3.5 w-3.5" /> View blog
          </a>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Blog Posts</h1>
                  <p className="text-sm text-gray-400 mt-0.5">{posts.length} total · {posts.filter(p => p.status === "published").length} published</p>
                </div>
                <button
                  onClick={() => setView("create")}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" /> New post
                </button>
              </div>

              {/* List */}
              {loadingPosts ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No posts yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map(post => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 hover:border-gray-700 transition-colors"
                    >
                      {/* Status pill */}
                      <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                        ${post.status === "published" ? "bg-emerald-900 text-emerald-400" : "bg-gray-800 text-gray-400"}`}>
                        {post.status}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white truncate">{post.title}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">/{post.slug}</p>
                      </div>

                      {/* Tags */}
                      {(post.tags ?? []).length > 0 && (
                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                          <Tag className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">{post.tags.slice(0, 2).join(", ")}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggle(post.id)}
                          title={post.status === "published" ? "Unpublish" : "Publish"}
                          className={`p-2 rounded-lg transition-colors
                            ${post.status === "published"
                              ? "text-emerald-400 hover:bg-emerald-950"
                              : "text-gray-500 hover:bg-gray-800"}`}
                        >
                          {post.status === "published" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => openEdit(post.id)}
                          title="Edit"
                          className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          title="Delete"
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-950 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === "create" && (
            <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <h1 className="text-2xl font-extrabold text-white mb-8">New Post</h1>
              <PostForm
                initial={BLANK}
                onSave={handleCreate}
                onBack={() => setView("list")}
                saving={saving}
              />
            </motion.div>
          )}

          {view === "edit" && editPost && (
            <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <h1 className="text-2xl font-extrabold text-white mb-8">Edit Post</h1>
              <PostForm
                initial={{
                  title: editPost.title,
                  slug: editPost.slug,
                  excerpt: editPost.excerpt,
                  content: editPost.content,
                  cover_image_url: editPost.cover_image_url,
                  author_name: editPost.author_name,
                  tags: editPost.tags ?? [],
                  status: editPost.status,
                }}
                onSave={handleUpdate}
                onBack={() => setView("list")}
                saving={saving}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key="toast" msg={toast.msg} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
