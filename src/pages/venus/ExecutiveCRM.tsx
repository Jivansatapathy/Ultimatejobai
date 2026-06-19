import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Loader2, Search, Sparkles, X, Edit2, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { venusService, CRMContact } from "@/services/venusService";

const CONTACT_TYPES: CRMContact["contact_type"][] = ["recruiter","vc","pe_firm","founder","board_member","exec_search","advisor","family_office"];
const TYPE_LABELS: Record<CRMContact["contact_type"], string> = {
  recruiter: "Recruiter", vc: "VC", pe_firm: "PE Firm",
  founder: "Founder", board_member: "Board Member",
  exec_search: "Executive Search", advisor: "Advisor", family_office: "Family Office",
};
const TYPE_COLORS: Record<CRMContact["contact_type"], string> = {
  recruiter: "bg-blue-900/40 text-blue-300", vc: "bg-violet-900/40 text-violet-300",
  pe_firm: "bg-amber-900/40 text-amber-300", founder: "bg-teal-900/40 text-teal-300",
  board_member: "bg-pink-900/40 text-pink-300", exec_search: "bg-orange-900/40 text-orange-300",
  advisor: "bg-zinc-700 text-zinc-300", family_office: "bg-emerald-900/40 text-emerald-300",
};

const EMPTY_CONTACT: Omit<CRMContact, "id"> = {
  name: "", firm: "", title: "", email: "", linkedin_url: "",
  contact_type: "recruiter", warmth_score: 50, next_action: "", notes: "",
};

function WarmthBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[10px] font-bold text-zinc-500 w-6">{score}</span>
    </div>
  );
}

function ContactCard({ contact, onEdit, onDelete, onEnrich }: {
  contact: CRMContact;
  onEdit: (c: CRMContact) => void;
  onDelete: (id: string) => void;
  onEnrich: (id: string) => void;
}) {
  const initials = contact.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-all">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-sm font-bold text-zinc-300">
          {initials || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-white">{contact.name || "Unnamed"}</p>
              <p className="text-xs text-zinc-400">{contact.title}{contact.firm ? ` · ${contact.firm}` : ""}</p>
            </div>
            <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${TYPE_COLORS[contact.contact_type]}`}>
              {TYPE_LABELS[contact.contact_type]}
            </span>
          </div>

          <div className="mt-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Warmth</p>
            <WarmthBar score={contact.warmth_score} />
          </div>

          {contact.next_action && (
            <p className="mt-2 text-xs text-violet-300 font-medium">→ {contact.next_action}</p>
          )}

          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => onEdit(contact)}
              className="h-7 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800">
              <Edit2 className="h-3 w-3 mr-1" /> Edit
            </Button>
            {contact.id && (
              <Button size="sm" variant="outline" onClick={() => onEnrich(contact.id!)}
                className="h-7 text-xs border-zinc-700 text-zinc-400 hover:bg-zinc-800">
                <Sparkles className="h-3 w-3 mr-1" /> Enrich
              </Button>
            )}
            {contact.id && (
              <Button size="sm" variant="outline" onClick={() => onDelete(contact.id!)}
                className="h-7 text-xs border-red-900/50 text-red-400 hover:bg-red-950">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ContactForm({ initial, onSave, onClose }: {
  initial: Omit<CRMContact, "id"> & { id?: string };
  onSave: (c: typeof initial) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-white">{form.id ? "Edit Contact" : "Add Contact"}</h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          {[
            { label: "Full Name", key: "name" as const, placeholder: "Sarah Kim" },
            { label: "Firm / Company", key: "firm" as const, placeholder: "Sequoia Capital" },
            { label: "Title", key: "title" as const, placeholder: "Partner" },
            { label: "Email", key: "email" as const, placeholder: "sarah@sequoia.com" },
            { label: "LinkedIn URL", key: "linkedin_url" as const, placeholder: "linkedin.com/in/..." },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">{label}</label>
              <Input value={(form[key] as string) || ""} onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl" />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">Contact Type</label>
            <select value={form.contact_type} onChange={e => set("contact_type", e.target.value as CRMContact["contact_type"])}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-violet-500">
              {CONTACT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">Warmth Score (0-100)</label>
            <Input type="number" min={0} max={100} value={form.warmth_score}
              onChange={e => set("warmth_score", parseInt(e.target.value) || 0)}
              className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">Next Action</label>
            <Input value={form.next_action || ""} onChange={e => set("next_action", e.target.value)}
              placeholder="Follow up after SaaStr Annual"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">Notes</label>
            <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2}
              placeholder="Met at AWS re:Invent. Interested in AI infrastructure roles."
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-violet-500 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="outline" onClick={onClose} className="flex-1 border-zinc-700 text-zinc-300">Cancel</Button>
          <Button onClick={() => onSave(form)} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">Save Contact</Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ExecutiveCRM() {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CRMContact["contact_type"] | "">("");
  const [editing, setEditing] = useState<(Omit<CRMContact, "id"> & { id?: string }) | null>(null);

  useEffect(() => {
    venusService.getContacts()
      .then(setContacts)
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, []);

  const save = async (form: Omit<CRMContact, "id"> & { id?: string }) => {
    try {
      if (form.id) {
        const updated = await venusService.updateContact(form.id, form);
        setContacts(c => c.map(x => x.id === form.id ? updated : x));
      } else {
        const created = await venusService.addContact(form as Omit<CRMContact, "id">);
        setContacts(c => [created, ...c]);
      }
      toast.success("Contact saved.");
    } catch {
      toast.error("Saved locally — API not connected.");
      const local = { ...form, id: form.id || `local-${Date.now()}` };
      if (form.id) setContacts(c => c.map(x => x.id === form.id ? local : x));
      else setContacts(c => [local, ...c]);
    }
    setEditing(null);
  };

  const remove = async (id: string) => {
    try { await venusService.deleteContact(id); } catch { }
    setContacts(c => c.filter(x => x.id !== id));
    toast.success("Contact removed.");
  };

  const enrich = async (id: string) => {
    toast.info("Enriching via Bright Data LinkedIn...");
    try {
      const enriched = await venusService.enrichContact(id);
      setContacts(c => c.map(x => x.id === id ? enriched : x));
      toast.success("Contact enriched.");
    } catch {
      toast.error("Enrichment failed — Bright Data API not yet connected.");
    }
  };

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.firm.toLowerCase().includes(q);
    const matchT = !typeFilter || c.contact_type === typeFilter;
    return matchQ && matchT;
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {editing && <ContactForm initial={editing} onSave={save} onClose={() => setEditing(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Phase 3 · Network</p>
          <h1 className="text-2xl font-black text-white mt-0.5">Executive CRM</h1>
          <p className="text-sm text-zinc-500 mt-1">{contacts.length} contacts tracked</p>
        </div>
        <Button onClick={() => setEditing(EMPTY_CONTACT)}
          className="bg-violet-600 hover:bg-violet-700 text-white">
          <Plus className="h-4 w-4 mr-1.5" /> Add Contact
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl h-10" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as CRMContact["contact_type"] | "")}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 outline-none focus:border-violet-500">
          <option value="">All Types</option>
          {CONTACT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-zinc-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading contacts...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
          <Users className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 font-semibold">{contacts.length === 0 ? "No contacts yet — add your first" : "No contacts match filters"}</p>
          {contacts.length === 0 && (
            <Button size="sm" className="mt-3 bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => setEditing(EMPTY_CONTACT)}>
              <Plus className="h-4 w-4 mr-1" /> Add Contact
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {filtered.map(c => (
              <ContactCard key={c.id} contact={c}
                onEdit={setEditing}
                onDelete={remove}
                onEnrich={enrich} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
