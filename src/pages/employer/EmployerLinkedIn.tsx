import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { CalendarClock, ExternalLink, ImagePlus, Loader2, LogOut, RefreshCw, Send, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/components/employer/EmptyState";
import { LoadingState } from "@/components/employer/LoadingState";
import { MetricCard } from "@/components/employer/MetricCard";
import { PageHeader } from "@/components/employer/PageHeader";
import { Panel } from "@/components/employer/Panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getEmployerJobs } from "@/services/employerService";
import {
  disconnectLinkedIn,
  generateLinkedInText,
  generateLinkedInPosts,
  getLinkedInCampaign,
  getLinkedInConnection,
  getLinkedInGlobalAnalytics,
  getLinkedInJobAnalytics,
  getLinkedInPostVariations,
  getLinkedInPublishedPosts,
  initiateLinkedInOAuth,
  publishLinkedInPost,
  syncLinkedInEngagement,
  updateLinkedInCampaignStep,
  updateLinkedInConnection,
  updateLinkedInVariation,
  uploadLinkedInImage,
} from "@/services/linkedinService";
import {
  JobPosting,
  LinkedInCampaign,
  LinkedInConnection,
  LinkedInGlobalAnalytics,
  LinkedInJobAnalytics,
  LinkedInPostVariation,
  LinkedInPublishedPost,
} from "@/types/employer";

const emptyGlobalAnalytics: LinkedInGlobalAnalytics = {
  total_posts: 0,
  total_clicks: 0,
  total_applications: 0,
  conversion_rate: 0,
  best_performing_tone: "N/A",
  advancement: 0,
};

const emptyJobAnalytics: LinkedInJobAnalytics = {
  job_id: "",
  total_posts: 0,
  total_link_clicks: 0,
  total_applications_from_linkedin: 0,
  breakdown: [],
};

const toneLabels: Record<string, string> = {
  formal: "Formal",
  casual: "Casual",
  urgent: "Urgent",
  referral: "Referral",
};

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const maybeResponse = (error as { response?: { data?: { error?: string; detail?: string } } }).response;
    const apiMessage = maybeResponse?.data?.error || maybeResponse?.data?.detail;
    if (apiMessage) return apiMessage;
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return "Something went wrong. Please try again.";
}

export default function EmployerLinkedIn() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState("");
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [connection, setConnection] = useState<LinkedInConnection | null>(null);
  const [globalAnalytics, setGlobalAnalytics] = useState<LinkedInGlobalAnalytics>(emptyGlobalAnalytics);
  const [jobAnalytics, setJobAnalytics] = useState<LinkedInJobAnalytics>(emptyJobAnalytics);
  const [variations, setVariations] = useState<LinkedInPostVariation[]>([]);
  const [campaign, setCampaign] = useState<LinkedInCampaign | null>(null);
  const [publishedPosts, setPublishedPosts] = useState<LinkedInPublishedPost[]>([]);
  const [contentDrafts, setContentDrafts] = useState<Record<string, string>>({});
  const [hashtagDrafts, setHashtagDrafts] = useState<Record<string, string>>({});
  const [scheduleDrafts, setScheduleDrafts] = useState<Record<string, string>>({});
  const [primaryVariationId, setPrimaryVariationId] = useState("");
  const [showScheduler, setShowScheduler] = useState(false);
  const [publishModalUrl, setPublishModalUrl] = useState("");
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState<"formal" | "casual" | "urgent" | "referral">("formal");
  const [generatedVariationId, setGeneratedVariationId] = useState("");
  const [randomPostTopic, setRandomPostTopic] = useState("");
  const [randomPostTone, setRandomPostTone] = useState<"formal" | "casual" | "urgent" | "referral">("casual");
  const [randomPostDraft, setRandomPostDraft] = useState("");

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) || null,
    [jobs, selectedJobId],
  );
  const primaryVariation = useMemo(
    () => variations.find((v) => v.id === primaryVariationId) || variations[0] || null,
    [primaryVariationId, variations],
  );

  const getStepVariation = (step: LinkedInCampaign["steps"][number]) =>
    variations.find((v) => v.id === step.variation || v.tone === step.variation_tone) || null;

  useEffect(() => {
    const status = searchParams.get("status");
    const error = searchParams.get("error");
    if (!status && !error) return;
    if (status === "success") toast.success("LinkedIn connected successfully.");
    if (error) {
      const messages: Record<string, string> = {
        invalid_state: "LinkedIn login expired. Please connect again.",
        missing_params: "LinkedIn callback was incomplete.",
        user_not_found: "Employer account not found for this LinkedIn login.",
        token_exchange_failed: "LinkedIn token exchange failed. Please retry.",
      };
      toast.error(messages[error] || `LinkedIn connection failed: ${error}`);
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const withBusy = async (key: string, task: () => Promise<void>) => {
    setBusyKey(key);
    try { await task(); } catch (error) { toast.error(getErrorMessage(error)); } finally { setBusyKey(""); }
  };

  const loadJobData = async (jobId: string) => {
    const [variationData, analyticsData, campaignData] = await Promise.all([
      getLinkedInPostVariations(jobId).catch(() => []),
      getLinkedInJobAnalytics(jobId).catch(() => ({ ...emptyJobAnalytics, job_id: jobId })),
      getLinkedInCampaign(jobId).catch(() => null),
    ]);
    setVariations(variationData);
    setPrimaryVariationId((current) => current || variationData[0]?.id || "");
    setJobAnalytics(analyticsData);
    setCampaign(campaignData);
    setContentDrafts(variationData.reduce<Record<string, string>>((acc, v) => { acc[v.id] = v.content; return acc; }, {}));
    setHashtagDrafts(variationData.reduce<Record<string, string>>((acc, v) => { acc[v.id] = v.hashtags.join(", "); return acc; }, {}));
    setScheduleDrafts((campaignData?.steps || []).reduce<Record<string, string>>((acc, step) => { acc[step.id] = toDatetimeLocal(step.scheduled_at); return acc; }, {}));
  };

  const loadPage = async (jobId?: string) => {
    const [jobData, connectionData, analyticsData, postsData] = await Promise.all([
      getEmployerJobs().catch(() => []),
      getLinkedInConnection().catch(() => ({ status: "disconnected", connected: false })),
      getLinkedInGlobalAnalytics().catch(() => emptyGlobalAnalytics),
      getLinkedInPublishedPosts().catch(() => []),
    ]);
    setJobs(jobData);
    setConnection(connectionData);
    setGlobalAnalytics(analyticsData);
    setPublishedPosts(postsData);
    const nextJobId = jobId || selectedJobId || jobData[0]?.id || "";
    if (nextJobId) { setSelectedJobId(nextJobId); await loadJobData(nextJobId); }
    else { setSelectedJobId(""); setVariations([]); setCampaign(null); setJobAnalytics(emptyJobAnalytics); setPrimaryVariationId(""); }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try { await loadPage(); } finally { setLoading(false); }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (!selectedJobId || loading) return;
    loadJobData(selectedJobId);
  }, [selectedJobId]);

  const handleConnect = async () => {
    await withBusy("connect", async () => {
      const response = await initiateLinkedInOAuth();
      window.location.href = response.auth_url;
    });
  };

  const handleDisconnect = async () => {
    await withBusy("disconnect", async () => {
      await disconnectLinkedIn();
      setConnection({ status: "disconnected", connected: false });
      toast.success("LinkedIn logged out.");
    });
  };

  const handleConsentChange = async (checked: boolean) => {
    await withBusy("consent", async () => {
      const updated = await updateLinkedInConnection({ posting_consent_given: checked });
      setConnection((current) => ({ ...current, ...updated, connected: updated.status === "connected" }));
      toast.success("Posting permission updated.");
    });
  };

  const handleGenerate = async () => {
    if (!selectedJobId) { toast.error("Choose a job first."); return; }
    await withBusy("generate", async () => {
      const response = await generateLinkedInPosts(selectedJobId);
      const toneVariation = response.variations.find((v) => v.tone === selectedTone) || response.variations[0];
      const prompt = `Write one LinkedIn job post for this role.\nJob title: ${selectedJob?.title || ""}\nLocation: ${selectedJob?.location || ""}\nSkills: ${selectedJob?.skills.join(", ") || ""}\nDescription: ${(selectedJob?.description || "").slice(0, 1200)}\nTone: ${toneLabels[selectedTone]}\n\nRequirements:\n- Generate only one polished LinkedIn post in a ${toneLabels[selectedTone].toLowerCase()} tone.\n- Explain what the job is, why someone should apply, and how to apply.\n- Add a short CTA.\n- Use this apply URL exactly once: ${toneVariation.application_link}\n- Do not add any extra query strings or extra URLs.\n- Put the apply URL naturally near the end of the post.\n- Keep it natural and recruiter-friendly.`.trim();
      const llm = await generateLinkedInText(prompt);
      const updated = await updateLinkedInVariation(selectedJobId, { variation_id: toneVariation.id, content: llm.generated_text });
      setVariations(response.variations);
      setPrimaryVariationId(updated.id);
      setGeneratedVariationId(updated.id);
      setContentDrafts((current) => ({ ...current, [updated.id]: updated.content }));
      toast.success(`AI generated one ${toneLabels[selectedTone].toLowerCase()} LinkedIn post.`);
      await loadJobData(selectedJobId);
    });
  };

  const handleOpenScheduler = async () => {
    if (!selectedJobId) { toast.error("Choose a job first."); return; }
    await withBusy("open-scheduler", async () => {
      if (!campaign?.steps.length) { await generateLinkedInPosts(selectedJobId); await loadJobData(selectedJobId); }
      setShowScheduler((current) => !current);
    });
  };

  const handleSaveVariation = async (variation: LinkedInPostVariation) => {
    await withBusy(`save-${variation.id}`, async () => {
      const updated = await updateLinkedInVariation(variation.job, {
        variation_id: variation.id,
        content: contentDrafts[variation.id] || variation.content,
        hashtags: (hashtagDrafts[variation.id] || "").split(",").map((item) => item.trim()).filter(Boolean),
      });
      setVariations((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("Post updated.");
    });
  };

  const handleImageUpload = async (variation: LinkedInPostVariation, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await withBusy(`image-${variation.id}`, async () => {
      const upload = await uploadLinkedInImage(file);
      const updated = await updateLinkedInVariation(variation.job, { variation_id: variation.id, image_url: upload.image_url });
      setVariations((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("Image uploaded.");
    });
    event.target.value = "";
  };

  const handlePublish = async (variation: LinkedInPostVariation) => {
    const step = campaign?.steps.find((item) => item.variation === variation.id || item.variation_tone === variation.tone);
    await withBusy(`publish-${variation.id}`, async () => {
      const response = await publishLinkedInPost({ variation_id: variation.id, step_id: step?.id, confirmed: true });
      if (response.require_confirmation) { toast.error("Backend still requires confirmation."); return; }
      toast.success("Post published to LinkedIn.");
      setPublishModalUrl(response.linkedin_post_url || "");
      setGenerateModalOpen(false);
      setGeneratedVariationId("");
      await loadPage(selectedJobId);
    });
  };

  const handleReschedule = async (stepId: string) => {
    const scheduledAt = scheduleDrafts[stepId];
    if (!scheduledAt) { toast.error("Choose a date and time."); return; }
    await withBusy(`step-${stepId}`, async () => {
      await updateLinkedInCampaignStep(stepId, { scheduled_at: new Date(scheduledAt).toISOString() });
      toast.success("Schedule updated.");
      if (selectedJobId) await loadJobData(selectedJobId);
    });
  };

  const handleSaveScheduledDraft = async (step: LinkedInCampaign["steps"][number]) => {
    const variation = getStepVariation(step);
    if (!variation) { toast.error("No draft is linked to this scheduled post yet."); return; }
    const scheduledAt = scheduleDrafts[step.id];
    if (!scheduledAt) { toast.error("Choose a date and time."); return; }
    await withBusy(`schedule-save-${step.id}`, async () => {
      await updateLinkedInVariation(variation.job, {
        variation_id: variation.id,
        content: contentDrafts[variation.id] || variation.content,
        hashtags: (hashtagDrafts[variation.id] || variation.hashtags.join(", ")).split(",").map((item) => item.trim()).filter(Boolean),
      });
      await updateLinkedInCampaignStep(step.id, { scheduled_at: new Date(scheduledAt).toISOString() });
      toast.success("Scheduled draft saved.");
      if (selectedJobId) await loadJobData(selectedJobId);
    });
  };

  const handleSkip = async (stepId: string) => {
    await withBusy(`skip-${stepId}`, async () => {
      await updateLinkedInCampaignStep(stepId, { status: "skipped" });
      toast.success("Step skipped.");
      if (selectedJobId) await loadJobData(selectedJobId);
    });
  };

  const handleRefresh = async () => {
    await withBusy("refresh", async () => {
      await syncLinkedInEngagement().catch(() => null);
      await loadPage(selectedJobId);
      toast.success("LinkedIn data refreshed.");
    });
  };

  const handleGenerateRandomPost = async () => {
    if (!randomPostTopic.trim()) { toast.error("Enter a topic or describe what the post should be about."); return; }
    await withBusy("random-post", async () => {
      const prompt = `Write one polished LinkedIn post based on this topic or brief:\n${randomPostTopic.trim()}\n\nTone: ${toneLabels[randomPostTone]}\n\nRequirements:\n- Create a single complete LinkedIn post.\n- Make it natural, engaging, and easy to read.\n- Use short paragraphs.\n- Include a strong opening hook.\n- End with a clear call to action when it fits naturally.\n- Do not include placeholders.\n- Do not include any explanation outside the post itself.`.trim();
      const response = await generateLinkedInText(prompt);
      setRandomPostDraft(response.generated_text);
      toast.success("Random LinkedIn post generated.");
    });
  };

  if (loading) return <LoadingState label="Loading LinkedIn page..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="LinkedIn"
        title="Simple LinkedIn posting"
        description="Connect your LinkedIn account, generate job posts, schedule them, and disconnect anytime."
        actions={(
          <>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={busyKey === "refresh"}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              {busyKey === "refresh" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={!connection?.connected || busyKey === "disconnect"}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              {busyKey === "disconnect" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Logout LinkedIn
            </button>
          </>
        )}
      />

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Posts" value={globalAnalytics.total_posts} helper="published on linkedin" icon={<Send className="h-5 w-5" />} />
        <MetricCard title="Clicks" value={globalAnalytics.total_clicks} helper="tracked post visits" icon={<ExternalLink className="h-5 w-5" />} />
        <MetricCard title="Applications" value={globalAnalytics.total_applications} helper="came from linkedin" icon={<Sparkles className="h-5 w-5" />} />
      </div>

      {/* Step 1 — Connect */}
      <Panel title="1. Connect or logout">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{connection?.linkedin_name || "Not connected"}</p>
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600 capitalize">
                  {connection?.status || "disconnected"}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {connection?.linkedin_email || "Use LinkedIn OAuth to connect your employer account."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleConnect}
              disabled={busyKey === "connect"}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50 transition-colors shadow-sm"
            >
              {busyKey === "connect" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {connection?.connected ? "Reconnect" : "Connect LinkedIn"}
            </button>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 text-sm hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-900">Allow posting</p>
              <p className="text-gray-500 text-xs mt-0.5">Turn this on before publishing to LinkedIn.</p>
            </div>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 accent-blue-600"
              checked={!!connection?.posting_consent_given}
              onChange={(event) => handleConsentChange(event.target.checked)}
            />
          </label>
        </div>
      </Panel>

      {/* Step 2 — Pick job */}
      <Panel title="2. Pick a job and generate one AI post">
        <div className="space-y-4">
          <select
            aria-label="Select a job"
            value={selectedJobId}
            onChange={(event) => setSelectedJobId(event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          >
            <option value="">Choose a job</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title} | {job.location}</option>
            ))}
          </select>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setGenerateModalOpen(true)}
              disabled={!selectedJobId}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-40 transition-colors shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Generate one post
            </button>
            <button
              type="button"
              onClick={handleOpenScheduler}
              disabled={!selectedJobId || busyKey === "open-scheduler"}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 disabled:opacity-40 transition-colors shadow-sm"
            >
              {busyKey === "open-scheduler" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
              {showScheduler ? "Hide scheduling" : "Open scheduling"}
            </button>
            {selectedJob ? (
              <div className="inline-flex items-center rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-sm text-gray-500">
                {selectedJob.title} · {jobAnalytics.total_link_clicks} clicks · {jobAnalytics.total_applications_from_linkedin} applications
              </div>
            ) : null}
          </div>

          {!jobs.length ? (
            <EmptyState
              icon={<Sparkles className="h-6 w-6" />}
              title="No jobs found"
              description="Create a job first, then LinkedIn posts can be generated for it."
            />
          ) : null}
        </div>
      </Panel>

      {/* Step 3 — Review & publish */}
      {primaryVariation ? (
        <Panel title="3. Review and publish">
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {toneLabels[primaryVariation.tone] || primaryVariation.tone}
                </span>
                <span className="text-sm text-gray-500">One AI-generated draft</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveVariation(primaryVariation)}
                  disabled={busyKey === `save-${primaryVariation.id}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 disabled:opacity-50 transition-colors"
                >
                  {busyKey === `save-${primaryVariation.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => handlePublish(primaryVariation)}
                  disabled={!connection?.posting_consent_given || busyKey === `publish-${primaryVariation.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {busyKey === `publish-${primaryVariation.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Publish
                </button>
              </div>
            </div>

            <Textarea
              className="min-h-72 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              value={contentDrafts[primaryVariation.id] ?? primaryVariation.content}
              onChange={(event) => setContentDrafts((current) => ({ ...current, [primaryVariation.id]: event.target.value }))}
            />

            <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
              <Input
                className="bg-white border-gray-200 text-gray-900"
                value={hashtagDrafts[primaryVariation.id] ?? primaryVariation.hashtags.join(", ")}
                onChange={(event) => setHashtagDrafts((current) => ({ ...current, [primaryVariation.id]: event.target.value }))}
                placeholder="#hiring, #jobs"
              />
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors">
                {busyKey === `image-${primaryVariation.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                Upload image
                <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(primaryVariation, event)} />
              </label>
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-sm text-gray-500">
              <p>Apply link used in the post — tracks clicks in the backend.</p>
              <a href={primaryVariation.application_link} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline break-all mt-1 block">
                {primaryVariation.application_link}
              </a>
              {primaryVariation.image_url ? (
                <div className="mt-2">
                  <a href={primaryVariation.image_url} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">
                    Open uploaded image
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </Panel>
      ) : null}

      {/* Step 4 — Scheduling */}
      {showScheduler ? (
        <Panel title="4. Scheduling section" subtitle="Create and manage up to 4 scheduled posts in a series.">
          <div className="space-y-4">
            {campaign?.steps.length ? campaign.steps.map((step) => (
              <div key={step.id} className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    Day +{step.day_offset}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{toneLabels[step.variation_tone || ""] || step.variation_tone || "Post step"}</span>
                  <span className="text-xs text-gray-400 capitalize">{step.status}</span>
                </div>
                <Textarea
                  className="min-h-40 bg-white border-gray-200 text-gray-900"
                  value={(() => {
                    const variation = getStepVariation(step);
                    if (!variation) return step.variation_content || "";
                    return contentDrafts[variation.id] ?? variation.content;
                  })()}
                  onChange={(event) => {
                    const variation = getStepVariation(step);
                    if (!variation) return;
                    setContentDrafts((current) => ({ ...current, [variation.id]: event.target.value }));
                  }}
                  placeholder="Write and save the draft for this scheduled post."
                />
                <Input
                  className="bg-white border-gray-200 text-gray-900"
                  value={(() => {
                    const variation = getStepVariation(step);
                    if (!variation) return "";
                    return hashtagDrafts[variation.id] ?? variation.hashtags.join(", ");
                  })()}
                  onChange={(event) => {
                    const variation = getStepVariation(step);
                    if (!variation) return;
                    setHashtagDrafts((current) => ({ ...current, [variation.id]: event.target.value }));
                  }}
                  placeholder="#hiring, #jobs"
                />
                <Input
                  type="datetime-local"
                  className="bg-white border-gray-200 text-gray-900"
                  value={scheduleDrafts[step.id] || ""}
                  onChange={(event) => setScheduleDrafts((current) => ({ ...current, [step.id]: event.target.value }))}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveScheduledDraft(step)}
                    disabled={busyKey === `schedule-save-${step.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-3 py-2 disabled:opacity-50 transition-colors"
                  >
                    {busyKey === `schedule-save-${step.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save draft + time
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReschedule(step.id)}
                    disabled={busyKey === `step-${step.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-3 py-2 disabled:opacity-50 transition-colors"
                  >
                    Save time only
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSkip(step.id)}
                    disabled={busyKey === `skip-${step.id}`}
                    className="inline-flex items-center rounded-xl px-3 py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )) : (
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-500">
                Click "Open scheduling" after choosing a job to prepare the multi-post series.
              </div>
            )}
          </div>
        </Panel>
      ) : null}

      {/* Step 5 — Random post */}
      <Panel title="5. Random post generator" subtitle="Generate a standalone LinkedIn post not tied to a specific job.">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <Textarea
              className="min-h-36 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              placeholder="Enter a topic, describe an announcement, campaign idea, product update, hiring message, or anything you want to turn into a LinkedIn post."
              value={randomPostTopic}
              onChange={(event) => setRandomPostTopic(event.target.value)}
            />
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Tone</label>
                <Select value={randomPostTone} onValueChange={(value) => setRandomPostTone(value as "formal" | "casual" | "urgent" | "referral")}>
                  <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                    <SelectValue placeholder="Choose tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button
                type="button"
                onClick={handleGenerateRandomPost}
                disabled={busyKey === "random-post"}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-50 transition-colors shadow-sm"
              >
                {busyKey === "random-post" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate post
              </button>
            </div>
          </div>

          {randomPostDraft ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">{toneLabels[randomPostTone]}</span>
                <span className="text-sm text-gray-500">Generated from your topic</span>
              </div>
              <div className="max-h-[60vh] min-h-[320px] overflow-y-auto rounded-xl border border-gray-200 bg-white px-5 py-4 text-base leading-7 whitespace-pre-wrap text-gray-900">
                {randomPostDraft}
              </div>
              <Textarea
                className="min-h-48 bg-white border-gray-200 text-gray-900"
                value={randomPostDraft}
                onChange={(event) => setRandomPostDraft(event.target.value)}
              />
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-500">
              Enter any topic and generate a standalone LinkedIn post that is not tied to a specific job.
            </div>
          )}
        </div>
      </Panel>

      {/* Published links */}
      <Panel title="Published links">
        {publishedPosts.length ? (
          <div className="space-y-3">
            {publishedPosts.slice(0, 6).map((post) => (
              <div key={post.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600 capitalize">{post.tone}</span>
                      <span className="text-sm text-gray-400">{new Date(post.published_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-gray-500">
                      {post.link_clicks} clicks · {post.applications_received} applications
                    </p>
                  </div>
                  {post.linkedin_post_url ? (
                    <a href={post.linkedin_post_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-teal-600 hover:underline">
                      Open LinkedIn URL
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-500">
            Published LinkedIn URLs will appear here.
          </div>
        )}
      </Panel>

      {/* Publish success dialog */}
      <Dialog open={!!publishModalUrl} onOpenChange={(open) => { if (!open) setPublishModalUrl(""); }}>
        <DialogContent className="rounded-2xl border-gray-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">LinkedIn post published</DialogTitle>
            <DialogDescription className="text-gray-500">The LinkedIn post URL is ready. Open it in a new tab anytime.</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm">
            <a href={publishModalUrl} target="_blank" rel="noreferrer" className="break-all text-teal-600 hover:underline">
              {publishModalUrl}
            </a>
          </div>
          <div className="flex justify-end">
            <a
              href={publishModalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors shadow-sm"
            >
              Open LinkedIn post
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate modal */}
      {generateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 md:p-6">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Generate LinkedIn post</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose the tone first. AI will generate one long-form post and inject the tracked apply URL automatically.
                </p>
              </div>
              <button
                type="button"
                className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 px-4 py-2 text-sm font-semibold transition-colors"
                onClick={() => { setGenerateModalOpen(false); setGeneratedVariationId(""); }}
              >
                Close
              </button>
            </div>

            {!generatedVariationId ? (
              <div className="space-y-4 overflow-y-auto pr-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Post tone</label>
                  <Select value={selectedTone} onValueChange={(value) => setSelectedTone(value as "formal" | "casual" | "urgent" | "referral")}>
                    <SelectTrigger className="bg-white border-gray-200 text-gray-900">
                      <SelectValue placeholder="Choose tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-500">
                  The generated post will describe the job, explain how to apply, and include the tracked apply link once.
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!selectedJobId || busyKey === "generate"}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {busyKey === "generate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generate
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">{toneLabels[selectedTone]}</span>
                  <span className="text-sm text-gray-500">Generated by AI</span>
                </div>
                <div className="max-h-[62vh] min-h-[480px] overflow-y-auto rounded-xl border border-gray-200 bg-white px-5 py-4 text-base leading-7 whitespace-pre-wrap text-gray-900">
                  {contentDrafts[generatedVariationId] || ""}
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-500">
                  The apply URL inside this post is tracked in the backend and opens the job page normally.
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setGeneratedVariationId("")}
                    className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => { const v = variations.find((item) => item.id === generatedVariationId); if (v) handleSaveVariation(v); }}
                    disabled={busyKey === `save-${generatedVariationId}`}
                    className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2 disabled:opacity-50 transition-colors"
                  >
                    Save draft
                  </button>
                  <button
                    type="button"
                    onClick={() => { const v = variations.find((item) => item.id === generatedVariationId); if (v) handlePublish(v); }}
                    disabled={busyKey === `publish-${generatedVariationId}` || !connection?.posting_consent_given}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {busyKey === `publish-${generatedVariationId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Post now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
