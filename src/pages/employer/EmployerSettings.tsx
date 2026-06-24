import { useEffect, useState } from "react";
import { ExternalLink, Heart, Loader2, MoonStar, Paintbrush2, Plus, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Panel } from "@/components/employer/Panel";
import { PageHeader } from "@/components/employer/PageHeader";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import { useTheme } from "@/hooks/use-theme";
import { createEmployerTeamMember, getEmployerTeamMembers, seedEmployerDemoData, updateEmployerPreferences } from "@/services/employerService";
import { EmployerTeamMember } from "@/types/employer";

const roleColors: Record<string, string> = {
  admin:          "bg-purple-50 text-purple-700 border-purple-200",
  recruiter:      "bg-blue-50 text-blue-700 border-blue-200",
  hiring_manager: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
      {children}
    </div>
  );
}

export default function EmployerSettings() {
  const { profile, refreshProfile, user, isEmployer } = useEmployerAuth();
  const { theme, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState(profile?.full_name || "");
  const [companyName, setCompanyName] = useState(profile?.company_name || "");
  const [website, setWebsite] = useState(profile?.website || "");
  const [contactEmail, setContactEmail] = useState(profile?.contact_email || "");
  const [contactPhone, setContactPhone] = useState(profile?.contact_phone || "");
  const [brandTagline, setBrandTagline] = useState(profile?.brand_tagline || "");
  const [brandSummary, setBrandSummary] = useState(profile?.brand_summary || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  const [linkedinSyncEnabled, setLinkedinSyncEnabled] = useState(profile?.integrations?.linkedin_sync_enabled || false);
  const [externalPostingEnabled, setExternalPostingEnabled] = useState(profile?.integrations?.external_posting_enabled || false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [teamMembers, setTeamMembers] = useState<EmployerTeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "recruiter" | "hiring_manager">("recruiter");
  const [perks, setPerks] = useState<string[]>(profile?.perks || []);
  const [newPerk, setNewPerk] = useState("");
  const canManageTeam = !!profile?.permissions?.can_manage_team;

  const inputCls = "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

  useEffect(() => {
    setDisplayName(profile?.full_name || "");
    setCompanyName(profile?.company_name || "");
    setWebsite(profile?.website || "");
    setContactEmail(profile?.contact_email || "");
    setContactPhone(profile?.contact_phone || "");
    setBrandTagline(profile?.brand_tagline || "");
    setBrandSummary(profile?.brand_summary || "");
    setLinkedinUrl(profile?.linkedin_url || "");
    setLinkedinSyncEnabled(profile?.integrations?.linkedin_sync_enabled || false);
    setExternalPostingEnabled(profile?.integrations?.external_posting_enabled || false);
  }, [profile]);

  useEffect(() => {
    const loadTeam = async () => {
      if (!user || !isEmployer) { setTeamMembers([]); return; }
      try {
        setTeamLoading(true);
        setTeamMembers(await getEmployerTeamMembers());
      } finally { setTeamLoading(false); }
    };
    loadTeam();
  }, [isEmployer, user]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateEmployerPreferences({
        full_name: displayName.trim(), company_name: companyName.trim(),
        contact_email: contactEmail.trim(), contact_phone: contactPhone.trim(),
        website: website.trim(), brand_tagline: brandTagline.trim(),
        brand_summary: brandSummary.trim(), linkedin_url: linkedinUrl.trim(),
        linkedin_sync_enabled: linkedinSyncEnabled, external_posting_enabled: externalPostingEnabled,
      });
      await refreshProfile();
      toast.success("Settings saved.");
    } catch (error) { console.error(error); toast.error("Unable to save settings."); }
    finally { setSaving(false); }
  };

  const handleSeed = async () => {
    if (!profile) return;
    setSeeding(true);
    try { await seedEmployerDemoData(); toast.success("Sample jobs and applicants created."); }
    catch (error) { console.error(error); toast.error("Unable to create sample data."); }
    finally { setSeeding(false); }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) { toast.error("Add a name and email first."); return; }
    try {
      const member = await createEmployerTeamMember({ email: inviteEmail.trim(), full_name: inviteName.trim(), role: inviteRole });
      setTeamMembers((current) => {
        const filtered = current.filter((item) => item.id !== member.id && item.email !== member.email);
        return [...filtered, member].sort((l, r) => l.full_name.localeCompare(r.full_name));
      });
      setInviteEmail(""); setInviteName(""); setInviteRole("recruiter");
      toast.success("Team member saved.");
    } catch (error) { console.error(error); toast.error("Unable to save team member."); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Manage employer profile details, integrations, and team members."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        {/* Profile form */}
        <Panel title="Employer profile and branding">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display name">
                <input aria-label="Display name" placeholder="Your name" className={inputCls} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </Field>
              <Field label="Company name">
                <input aria-label="Company name" placeholder="Acme Corp" className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </Field>
              <Field label="Contact email">
                <input aria-label="Contact email" placeholder="you@company.com" className={inputCls} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </Field>
              <Field label="Contact phone">
                <input aria-label="Contact phone" placeholder="+1 555 000 0000" className={inputCls} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </Field>
            </div>
            <Field label="Company website">
              <input className={inputCls} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://company.com" />
            </Field>
            <Field label="Brand tagline">
              <input className={inputCls} value={brandTagline} onChange={(e) => setBrandTagline(e.target.value)} placeholder="What makes your team special?" />
            </Field>
            <Field label="Brand summary">
              <input className={inputCls} value={brandSummary} onChange={(e) => setBrandSummary(e.target.value)} placeholder="Short employer story for company pages." />
            </Field>
            <Field label="LinkedIn company URL">
              <input className={inputCls} value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/company/your-brand" />
            </Field>
            <div className="flex items-center justify-between pt-2">
              {!canManageTeam && <p className="text-sm text-gray-400">Only admins can change workspace settings.</p>}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !canManageTeam}
                className="ml-auto inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save profile
              </button>
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
          {/* Appearance & integrations */}
          <Panel title="Appearance & integrations">
            <div className="space-y-3">
              {[
                {
                  icon: <MoonStar className="h-4 w-4 text-gray-400" />,
                  label: "Dark mode",
                  sub: "Switch the workspace between light and dark themes.",
                  control: <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />,
                },
                {
                  icon: <Paintbrush2 className="h-4 w-4 text-gray-400" />,
                  label: "LinkedIn sync readiness",
                  sub: "Mark this workspace ready for LinkedIn posting.",
                  control: <Switch checked={linkedinSyncEnabled} onCheckedChange={setLinkedinSyncEnabled} />,
                },
                {
                  icon: <ExternalLink className="h-4 w-4 text-gray-400" />,
                  label: "External job board posting",
                  sub: "Enable external publishing adapters.",
                  control: <Switch checked={externalPostingEnabled} onCheckedChange={setExternalPostingEnabled} />,
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    {row.icon}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{row.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{row.sub}</p>
                    </div>
                  </div>
                  {row.control}
                </div>
              ))}

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Brand preview</p>
                <p className="text-sm font-bold text-gray-900">{companyName || "Your company"}</p>
                <p className="text-sm text-gray-500 mt-0.5">{brandTagline || "Add a tagline to sharpen your employer brand."}</p>
                {brandSummary && <p className="text-xs text-gray-400 mt-2">{brandSummary}</p>}
              </div>
            </div>
          </Panel>

          {/* Culture & perks */}
          <Panel title="Company Culture & Perks">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {perks.map((perk) => (
                  <span key={perk} className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 border border-pink-200 pl-3 pr-2 py-1 text-xs font-semibold text-pink-700">
                    <Heart className="h-3 w-3" />
                    {perk}
                    <button
                      type="button"
                      aria-label={`Remove ${perk}`}
                      onClick={() => setPerks((current) => current.filter((p) => p !== perk))}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-pink-100 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {perks.length === 0 ? (
                  <p className="text-sm text-gray-400">Add benefits like "Remote work", "Health insurance", "Stock options".</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <input
                  value={newPerk}
                  onChange={(e) => setNewPerk(e.target.value)}
                  placeholder="e.g., Flexible hours, Free lunch, 401k"
                  className={inputCls}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPerk.trim()) {
                      setPerks((current) => [...new Set([...current, newPerk.trim()])]);
                      setNewPerk("");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => { if (newPerk.trim()) { setPerks((current) => [...new Set([...current, newPerk.trim()])]); setNewPerk(""); } }}
                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {["Remote work", "Health insurance", "Flexible hours", "Stock options", "Learning budget", "Team events", "Free lunch", "Gym membership", "Unlimited PTO"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPerks((current) => [...new Set([...current, s])])}
                    disabled={perks.includes(s)}
                    className="rounded-xl border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-left"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          {/* Role-Based Access */}
          <Panel title="Role-Based Access Control">
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <p className="text-sm text-gray-500">
                  Your role: <span className="font-bold text-gray-900 capitalize">{(profile?.workspace_role || "admin").replace("_", " ")}</span>
                </p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-3 text-left font-semibold text-gray-600">Permission</th>
                      <th className="p-3 text-center font-semibold text-gray-600">Admin</th>
                      <th className="p-3 text-center font-semibold text-gray-600">Recruiter</th>
                      <th className="p-3 text-center font-semibold text-gray-600">Hiring Mgr</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { label: "Manage jobs",        admin: true,  recruiter: true,  manager: false },
                      { label: "Manage candidates",  admin: true,  recruiter: true,  manager: true  },
                      { label: "Manage team",        admin: true,  recruiter: false, manager: false },
                      { label: "Manage integrations",admin: true,  recruiter: false, manager: false },
                      { label: "View analytics",     admin: true,  recruiter: true,  manager: true  },
                      { label: "Send offers",        admin: true,  recruiter: true,  manager: false },
                      { label: "Talent pool",        admin: true,  recruiter: true,  manager: true  },
                    ].map((row) => (
                      <tr key={row.label} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-700">{row.label}</td>
                        <td className="p-3 text-center">{row.admin     ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-gray-300">—</span>}</td>
                        <td className="p-3 text-center">{row.recruiter ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-gray-300">—</span>}</td>
                        <td className="p-3 text-center">{row.manager   ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-gray-300">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>

          {/* Sample data */}
          <Panel title="Sample backend integration">
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <p className="text-sm font-semibold text-gray-900">Django API integration</p>
                </div>
                <p className="text-sm text-gray-500">
                  Use the sample data generator to create example jobs, applicants, and activity records.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSeed}
                disabled={seeding}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 disabled:opacity-50 transition-colors"
              >
                {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Load sample data
              </button>
            </div>
          </Panel>

          {/* Team members */}
          <Panel title="Recruiter team">
            <div className="space-y-4">
              <div className="space-y-2">
                <input className={inputCls} value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Team member name" />
                <input className={inputCls} value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="team@company.com" />
                <select
                  aria-label="Team member role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "admin" | "recruiter" | "hiring_manager")}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                >
                  <option value="recruiter">Recruiter</option>
                  <option value="hiring_manager">Hiring Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="button"
                  onClick={handleInvite}
                  disabled={!canManageTeam}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 disabled:opacity-40 transition-colors"
                >
                  Add team member
                </button>
                {!canManageTeam && <p className="text-xs text-gray-400">Only employer admins can invite or edit team members.</p>}
              </div>

              <div className="space-y-2">
                {teamLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading team members...
                  </div>
                ) : teamMembers.length ? (
                  teamMembers.map((member) => (
                    <div key={member.id} className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{member.full_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{member.email}</p>
                          {member.invite_url ? (
                            <a href={member.invite_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-xs font-medium text-teal-600 hover:underline">
                              Open invite link
                            </a>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${roleColors[member.role] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {member.role.replace("_", " ")}
                          </span>
                          <p className="text-xs uppercase tracking-wider text-gray-400 mt-1">{member.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-400">
                    No team members added yet. Add recruiters or hiring managers to share the employer workspace.
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
