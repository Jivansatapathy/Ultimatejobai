import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Pencil, Plus, Search, Trash2, UploadCloud, XCircle } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/employer/EmptyState";
import { JobFormDialog } from "@/components/employer/JobFormDialog";
import { LoadingState } from "@/components/employer/LoadingState";
import { PageHeader } from "@/components/employer/PageHeader";
import { Panel } from "@/components/employer/Panel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import {
  bulkEmployerJobAction,
  createEmployerJob,
  deleteEmployerJob,
  executeExternalPosting,
  getExternalPostingRequests,
  getEmployerJobs,
  prepareExternalPosting,
  updateEmployerJob,
} from "@/services/employerService";
import { ExternalPostingRequest, JobPosting } from "@/types/employer";

const PAGE_SIZE = 6;

const statusColors: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  draft:     "bg-amber-50 text-amber-700 border border-amber-200",
  closed:    "bg-gray-100 text-gray-500 border border-gray-200",
};

export default function EmployerJobs() {
  const { profile, user, isEmployer } = useEmployerAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [postingRequests, setPostingRequests] = useState<ExternalPostingRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (!user || !isEmployer) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [items, requests] = await Promise.all([
          getEmployerJobs(deferredSearch),
          getExternalPostingRequests().catch(() => [] as ExternalPostingRequest[]),
        ]);
        setJobs(items);
        setPostingRequests(requests);
      } catch (err: any) {
        console.error("Jobs load failed:", err);
        setError(err?.response?.data?.detail || err?.message || "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [deferredSearch, isEmployer, user]);

  const filteredJobs = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return jobs;
    return jobs.filter((job) =>
      [job.title, job.location, job.employer_status, job.skills.join(" ")]
        .join(" ").toLowerCase().includes(query),
    );
  }, [deferredSearch, jobs]);

  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const pagedJobs = filteredJobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const allVisibleSelected = pagedJobs.length > 0 && pagedJobs.every((job) => selectedJobIds.includes(job.id));

  useEffect(() => { setCurrentPage(1); }, [deferredSearch]);
  useEffect(() => {
    setSelectedJobIds((current) => current.filter((jobId) => jobs.some((job) => job.id === jobId)));
  }, [jobs]);

  const refreshJobs = async () => {
    const [items, requests] = await Promise.all([
      getEmployerJobs(deferredSearch),
      getExternalPostingRequests(),
    ]);
    setJobs(items);
    setPostingRequests(requests);
  };

  const canManageJobs = !!profile?.permissions?.can_manage_jobs;
  const canManageIntegrations = !!profile?.permissions?.can_manage_integrations;

  const handleSaveJob = async (values: {
    title: string; description: string; salary: string; location: string;
    city?: string; region?: string; country?: string; department?: string;
    employment_type?: string; workplace_type?: string;
    is_remote: "yes" | "no"; quick_apply_enabled: "yes" | "no";
    quick_apply_questions?: string; skills: string; deadline: string;
    status: "draft" | "published" | "closed";
  }) => {
    if (!profile) return;
    setSaving(true);
    const payload = {
      title: values.title.trim(), description: values.description.trim(),
      salary: values.salary.trim(), location: values.location.trim(),
      city: values.city?.trim() || "", region: values.region?.trim() || "",
      country: values.country?.trim() || "", department: values.department?.trim() || "",
      employment_type: values.employment_type?.trim() || "", workplace_type: values.workplace_type?.trim() || "",
      is_remote: values.is_remote === "yes", quick_apply_enabled: values.quick_apply_enabled === "yes",
      quick_apply_questions: values.quick_apply_enabled === "no"
        ? values.quick_apply_questions?.split("\n").map((item) => item.trim()).filter(Boolean) || [] : [],
      skills: values.skills.split(",").map((s) => s.trim()).filter(Boolean),
      deadline: values.deadline, employer_status: values.status,
    };
    try {
      if (editingJob) { await updateEmployerJob(editingJob.id, payload); toast.success("Job updated successfully."); }
      else { await createEmployerJob(payload); toast.success("Job created successfully."); }
      await refreshJobs();
      setDialogOpen(false);
      setEditingJob(null);
    } catch (error) {
      console.error(error);
      toast.error("Unable to save the job right now.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (job: JobPosting) => {
    try {
      await deleteEmployerJob(job.id);
      await refreshJobs();
      setSelectedJobIds((current) => current.filter((jobId) => jobId !== job.id));
      toast.success("Job deleted.");
    } catch (error) { console.error(error); toast.error("Unable to delete that job."); }
  };

  const handleBulkAction = async (action: "publish" | "close") => {
    if (!selectedJobIds.length) { toast.error("Select at least one job first."); return; }
    try {
      setSaving(true);
      const result = await bulkEmployerJobAction(action, selectedJobIds);
      await refreshJobs();
      setSelectedJobIds([]);
      toast.success(`${result.updated} jobs updated.`);
    } catch (error) { console.error(error); toast.error("Unable to run that bulk action right now."); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingState label="Loading your jobs..." />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 max-w-md">
          <p className="text-sm font-bold text-red-600 mb-2">Failed to load jobs</p>
          <p className="text-sm text-red-500">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-red-600 text-white text-sm font-bold px-4 py-2 hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Jobs"
        title="Job Management"
        description="Create, edit, publish, remove, or bulk-update job postings."
        actions={(
          <button
            type="button"
            onClick={() => { setEditingJob(null); setDialogOpen(true); }}
            disabled={!canManageJobs}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Create job
          </button>
        )}
      />

      {/* Search & bulk actions */}
      <Panel noPad>
        <div className="p-5 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="Search by role, skill, location, or status"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "Publish selected", icon: <UploadCloud className="h-4 w-4" />, action: () => handleBulkAction("publish"), disabled: !selectedJobIds.length || saving || !canManageJobs },
                { label: "Close selected",   icon: <XCircle className="h-4 w-4" />,   action: () => handleBulkAction("close"),   disabled: !selectedJobIds.length || saving || !canManageJobs },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={btn.action}
                  disabled={btn.disabled}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-3 py-2 disabled:opacity-40 transition-colors"
                >
                  {btn.icon}
                  {btn.label}
                </button>
              ))}
              <button
                type="button"
                disabled={!selectedJobIds.length || saving || !canManageIntegrations}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-3 py-2 disabled:opacity-40 transition-colors"
                onClick={async () => {
                  try {
                    setSaving(true);
                    const result = await prepareExternalPosting("linkedin", selectedJobIds);
                    const executed = await executeExternalPosting(result.requests.map((item) => item.id));
                    const firstLink = executed.find((item) => item.external_url)?.external_url;
                    if (firstLink) window.open(firstLink, "_blank", "noopener,noreferrer");
                    toast.success(`${result.count} jobs prepared for LinkedIn execution.`);
                  } catch (error) { console.error(error); toast.error("Unable to prepare external posting right now."); }
                  finally { setSaving(false); }
                }}
              >
                <UploadCloud className="h-4 w-4" />
                Prepare LinkedIn export
              </button>
            </div>
          </div>
          {!canManageJobs ? (
            <p className="text-sm text-gray-400">Your current role can view jobs, but only recruiters or admins can change them.</p>
          ) : null}
        </div>
      </Panel>

      {pagedJobs.length ? (
        <>
          {/* Selection bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={(checked) => {
                  setSelectedJobIds((current) => {
                    if (checked) return [...new Set([...current, ...pagedJobs.map((job) => job.id)])];
                    return current.filter((jobId) => !pagedJobs.some((job) => job.id === jobId));
                  });
                }}
                aria-label="Select all visible jobs"
              />
              <span>{selectedJobIds.length} selected across current results</span>
            </div>
            {selectedJobIds.length ? (
              <button
                type="button"
                onClick={() => setSelectedJobIds([])}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear selection
              </button>
            ) : null}
          </div>

          {/* Job cards */}
          <div className="grid gap-5 xl:grid-cols-2">
            {pagedJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="h-full rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedJobIds.includes(job.id)}
                        onCheckedChange={(checked) => {
                          setSelectedJobIds((current) =>
                            checked ? [...new Set([...current, job.id])] : current.filter((id) => id !== job.id),
                          );
                        }}
                        aria-label={`Select ${job.title}`}
                        className="mt-1"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[job.employer_status] || statusColors.draft}`}>
                            {job.employer_status}
                          </span>
                          <span className="text-xs uppercase tracking-widest text-gray-400">{job.company_name}</span>
                        </div>
                        <h3 className="mt-2 text-lg font-bold text-gray-900">{job.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{job.location} · {job.salary}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        aria-label="Edit job"
                        onClick={() => { setEditingJob(job); setDialogOpen(true); }}
                        disabled={!canManageJobs}
                        className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-40 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete job"
                        onClick={() => handleDelete(job)}
                        disabled={!canManageJobs}
                        className="p-2 rounded-xl border border-red-100 bg-white hover:bg-red-50 text-red-500 disabled:opacity-40 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="line-clamp-3 text-sm text-gray-500 leading-relaxed">{job.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Applicants</p>
                      <p className="mt-1 font-bold text-gray-900">{job.applications_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Deadline</p>
                      <p className="mt-1 font-bold text-gray-900">{job.deadline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Updated</p>
                      <p className="mt-1 font-bold text-gray-900">
                        {job.updated_at ? new Date(job.updated_at).toLocaleDateString() : "Now"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<BriefcaseBusiness className="h-6 w-6" />}
          title="No matching jobs"
          description="Create your first job posting or broaden the current search to see more roles."
          action={(
            <button
              type="button"
              onClick={() => { setEditingJob(null); setDialogOpen(true); }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors shadow-sm"
            >
              Add a job
            </button>
          )}
        />
      )}

      {/* External posting history */}
      {postingRequests.length ? (
        <Panel title="Recent execution history" subtitle="External posting activity">
          <div className="space-y-2">
            {postingRequests.slice(0, 6).map((request) => (
              <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{request.job_title}</p>
                  <p className="text-gray-500 mt-0.5">{request.platform} · {request.status}</p>
                </div>
                {request.external_url ? (
                  <a href={request.external_url} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline font-medium">
                    Open external link
                  </a>
                ) : (
                  <span className="text-gray-400">No external link yet</span>
                )}
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      {/* Pagination */}
      {pageCount > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(1, p - 1)); }} />
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink href="#" isActive={page === currentPage} onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(pageCount, p + 1)); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      <JobFormDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingJob(null); }}
        initialJob={editingJob}
        loading={saving}
        onSubmit={handleSaveJob}
      />
    </div>
  );
}
