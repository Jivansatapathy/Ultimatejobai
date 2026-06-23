import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Hero {
  badge_text: string;
  headline_line1: string;
  headline_line2: string;
  headline_suffix: string;
  subtitle: string;
  search_role_placeholder: string;
  search_location_placeholder: string;
  quick_roles: string[];
  stats: { num: number; suffix: string; label: string; sub: string }[];
  venus_banner_title: string;
  venus_banner_subtitle: string;
}

interface Feature {
  id: number;
  title: string;
  description: string;
  tag: string;
  icon_name: string;
  is_accent: boolean;
  order: number;
  is_active: boolean;
}

interface Step {
  id: number;
  number: string;
  title: string;
  description: string;
  icon_name: string;
  checklist_items: string[];
  is_accent: boolean;
  order: number;
  is_active: boolean;
}

interface CTA {
  badge_text: string;
  headline: string;
  subtitle: string;
  benefits: string[];
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string;
  secondary_button_url: string;
}

interface Testimonial {
  id: number;
  author_name: string;
  author_role: string;
  quote: string;
  avatar_initials: string;
  avatar_color: string;
  order: number;
  is_active: boolean;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const BASE = (API_BASE_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "cp_access_token";

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const cls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {multiline ? (
        <textarea rows={3} className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function JsonField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
  rows?: number;
}) {
  const [raw, setRaw] = useState(JSON.stringify(value, null, 2));
  const [err, setErr] = useState("");

  useEffect(() => {
    setRaw(JSON.stringify(value, null, 2));
  }, [value]);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label} (JSON)</label>
      <textarea
        rows={rows}
        className={`w-full rounded-lg border px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${err ? "border-red-400" : "border-gray-200"}`}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          try {
            onChange(JSON.parse(e.target.value));
            setErr("");
          } catch {
            setErr("Invalid JSON");
          }
        }}
      />
      {err && <span className="text-xs text-red-500">{err}</span>}
    </div>
  );
}

function SaveBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {loading ? "Saving…" : "Save Changes"}
    </button>
  );
}

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  if (!msg) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg ${
        ok ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {msg}
    </div>
  );
}

// ─── Hero Tab ─────────────────────────────────────────────────────────────────

function HeroTab({ token }: { token: string }) {
  const [data, setData] = useState<Hero | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", ok: true });

  const flash = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3000);
  };

  useEffect(() => {
    axios.get(`${BASE}/api/landing/hero/`).then((r) => setData(r.data));
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const r = await axios.patch(`${BASE}/api/landing/hero/`, data, { headers: authHeaders(token) });
      setData(r.data);
      flash("Hero saved!", true);
    } catch {
      flash("Save failed", false);
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <p className="text-sm text-gray-400 py-8">Loading…</p>;

  const set = (k: keyof Hero) => (v: string) => setData((d) => d && { ...d, [k]: v });

  return (
    <div className="grid gap-4">
      <Field label="Badge text" value={data.badge_text} onChange={set("badge_text")} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Headline line 1" value={data.headline_line1} onChange={set("headline_line1")} />
        <Field label="Headline line 2" value={data.headline_line2} onChange={set("headline_line2")} />
      </div>
      <Field label="Headline suffix" value={data.headline_suffix} onChange={set("headline_suffix")} />
      <Field label="Subtitle" value={data.subtitle} onChange={set("subtitle")} multiline />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Role placeholder" value={data.search_role_placeholder} onChange={set("search_role_placeholder")} />
        <Field label="Location placeholder" value={data.search_location_placeholder} onChange={set("search_location_placeholder")} />
      </div>
      <JsonField
        label="Quick roles"
        value={data.quick_roles}
        onChange={(v) => setData((d) => d && { ...d, quick_roles: v as string[] })}
        rows={3}
      />
      <JsonField
        label="Stats"
        value={data.stats}
        onChange={(v) => setData((d) => d && { ...d, stats: v as Hero["stats"] })}
        rows={8}
      />
      <Field label="Venus banner title" value={data.venus_banner_title} onChange={set("venus_banner_title")} />
      <Field label="Venus banner subtitle" value={data.venus_banner_subtitle} onChange={set("venus_banner_subtitle")} multiline />
      <SaveBtn loading={saving} onClick={save} />
      <Toast {...toast} />
    </div>
  );
}

// ─── CTA Tab ──────────────────────────────────────────────────────────────────

function CTATab({ token }: { token: string }) {
  const [data, setData] = useState<CTA | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", ok: true });

  const flash = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3000);
  };

  useEffect(() => {
    axios.get(`${BASE}/api/landing/cta/`).then((r) => setData(r.data));
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const r = await axios.patch(`${BASE}/api/landing/cta/`, data, { headers: authHeaders(token) });
      setData(r.data);
      flash("CTA saved!", true);
    } catch {
      flash("Save failed", false);
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <p className="text-sm text-gray-400 py-8">Loading…</p>;

  const set = (k: keyof CTA) => (v: string) => setData((d) => d && { ...d, [k]: v });

  return (
    <div className="grid gap-4">
      <Field label="Badge text" value={data.badge_text} onChange={set("badge_text")} />
      <Field label="Headline" value={data.headline} onChange={set("headline")} />
      <Field label="Subtitle" value={data.subtitle} onChange={set("subtitle")} multiline />
      <JsonField
        label="Benefits list"
        value={data.benefits}
        onChange={(v) => setData((d) => d && { ...d, benefits: v as string[] })}
        rows={5}
      />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Primary button text" value={data.primary_button_text} onChange={set("primary_button_text")} />
        <Field label="Primary button URL" value={data.primary_button_url} onChange={set("primary_button_url")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Secondary button text" value={data.secondary_button_text} onChange={set("secondary_button_text")} />
        <Field label="Secondary button URL" value={data.secondary_button_url} onChange={set("secondary_button_url")} />
      </div>
      <SaveBtn loading={saving} onClick={save} />
      <Toast {...toast} />
    </div>
  );
}

// ─── Features Tab ─────────────────────────────────────────────────────────────

const FEATURE_ICONS = ["Bot","FileText","Target","BarChart3","Shield","Zap","Star","Crown","Search","Sparkles","Brain","Users"];

function FeaturesTab({ token }: { token: string }) {
  const [items, setItems] = useState<Feature[]>([]);
  const [editing, setEditing] = useState<Feature | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", ok: true });

  const flash = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3000);
  };

  const load = useCallback(() => {
    axios.get(`${BASE}/api/landing/features/`).then((r) => setItems(r.data));
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        await axios.patch(`${BASE}/api/landing/features/${editing.id}/`, editing, { headers: authHeaders(token) });
      } else {
        await axios.post(`${BASE}/api/landing/features/`, editing, { headers: authHeaders(token) });
      }
      flash("Saved!", true);
      load();
      setEditing(null);
    } catch {
      flash("Save failed", false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this feature?")) return;
    await axios.delete(`${BASE}/api/landing/features/${id}/`, { headers: authHeaders(token) });
    flash("Deleted", true);
    load();
  };

  const blank: Feature = { id: 0, title: "", description: "", tag: "New", icon_name: "Zap", is_accent: false, order: items.length, is_active: true };

  return (
    <div className="grid gap-5">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Features ({items.length})</h3>
        <button
          onClick={() => setEditing(blank)}
          className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100"
        >
          + Add Feature
        </button>
      </div>

      <div className="grid gap-2">
        {items.map((f) => (
          <div key={f.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
            <span className="w-5 text-center text-xs text-gray-400">{f.order}</span>
            <span className={`h-2 w-2 rounded-full shrink-0 ${f.is_active ? "bg-emerald-400" : "bg-gray-300"}`} />
            <span className="flex-1 text-sm font-medium text-gray-800">{f.title}</span>
            <span className="text-xs text-gray-400">{f.tag}</span>
            <button onClick={() => setEditing(f)} className="text-xs text-blue-500 hover:underline">Edit</button>
            <button onClick={() => remove(f.id)} className="text-xs text-red-400 hover:underline">Delete</button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 grid gap-4">
          <h4 className="font-bold text-gray-700">{editing.id ? "Edit" : "New"} Feature</h4>
          <Field label="Title" value={editing.title} onChange={(v) => setEditing((e) => e && { ...e, title: v })} />
          <Field label="Description" value={editing.description} onChange={(v) => setEditing((e) => e && { ...e, description: v })} multiline />
          <div className="grid grid-cols-3 gap-4">
            <Field label="Tag" value={editing.tag} onChange={(v) => setEditing((e) => e && { ...e, tag: v })} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Icon</label>
              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={editing.icon_name}
                onChange={(e) => setEditing((f) => f && { ...f, icon_name: e.target.value })}
              >
                {FEATURE_ICONS.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <Field label="Order" value={String(editing.order)} onChange={(v) => setEditing((e) => e && { ...e, order: Number(v) })} />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editing.is_accent} onChange={(e) => setEditing((f) => f && { ...f, is_accent: e.target.checked })} />
              Highlighted (accent)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing((f) => f && { ...f, is_active: e.target.checked })} />
              Active
            </label>
          </div>
          <div className="flex gap-3">
            <SaveBtn loading={saving} onClick={save} />
            <button onClick={() => setEditing(null)} className="mt-2 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
        </div>
      )}
      <Toast {...toast} />
    </div>
  );
}

// ─── How It Works Tab ────────────────────────────────────────────────────────

const STEP_ICONS = ["UserCircle2","Search","Bot","FileText","Target","Zap","Crown","CheckCircle2"];

function StepsTab({ token }: { token: string }) {
  const [items, setItems] = useState<Step[]>([]);
  const [editing, setEditing] = useState<Step | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", ok: true });
  const [checklistRaw, setChecklistRaw] = useState("[]");

  const flash = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3000);
  };

  const load = useCallback(() => {
    axios.get(`${BASE}/api/landing/steps/`).then((r) => setItems(r.data));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (s: Step) => {
    setEditing(s);
    setChecklistRaw(JSON.stringify(s.checklist_items, null, 2));
  };

  const save = async () => {
    if (!editing) return;
    let checklist = editing.checklist_items;
    try { checklist = JSON.parse(checklistRaw); } catch { flash("Invalid checklist JSON", false); return; }
    const payload = { ...editing, checklist_items: checklist };
    setSaving(true);
    try {
      if (editing.id) {
        await axios.patch(`${BASE}/api/landing/steps/${editing.id}/`, payload, { headers: authHeaders(token) });
      } else {
        await axios.post(`${BASE}/api/landing/steps/`, payload, { headers: authHeaders(token) });
      }
      flash("Saved!", true);
      load();
      setEditing(null);
    } catch {
      flash("Save failed", false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this step?")) return;
    await axios.delete(`${BASE}/api/landing/steps/${id}/`, { headers: authHeaders(token) });
    flash("Deleted", true);
    load();
  };

  const blank: Step = { id: 0, number: "0" + (items.length + 1), title: "", description: "", icon_name: "Zap", checklist_items: [], is_accent: false, order: items.length, is_active: true };

  return (
    <div className="grid gap-5">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Steps ({items.length})</h3>
        <button onClick={() => openEdit(blank)} className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100">
          + Add Step
        </button>
      </div>

      <div className="grid gap-2">
        {items.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
            <span className="w-6 text-center text-xs font-mono text-gray-400">{s.number}</span>
            <span className={`h-2 w-2 rounded-full shrink-0 ${s.is_active ? "bg-emerald-400" : "bg-gray-300"}`} />
            <span className="flex-1 text-sm font-medium text-gray-800">{s.title}</span>
            <button onClick={() => openEdit(s)} className="text-xs text-blue-500 hover:underline">Edit</button>
            <button onClick={() => remove(s.id)} className="text-xs text-red-400 hover:underline">Delete</button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 grid gap-4">
          <h4 className="font-bold text-gray-700">{editing.id ? "Edit" : "New"} Step</h4>
          <div className="grid grid-cols-4 gap-4">
            <Field label="Step #" value={editing.number} onChange={(v) => setEditing((e) => e && { ...e, number: v })} />
            <div className="col-span-2">
              <Field label="Title" value={editing.title} onChange={(v) => setEditing((e) => e && { ...e, title: v })} />
            </div>
            <Field label="Order" value={String(editing.order)} onChange={(v) => setEditing((e) => e && { ...e, order: Number(v) })} />
          </div>
          <Field label="Description" value={editing.description} onChange={(v) => setEditing((e) => e && { ...e, description: v })} multiline />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Icon</label>
            <select
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              value={editing.icon_name}
              onChange={(e) => setEditing((f) => f && { ...f, icon_name: e.target.value })}
            >
              {STEP_ICONS.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Checklist items (JSON array)</label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs"
              value={checklistRaw}
              onChange={(e) => setChecklistRaw(e.target.value)}
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editing.is_accent} onChange={(e) => setEditing((f) => f && { ...f, is_accent: e.target.checked })} />
              Highlighted (accent)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing((f) => f && { ...f, is_active: e.target.checked })} />
              Active
            </label>
          </div>
          <div className="flex gap-3">
            <SaveBtn loading={saving} onClick={save} />
            <button onClick={() => setEditing(null)} className="mt-2 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
        </div>
      )}
      <Toast {...toast} />
    </div>
  );
}

// ─── Testimonials Tab ─────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function TestimonialsTab({ token }: { token: string }) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", ok: true });

  const flash = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 3000);
  };

  const load = useCallback(() => {
    axios.get(`${BASE}/api/landing/testimonials/`).then((r) => setItems(r.data));
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        await axios.patch(`${BASE}/api/landing/testimonials/${editing.id}/`, editing, { headers: authHeaders(token) });
      } else {
        await axios.post(`${BASE}/api/landing/testimonials/`, editing, { headers: authHeaders(token) });
      }
      flash("Saved!", true);
      load();
      setEditing(null);
    } catch {
      flash("Save failed", false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this testimonial?")) return;
    await axios.delete(`${BASE}/api/landing/testimonials/${id}/`, { headers: authHeaders(token) });
    flash("Deleted", true);
    load();
  };

  const blank: Testimonial = { id: 0, author_name: "", author_role: "", quote: "", avatar_initials: "AB", avatar_color: AVATAR_COLORS[0], order: items.length, is_active: true };

  return (
    <div className="grid gap-5">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Testimonials ({items.length})</h3>
        <button onClick={() => setEditing(blank)} className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100">
          + Add Testimonial
        </button>
      </div>

      <div className="grid gap-2">
        {items.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${t.avatar_color}`}>{t.avatar_initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{t.author_name}</p>
              <p className="text-xs text-gray-400 truncate">{t.author_role}</p>
            </div>
            <button onClick={() => setEditing(t)} className="text-xs text-blue-500 hover:underline">Edit</button>
            <button onClick={() => remove(t.id)} className="text-xs text-red-400 hover:underline">Delete</button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 grid gap-4">
          <h4 className="font-bold text-gray-700">{editing.id ? "Edit" : "New"} Testimonial</h4>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Author name" value={editing.author_name} onChange={(v) => setEditing((e) => e && { ...e, author_name: v })} />
            <Field label="Author role" value={editing.author_role} onChange={(v) => setEditing((e) => e && { ...e, author_role: v })} />
          </div>
          <Field label="Quote" value={editing.quote} onChange={(v) => setEditing((e) => e && { ...e, quote: v })} multiline />
          <div className="grid grid-cols-3 gap-4">
            <Field label="Avatar initials" value={editing.avatar_initials} onChange={(v) => setEditing((e) => e && { ...e, avatar_initials: v })} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Avatar color</label>
              <select
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={editing.avatar_color}
                onChange={(e) => setEditing((f) => f && { ...f, avatar_color: e.target.value })}
              >
                {AVATAR_COLORS.map((c) => <option key={c} value={c}>{c.split(" ")[0].replace("bg-", "")}</option>)}
              </select>
            </div>
            <Field label="Order" value={String(editing.order)} onChange={(v) => setEditing((e) => e && { ...e, order: Number(v) })} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing((f) => f && { ...f, is_active: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-3">
            <SaveBtn loading={saving} onClick={save} />
            <button onClick={() => setEditing(null)} className="mt-2 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
        </div>
      )}
      <Toast {...toast} />
    </div>
  );
}

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: (token: string, email: string) => void }) {
  const [email, setEmail] = useState("Dipayan@venushiring.ca");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await axios.post(`${BASE}/api/auth/login/`, { email, password });
      onLogin(r.data.access, r.data.email);
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <span className="text-white font-black text-lg">H</span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900">Content Panel</h1>
          <p className="text-sm text-gray-400 mt-1">Hizorex landing page editor</p>
        </div>

        <form onSubmit={submit} className="grid gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

const TABS = [
  { key: "hero", label: "Hero" },
  { key: "features", label: "Features" },
  { key: "steps", label: "How It Works" },
  { key: "cta", label: "CTA" },
  { key: "testimonials", label: "Testimonials" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export default function ContentPanel() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("hero");

  const handleLogin = (tok: string, email: string) => {
    localStorage.setItem(TOKEN_KEY, tok);
    setToken(tok);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUserEmail(null);
  };

  if (!token) return <LoginForm onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-black text-sm">H</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-none">Hizorex</p>
            <p className="text-xs text-gray-400">Content Editor</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-500 hover:underline"
          >
            View live site →
          </a>
          <span className="text-xs text-gray-400">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white px-6">
        <nav className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {activeTab === "hero" && <HeroTab token={token} />}
          {activeTab === "features" && <FeaturesTab token={token} />}
          {activeTab === "steps" && <StepsTab token={token} />}
          {activeTab === "cta" && <CTATab token={token} />}
          {activeTab === "testimonials" && <TestimonialsTab token={token} />}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Changes go live within 5 minutes (cache refreshes automatically).
        </p>
      </main>
    </div>
  );
}
