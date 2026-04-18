import { useEffect, useState } from "react";
import { ExternalLink, Heart, Loader2, MoonStar, Paintbrush2, Plus, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/employer/PageHeader";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import { useTheme } from "@/hooks/use-theme";
import { createEmployerTeamMember, getEmployerTeamMembers, seedEmployerDemoData, updateEmployerPreferences } from "@/services/employerService";
import { EmployerTeamMember } from "@/types/employer";

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
      if (!user || !isEmployer) {
        setTeamMembers([]);
        return;
      }
      try {
        setTeamLoading(true);
        setTeamMembers(await getEmployerTeamMembers());
      } finally {
        setTeamLoading(false);
      }
    };
    loadTeam();
  }, [isEmployer, user]);

  const handleSave = async () => {
    if (!profile) {
      return;
    }
    setSaving(true);
    try {
      await updateEmployerPreferences({
        full_name: displayName.trim(),
        company_name: companyName.trim(),
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone.trim(),
        website: website.trim(),
        brand_tagline: brandTagline.trim(),
        brand_summary: brandSummary.trim(),
        linkedin_url: linkedinUrl.trim(),
        linkedin_sync_enabled: linkedinSyncEnabled,
        external_posting_enabled: externalPostingEnabled,
      });
      await refreshProfile();
      toast.success("Settings saved.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    if (!profile) {
      return;
    }
    setSeeding(true);
    try {
      await seedEmployerDemoData();
      toast.success("Sample jobs and applicants created.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to create sample data.");
    } finally {
      setSeeding(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast.error("Add a name and email first.");
      return;
    }
    try {
      const member = await createEmployerTeamMember({
        email: inviteEmail.trim(),
        full_name: inviteName.trim(),
        role: inviteRole,
      });
      setTeamMembers((current) => {
        const filtered = current.filter((item) => item.id !== member.id && item.email !== member.email);
        return [...filtered, member].sort((left, right) => left.full_name.localeCompare(right.full_name));
      });
      setInviteEmail("");
      setInviteName("");
      setInviteRole("recruiter");
      toast.success("Team member saved.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to save team member.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Manage employer profile details, dark mode, and Django-backed sample data for demos or onboarding."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle>Employer profile and branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display name</label>
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company name</label>
              <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact email</label>
              <Input value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact phone</label>
              <Input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company website</label>
              <Input value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://company.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand tagline</label>
              <Input value={brandTagline} onChange={(event) => setBrandTagline(event.target.value)} placeholder="What makes your team special?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand summary</label>
              <Input value={brandSummary} onChange={(event) => setBrandSummary(event.target.value)} placeholder="Short employer story for future company pages." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn company URL</label>
              <Input value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} placeholder="https://linkedin.com/company/your-brand" />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving || !canManageTeam}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save profile
              </Button>
            </div>
            {!canManageTeam ? <p className="text-sm text-muted-foreground">Only employer admins can change workspace settings.</p> : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl border-border/70">
            <CardHeader>
              <CardTitle>Appearance and integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-secondary/60 p-4">
                <div>
                  <p className="font-medium">Dark mode</p>
                  <p className="text-sm text-muted-foreground">Switch the employer workspace between light and dark themes.</p>
                </div>
                <div className="flex items-center gap-3">
                  <MoonStar className="h-4 w-4 text-muted-foreground" />
                  <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
                </div>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Paintbrush2 className="h-4 w-4 text-accent" />
                  Current theme: {theme}
                </div>
                <p className="mt-2">Theme stays local, while your branding and integration readiness are stored in Django employer profile metadata.</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-secondary/60 p-4">
                <div>
                  <p className="font-medium">LinkedIn sync readiness</p>
                  <p className="text-sm text-muted-foreground">Mark this workspace ready for future LinkedIn posting integration.</p>
                </div>
                <Switch checked={linkedinSyncEnabled} onCheckedChange={setLinkedinSyncEnabled} />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-secondary/60 p-4">
                <div>
                  <p className="font-medium">External job board posting</p>
                  <p className="text-sm text-muted-foreground">Use this flag to prepare the workspace for external publishing adapters.</p>
                </div>
                <Switch checked={externalPostingEnabled} onCheckedChange={setExternalPostingEnabled} />
              </div>
              <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <ExternalLink className="h-4 w-4 text-accent" />
                  Company brand preview
                </div>
                <p className="mt-2 font-medium text-foreground">{companyName || "Your company"}</p>
                <p className="mt-1">{brandTagline || "Add a tagline to sharpen your employer brand."}</p>
                <p className="mt-2 text-xs">{brandSummary || "A short summary will help future company pages and external posting surfaces."}</p>
              </div>
            </CardContent>
          </Card>

          {/* Culture & Perks */}
          <Card className="rounded-3xl border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Company Culture & Perks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {perks.map((perk) => (
                  <Badge key={perk} variant="secondary" className="rounded-full gap-1 pr-1 text-sm">
                    {perk}
                    <button
                      onClick={() => setPerks((current) => current.filter((p) => p !== perk))}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {perks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No perks added yet. Add benefits like "Remote work", "Health insurance", "Stock options".</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newPerk}
                  onChange={(e) => setNewPerk(e.target.value)}
                  placeholder="e.g., Flexible hours, Free lunch, 401k"
                  className="rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPerk.trim()) {
                      setPerks((current) => [...new Set([...current, newPerk.trim()])]);
                      setNewPerk("");
                    }
                  }}
                />
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    if (newPerk.trim()) {
                      setPerks((current) => [...new Set([...current, newPerk.trim()])]);
                      setNewPerk("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {["Remote work", "Health insurance", "Flexible hours", "Stock options", "Learning budget", "Team events", "Free lunch", "Gym membership", "Unlimited PTO"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPerks((current) => [...new Set([...current, suggestion])])}
                    className="rounded-xl border border-dashed border-border/80 px-3 py-2 text-xs text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors text-left"
                    disabled={perks.includes(suggestion)}
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Role-Based Access Control */}
          <Card className="rounded-3xl border-border/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent" />
                Role-Based Access Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Your current role: <span className="font-semibold text-foreground capitalize">{(profile?.workspace_role || "admin").replace("_", " ")}</span>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left font-semibold">Permission</th>
                      <th className="p-3 text-center font-semibold">Admin</th>
                      <th className="p-3 text-center font-semibold">Recruiter</th>
                      <th className="p-3 text-center font-semibold">Hiring Manager</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {[
                      { label: "Manage jobs", admin: true, recruiter: true, manager: false },
                      { label: "Manage candidates", admin: true, recruiter: true, manager: true },
                      { label: "Manage team", admin: true, recruiter: false, manager: false },
                      { label: "Manage integrations", admin: true, recruiter: false, manager: false },
                      { label: "View analytics", admin: true, recruiter: true, manager: true },
                      { label: "Send offers", admin: true, recruiter: true, manager: false },
                      { label: "Access talent pool", admin: true, recruiter: true, manager: true },
                      { label: "Manage notifications", admin: true, recruiter: true, manager: true },
                    ].map((row) => (
                      <tr key={row.label}>
                        <td className="p-3 text-muted-foreground">{row.label}</td>
                        <td className="p-3 text-center">{row.admin ? "✅" : "—"}</td>
                        <td className="p-3 text-center">{row.recruiter ? "✅" : "—"}</td>
                        <td className="p-3 text-center">{row.manager ? "✅" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70">
            <CardHeader>
              <CardTitle>Sample backend integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  Django API integration
                </div>
                <p className="mt-2">
                  Use the sample data generator to create example jobs, applicants, and activity records so the dashboard is populated immediately.
                </p>
              </div>
              <Button variant="outline" className="w-full rounded-2xl" onClick={handleSeed} disabled={seeding}>
                {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Load sample data
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70">
            <CardHeader>
              <CardTitle>Recruiter team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Input value={inviteName} onChange={(event) => setInviteName(event.target.value)} placeholder="Team member name" />
                <Input value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="team@company.com" />
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as "admin" | "recruiter" | "hiring_manager")}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="recruiter">Recruiter</option>
                  <option value="hiring_manager">Hiring Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <Button variant="outline" className="rounded-2xl" onClick={handleInvite} disabled={!canManageTeam}>
                  Add team member
                </Button>
              </div>
              {!canManageTeam ? <p className="text-sm text-muted-foreground">Only employer admins can invite or edit team members.</p> : null}

              <div className="space-y-3">
                {teamLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading team members...
                  </div>
                ) : teamMembers.length ? (
                  teamMembers.map((member) => (
                    <div key={member.id} className="rounded-2xl bg-secondary/60 p-4 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{member.full_name}</p>
                          <p className="text-muted-foreground">{member.email}</p>
                          {member.invite_url ? (
                            <a href={member.invite_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-xs font-medium text-accent hover:underline">
                              Open invite link
                            </a>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <p className="font-medium capitalize text-foreground">{member.role.replace("_", " ")}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{member.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                    No team members added yet. Add recruiters or hiring managers to share the employer workspace.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
