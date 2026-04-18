import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { CalendarClock, ExternalLink, ImagePlus, Loader2, LogOut, RefreshCw, Send, Sparkles } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { EmptyState } from "@/components/employer/EmptyState";
import { LoadingState } from "@/components/employer/LoadingState";
import { MetricCard } from "@/components/employer/MetricCard";
import { PageHeader } from "@/components/employer/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  if (!value) {
    return "";
  }
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const maybeResponse = (error as { response?: { data?: { error?: string; detail?: string } } }).response;
    const apiMessage = maybeResponse?.data?.error || maybeResponse?.data?.detail;
    if (apiMessage) {
      return apiMessage;
    }

    const message = (error as { message?: string }).message;
    if (message) {
      return message;
    }
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
    () => variations.find((variation) => variation.id === primaryVariationId) || variations[0] || null,
    [primaryVariationId, variations],
  );

  const getStepVariation = (step: LinkedInCampaign["steps"][number]) =>
    variations.find((variation) => variation.id === step.variation || variation.tone === step.variation_tone) || null;

  useEffect(() => {
    const status = searchParams.get("status");
    const error = searchParams.get("error");
    if (!status && !error) {
      return;
    }

    if (status === "success") {
      toast.success("LinkedIn connected successfully.");
    }

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
    try {
      await task();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyKey("");
    }
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
    setContentDrafts(
      variationData.reduce<Record<string, string>>((acc, variation) => {
        acc[variation.id] = variation.content;
        return acc;
      }, {}),
    );
    setHashtagDrafts(
      variationData.reduce<Record<string, string>>((acc, variation) => {
        acc[variation.id] = variation.hashtags.join(", ");
        return acc;
      }, {}),
    );
    setScheduleDrafts(
      (campaignData?.steps || []).reduce<Record<string, string>>((acc, step) => {
        acc[step.id] = toDatetimeLocal(step.scheduled_at);
        return acc;
      }, {}),
    );
  };

  const loadPage = async (jobId?: string) => {
    const [jobData, connectionData, analyticsData, postsData] = await Promise.all([
      getEmployerJobs(),
      getLinkedInConnection().catch(() => ({ status: "disconnected", connected: false })),
      getLinkedInGlobalAnalytics().catch(() => emptyGlobalAnalytics),
      getLinkedInPublishedPosts().catch(() => []),
    ]);

    setJobs(jobData);
    setConnection(connectionData);
    setGlobalAnalytics(analyticsData);
    setPublishedPosts(postsData);

    const nextJobId = jobId || selectedJobId || jobData[0]?.id || "";
    if (nextJobId) {
      setSelectedJobId(nextJobId);
      await loadJobData(nextJobId);
    } else {
      setSelectedJobId("");
      setVariations([]);
      setCampaign(null);
      setJobAnalytics(emptyJobAnalytics);
      setPrimaryVariationId("");
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await loadPage();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    if (!selectedJobId || loading) {
      return;
    }
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
    if (!selectedJobId) {
      toast.error("Choose a job first.");
      return;
    }
    await withBusy("generate", async () => {
      const response = await generateLinkedInPosts(selectedJobId);
      const toneVariation = response.variations.find((variation) => variation.tone === selectedTone) || response.variations[0];
      const prompt = `
Write one LinkedIn job post for this role.
Job title: ${selectedJob?.title || ""}
Location: ${selectedJob?.location || ""}
Skills: ${selectedJob?.skills.join(", ") || ""}
Description: ${(selectedJob?.description || "").slice(0, 1200)}
Tone: ${toneLabels[selectedTone]}

Requirements:
- Generate only one polished LinkedIn post in a ${toneLabels[selectedTone].toLowerCase()} tone.
- Explain what the job is, why someone should apply, and how to apply.
- Add a short CTA.
- Use this apply URL exactly once: ${toneVariation.application_link}
- Do not add any extra query strings or extra URLs.
- Put the apply URL naturally near the end of the post.
- Keep it natural and recruiter-friendly.
      `.trim();

      const llm = await generateLinkedInText(prompt);
      const updated = await updateLinkedInVariation(selectedJobId, {
        variation_id: toneVariation.id,
        content: llm.generated_text,
      });

      setVariations(response.variations);
      setPrimaryVariationId(updated.id);
      setGeneratedVariationId(updated.id);
      setContentDrafts((current) => ({ ...current, [updated.id]: updated.content }));
      toast.success(`AI generated one ${toneLabels[selectedTone].toLowerCase()} LinkedIn post.`);
      await loadJobData(selectedJobId);
    });
  };

  const handleOpenScheduler = async () => {
    if (!selectedJobId) {
      toast.error("Choose a job first.");
      return;
    }
    await withBusy("open-scheduler", async () => {
      if (!campaign?.steps.length) {
        await generateLinkedInPosts(selectedJobId);
        await loadJobData(selectedJobId);
      }
      setShowScheduler((current) => !current);
    });
  };

  const handleSaveVariation = async (variation: LinkedInPostVariation) => {
    await withBusy(`save-${variation.id}`, async () => {
      const updated = await updateLinkedInVariation(variation.job, {
        variation_id: variation.id,
        content: contentDrafts[variation.id] || variation.content,
        hashtags: (hashtagDrafts[variation.id] || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setVariations((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("Post updated.");
    });
  };

  const handleImageUpload = async (variation: LinkedInPostVariation, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await withBusy(`image-${variation.id}`, async () => {
      const upload = await uploadLinkedInImage(file);
      const updated = await updateLinkedInVariation(variation.job, {
        variation_id: variation.id,
        image_url: upload.image_url,
      });
      setVariations((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      toast.success("Image uploaded.");
    });
    event.target.value = "";
  };

  const handlePublish = async (variation: LinkedInPostVariation) => {
    const step = campaign?.steps.find((item) => item.variation === variation.id || item.variation_tone === variation.tone);
    await withBusy(`publish-${variation.id}`, async () => {
      const response = await publishLinkedInPost({
        variation_id: variation.id,
        step_id: step?.id,
        confirmed: true,
      });
      if (response.require_confirmation) {
        toast.error("Backend still requires confirmation.");
        return;
      }
      toast.success("Post published to LinkedIn.");
      setPublishModalUrl(response.linkedin_post_url || "");
      setGenerateModalOpen(false);
      setGeneratedVariationId("");
      await loadPage(selectedJobId);
    });
  };

  const handleReschedule = async (stepId: string) => {
    const scheduledAt = scheduleDrafts[stepId];
    if (!scheduledAt) {
      toast.error("Choose a date and time.");
      return;
    }
    await withBusy(`step-${stepId}`, async () => {
      await updateLinkedInCampaignStep(stepId, {
        scheduled_at: new Date(scheduledAt).toISOString(),
      });
      toast.success("Schedule updated.");
      if (selectedJobId) {
        await loadJobData(selectedJobId);
      }
    });
  };

  const handleSaveScheduledDraft = async (step: LinkedInCampaign["steps"][number]) => {
    const variation = getStepVariation(step);
    if (!variation) {
      toast.error("No draft is linked to this scheduled post yet.");
      return;
    }

    const scheduledAt = scheduleDrafts[step.id];
    if (!scheduledAt) {
      toast.error("Choose a date and time.");
      return;
    }

    await withBusy(`schedule-save-${step.id}`, async () => {
      await updateLinkedInVariation(variation.job, {
        variation_id: variation.id,
        content: contentDrafts[variation.id] || variation.content,
        hashtags: (hashtagDrafts[variation.id] || variation.hashtags.join(", "))
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      await updateLinkedInCampaignStep(step.id, {
        scheduled_at: new Date(scheduledAt).toISOString(),
      });

      toast.success("Scheduled draft saved.");
      if (selectedJobId) {
        await loadJobData(selectedJobId);
      }
    });
  };

  const handleSkip = async (stepId: string) => {
    await withBusy(`skip-${stepId}`, async () => {
      await updateLinkedInCampaignStep(stepId, { status: "skipped" });
      toast.success("Step skipped.");
      if (selectedJobId) {
        await loadJobData(selectedJobId);
      }
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
    if (!randomPostTopic.trim()) {
      toast.error("Enter a topic or describe what the post should be about.");
      return;
    }

    await withBusy("random-post", async () => {
      const prompt = `
Write one polished LinkedIn post based on this topic or brief:
${randomPostTopic.trim()}

Tone: ${toneLabels[randomPostTone]}

Requirements:
- Create a single complete LinkedIn post.
- Make it natural, engaging, and easy to read.
- Use short paragraphs.
- Include a strong opening hook.
- End with a clear call to action when it fits naturally.
- Do not include placeholders.
- Do not include any explanation outside the post itself.
      `.trim();

      const response = await generateLinkedInText(prompt);
      setRandomPostDraft(response.generated_text);
      toast.success("Random LinkedIn post generated.");
    });
  };

  if (loading) {
    return <LoadingState label="Loading LinkedIn page..." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="LinkedIn"
        title="Simple LinkedIn posting"
        description="Connect your LinkedIn account, generate job posts, schedule them, and disconnect anytime."
        actions={(
          <>
            <Button variant="outline" className="rounded-2xl" onClick={handleRefresh} disabled={busyKey === "refresh"}>
              {busyKey === "refresh" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
            <Button variant="outline" className="rounded-2xl text-destructive" onClick={handleDisconnect} disabled={!connection?.connected || busyKey === "disconnect"}>
              {busyKey === "disconnect" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Logout LinkedIn
            </Button>
          </>
        )}
      />

      <div className="grid gap-5 md:grid-cols-3">
        <MetricCard title="Posts" value={globalAnalytics.total_posts} helper="published on linkedin" icon={<Send className="h-5 w-5" />} />
        <MetricCard title="Clicks" value={globalAnalytics.total_clicks} helper="tracked post visits" icon={<ExternalLink className="h-5 w-5" />} />
        <MetricCard title="Applications" value={globalAnalytics.total_applications} helper="came from linkedin" icon={<Sparkles className="h-5 w-5" />} />
      </div>

      <Card className="rounded-3xl border-border/70">
        <CardHeader>
          <CardTitle>1. Connect or logout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-secondary/50 p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{connection?.linkedin_name || "Not connected"}</p>
                <Badge variant="outline" className="capitalize">{connection?.status || "disconnected"}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {connection?.linkedin_email || "Use LinkedIn OAuth to connect your employer account."}
              </p>
            </div>
            <Button className="rounded-2xl" onClick={handleConnect} disabled={busyKey === "connect"}>
              {busyKey === "connect" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {connection?.connected ? "Reconnect" : "Connect LinkedIn"}
            </Button>
          </div>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 p-4 text-sm">
            <div>
              <p className="font-medium">Allow posting</p>
              <p className="text-muted-foreground">Turn this on before publishing to LinkedIn.</p>
            </div>
            <input
              type="checkbox"
              checked={!!connection?.posting_consent_given}
              onChange={(event) => handleConsentChange(event.target.checked)}
            />
          </label>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-border/70">
        <CardHeader>
          <CardTitle>2. Pick a job and generate one AI post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <select
            value={selectedJobId}
            onChange={(event) => setSelectedJobId(event.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">Choose a job</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} | {job.location}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-3">
            <Button className="rounded-2xl" onClick={() => setGenerateModalOpen(true)} disabled={!selectedJobId}>
              <Sparkles className="h-4 w-4" />
              Generate one post
            </Button>
            <Button variant="outline" className="rounded-2xl" onClick={handleOpenScheduler} disabled={!selectedJobId || busyKey === "open-scheduler"}>
              {busyKey === "open-scheduler" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
              {showScheduler ? "Hide scheduling" : "Open scheduling"}
            </Button>
            {selectedJob ? (
              <div className="rounded-2xl bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
                {selectedJob.title} | {jobAnalytics.total_link_clicks} clicks | {jobAnalytics.total_applications_from_linkedin} applications
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
        </CardContent>
      </Card>

      {primaryVariation ? (
        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle>3. Review and publish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-border/70 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{toneLabels[primaryVariation.tone] || primaryVariation.tone}</Badge>
                  <span className="text-sm text-muted-foreground">One AI-generated draft</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-2xl" onClick={() => handleSaveVariation(primaryVariation)} disabled={busyKey === `save-${primaryVariation.id}`}>
                    {busyKey === `save-${primaryVariation.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save
                  </Button>
                  <Button className="rounded-2xl" onClick={() => handlePublish(primaryVariation)} disabled={!connection?.posting_consent_given || busyKey === `publish-${primaryVariation.id}`}>
                    {busyKey === `publish-${primaryVariation.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Publish
                  </Button>
                </div>
              </div>

              <Textarea
                className="min-h-72"
                value={contentDrafts[primaryVariation.id] ?? primaryVariation.content}
                onChange={(event) => setContentDrafts((current) => ({ ...current, [primaryVariation.id]: event.target.value }))}
              />

              <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
                <Input
                  value={hashtagDrafts[primaryVariation.id] ?? primaryVariation.hashtags.join(", ")}
                  onChange={(event) => setHashtagDrafts((current) => ({ ...current, [primaryVariation.id]: event.target.value }))}
                  placeholder="#hiring, #jobs"
                />
                <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-input px-4 py-2 text-sm font-medium">
                  {busyKey === `image-${primaryVariation.id}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                  Upload image
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(primaryVariation, event)} />
                </label>
              </div>

              <div className="mt-3 text-sm text-muted-foreground">
                <p>Apply link used in the post. It opens the normal job page and tracks the click in the backend.</p>
                <a href={primaryVariation.application_link} target="_blank" rel="noreferrer" className="text-accent hover:underline break-all">
                  {primaryVariation.application_link}
                </a>
                {primaryVariation.image_url ? (
                  <div className="mt-2">
                    <a href={primaryVariation.image_url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                      Open uploaded image
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {showScheduler ? (
        <Card className="rounded-3xl border-border/70">
          <CardHeader>
            <CardTitle>4. Scheduling section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This section is only for multi-post scheduling. It can create and manage up to 4 scheduled posts in a series.
            </p>
            {campaign?.steps.length ? campaign.steps.map((step) => (
              <div key={step.id} className="space-y-4 rounded-2xl border border-border/70 p-4">
                <div>
                  <Badge variant="outline">Day +{step.day_offset}</Badge>
                </div>
                <div>
                  <p className="font-medium">{toneLabels[step.variation_tone || ""] || step.variation_tone || "Post step"}</p>
                  <p className="text-sm text-muted-foreground capitalize">{step.status}</p>
                </div>
                <Textarea
                  className="min-h-40"
                  value={(() => {
                    const variation = getStepVariation(step);
                    if (!variation) {
                      return step.variation_content || "";
                    }
                    return contentDrafts[variation.id] ?? variation.content;
                  })()}
                  onChange={(event) => {
                    const variation = getStepVariation(step);
                    if (!variation) {
                      return;
                    }
                    setContentDrafts((current) => ({ ...current, [variation.id]: event.target.value }));
                  }}
                  placeholder="Write and save the draft for this scheduled post."
                />
                <Input
                  value={(() => {
                    const variation = getStepVariation(step);
                    if (!variation) {
                      return "";
                    }
                    return hashtagDrafts[variation.id] ?? variation.hashtags.join(", ");
                  })()}
                  onChange={(event) => {
                    const variation = getStepVariation(step);
                    if (!variation) {
                      return;
                    }
                    setHashtagDrafts((current) => ({ ...current, [variation.id]: event.target.value }));
                  }}
                  placeholder="#hiring, #jobs"
                />
                <Input
                  type="datetime-local"
                  value={scheduleDrafts[step.id] || ""}
                  onChange={(event) => setScheduleDrafts((current) => ({ ...current, [step.id]: event.target.value }))}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => handleSaveScheduledDraft(step)}
                    disabled={busyKey === `schedule-save-${step.id}`}
                  >
                    {busyKey === `schedule-save-${step.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save draft + time
                  </Button>
                  <Button variant="outline" className="rounded-2xl" onClick={() => handleReschedule(step.id)} disabled={busyKey === `step-${step.id}`}>
                    Save time only
                  </Button>
                  <Button variant="ghost" className="rounded-2xl" onClick={() => handleSkip(step.id)} disabled={busyKey === `skip-${step.id}`}>
                    Skip
                  </Button>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
                Click "Open scheduling" after choosing a job to prepare the multi-post series.
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-3xl border-border/70">
        <CardHeader>
          <CardTitle>5. Random post generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <Textarea
              className="min-h-36"
              placeholder="Enter a topic, describe an announcement, campaign idea, product update, hiring message, or anything you want to turn into a LinkedIn post."
              value={randomPostTopic}
              onChange={(event) => setRandomPostTopic(event.target.value)}
            />
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <Select value={randomPostTone} onValueChange={(value) => setRandomPostTone(value as "formal" | "casual" | "urgent" | "referral")}>
                  <SelectTrigger>
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
              <Button className="w-full rounded-2xl" onClick={handleGenerateRandomPost} disabled={busyKey === "random-post"}>
                {busyKey === "random-post" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate post
              </Button>
            </div>
          </div>

          {randomPostDraft ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{toneLabels[randomPostTone]}</Badge>
                <span className="text-sm text-muted-foreground">Generated from your topic</span>
              </div>
              <div className="max-h-[60vh] min-h-[320px] overflow-y-auto rounded-2xl border border-input bg-background px-5 py-4 text-base leading-7 whitespace-pre-wrap">
                {randomPostDraft}
              </div>
              <Textarea
                className="min-h-48"
                value={randomPostDraft}
                onChange={(event) => setRandomPostDraft(event.target.value)}
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
              Enter any topic and generate a standalone LinkedIn post that is not tied to a specific job.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-border/70">
        <CardHeader>
          <CardTitle>Published links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {publishedPosts.length ? (
            publishedPosts.slice(0, 6).map((post) => (
              <div key={post.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{post.tone}</Badge>
                      <span className="text-sm text-muted-foreground">{new Date(post.published_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {post.link_clicks} clicks | {post.applications_received} applications
                    </p>
                  </div>
                  {post.linkedin_post_url ? (
                    <a href={post.linkedin_post_url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                      Open LinkedIn URL
                    </a>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
              Published LinkedIn URLs will appear here.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!publishModalUrl} onOpenChange={(open) => { if (!open) setPublishModalUrl(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>LinkedIn post published</DialogTitle>
            <DialogDescription>The LinkedIn post URL is ready. Open it in a new tab anytime.</DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl bg-secondary/50 p-4 text-sm">
            <a href={publishModalUrl} target="_blank" rel="noreferrer" className="break-all text-accent hover:underline">
              {publishModalUrl}
            </a>
          </div>
          <div className="flex justify-end">
            <Button asChild className="rounded-2xl">
              <a href={publishModalUrl} target="_blank" rel="noreferrer">
                Open LinkedIn post
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {generateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 md:p-6">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Generate LinkedIn post</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose the tone first. Groq will generate one long-form post and inject the tracked apply URL automatically.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => {
                  setGenerateModalOpen(false);
                  setGeneratedVariationId("");
                }}
              >
                Close
              </Button>
            </div>

            {!generatedVariationId ? (
              <div className="space-y-4 overflow-y-auto pr-1">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Post tone</label>
                  <Select value={selectedTone} onValueChange={(value) => setSelectedTone(value as "formal" | "casual" | "urgent" | "referral")}>
                    <SelectTrigger>
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
                <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
                  The generated post will describe the job, explain how to apply, and include the tracked apply link once. The user will not see query params.
                </div>
                <div className="flex justify-end gap-2">
                  <Button className="rounded-2xl" onClick={handleGenerate} disabled={!selectedJobId || busyKey === "generate"}>
                    {busyKey === "generate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-hidden">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{toneLabels[selectedTone]}</Badge>
                  <span className="text-sm text-muted-foreground">Generated by Groq</span>
                </div>
                <div className="max-h-[62vh] min-h-[480px] overflow-y-auto rounded-2xl border border-input bg-background px-5 py-4 text-base leading-7 whitespace-pre-wrap">
                  {contentDrafts[generatedVariationId] || ""}
                </div>
                <div className="rounded-2xl bg-secondary/50 p-4 text-sm text-muted-foreground">
                  The apply URL inside this post is tracked in the backend and opens the job page normally.
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" className="rounded-2xl" onClick={() => setGeneratedVariationId("")}>
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => {
                      const variation = variations.find((item) => item.id === generatedVariationId);
                      if (variation) handleSaveVariation(variation);
                    }}
                    disabled={busyKey === `save-${generatedVariationId}`}
                  >
                    Save draft
                  </Button>
                  <Button
                    className="rounded-2xl"
                    onClick={() => {
                      const variation = variations.find((item) => item.id === generatedVariationId);
                      if (variation) handlePublish(variation);
                    }}
                    disabled={busyKey === `publish-${generatedVariationId}` || !connection?.posting_consent_given}
                  >
                    {busyKey === `publish-${generatedVariationId}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Post now
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
