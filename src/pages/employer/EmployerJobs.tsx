import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BriefcaseBusiness, Pencil, Plus, Search, Trash2, UploadCloud, XCircle } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/employer/EmptyState";
import { JobFormDialog } from "@/components/employer/JobFormDialog";
import { LoadingState } from "@/components/employer/LoadingState";
import { PageHeader } from "@/components/employer/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (!user || !isEmployer) {
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const [items, requests] = await Promise.all([
          getEmployerJobs(deferredSearch),
          getExternalPostingRequests(),
        ]);
        setJobs(items);
        setPostingRequests(requests);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [deferredSearch, isEmployer, user]);

  const filteredJobs = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) {
      return jobs;
    }
    return jobs.filter((job) =>
      [job.title, job.location, job.employer_status, job.skills.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [deferredSearch, jobs]);

  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const pagedJobs = filteredJobs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const allVisibleSelected = pagedJobs.length > 0 && pagedJobs.every((job) => selectedJobIds.includes(job.id));

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch]);

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
    title: string;
    description: string;
    salary: string;
    location: string;
    city?: string;
    region?: string;
    country?: string;
    department?: string;
    employment_type?: string;
    workplace_type?: string;
    is_remote: "yes" | "no";
    quick_apply_enabled: "yes" | "no";
    quick_apply_questions?: string;
    skills: string;
    deadline: string;
    status: "draft" | "published" | "closed";
  }) => {
    if (!profile) {
      return;
    }

    setSaving(true);
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      salary: values.salary.trim(),
      location: values.location.trim(),
      city: values.city?.trim() || "",
      region: values.region?.trim() || "",
      country: values.country?.trim() || "",
      department: values.department?.trim() || "",
      employment_type: values.employment_type?.trim() || "",
      workplace_type: values.workplace_type?.trim() || "",
      is_remote: values.is_remote === "yes",
      quick_apply_enabled: values.quick_apply_enabled === "yes",
      quick_apply_questions: values.quick_apply_enabled === "no"
        ? values.quick_apply_questions?.split("\n").map((item) => item.trim()).filter(Boolean) || []
        : [],
      skills: values.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      deadline: values.deadline,
      employer_status: values.status,
    };

    try {
      if (editingJob) {
        await updateEmployerJob(editingJob.id, payload);
        toast.success("Job updated successfully.");
      } else {
        await createEmployerJob(payload);
        toast.success("Job created successfully.");
      }
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
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete that job.");
    }
  };

  const handleBulkAction = async (action: "publish" | "close") => {
    if (!selectedJobIds.length) {
      toast.error("Select at least one job first.");
      return;
    }

    try {
      setSaving(true);
      const result = await bulkEmployerJobAction(action, selectedJobIds);
      await refreshJobs();
      setSelectedJobIds([]);
      toast.success(`${result.updated} jobs updated.`);
    } catch (error) {
      console.error(error);
      toast.error("Unable to run that bulk action right now.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading your jobs..." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Jobs"
        title="Job Management"
        description="Create, edit, publish, remove, or bulk-update job postings with your Django employer API."
        actions={(
          <Button
            className="rounded-2xl"
            onClick={() => {
              setEditingJob(null);
              setDialogOpen(true);
            }}
            disabled={!canManageJobs}
          >
            <Plus className="h-4 w-4" />
            Create job
          </Button>
        )}
      />

      <Card className="rounded-3xl border-border/70">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by role, skill, location, or status"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="rounded-2xl" disabled={!selectedJobIds.length || saving || !canManageJobs} onClick={() => handleBulkAction("publish")}>
                <UploadCloud className="h-4 w-4" />
                Publish selected
              </Button>
              <Button variant="outline" className="rounded-2xl" disabled={!selectedJobIds.length || saving || !canManageJobs} onClick={() => handleBulkAction("close")}>
                <XCircle className="h-4 w-4" />
                Close selected
              </Button>
              <Button variant="outline" className="rounded-2xl" disabled={!selectedJobIds.length || saving || !canManageIntegrations} onClick={async () => {
                try {
                  setSaving(true);
                  const result = await prepareExternalPosting("linkedin", selectedJobIds);
                  const executed = await executeExternalPosting(result.requests.map((item) => item.id));
                  const firstLink = executed.find((item) => item.external_url)?.external_url;
                  if (firstLink) {
                    window.open(firstLink, "_blank", "noopener,noreferrer");
                  }
                  toast.success(`${result.count} jobs prepared for LinkedIn execution.`);
                } catch (error) {
                  console.error(error);
                  toast.error("Unable to prepare external posting right now.");
                } finally {
                  setSaving(false);
                }
              }}>
                <UploadCloud className="h-4 w-4" />
                Prepare LinkedIn export
              </Button>
            </div>
          </div>
          {!canManageJobs ? <p className="text-sm text-muted-foreground">Your current role can view jobs, but only recruiters or admins can change them.</p> : null}
        </CardContent>
      </Card>

      {pagedJobs.length ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/70 bg-background/80 px-5 py-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={(checked) => {
                  setSelectedJobIds((current) => {
                    if (checked) {
                      return [...new Set([...current, ...pagedJobs.map((job) => job.id)])];
                    }
                    return current.filter((jobId) => !pagedJobs.some((job) => job.id === jobId));
                  });
                }}
                aria-label="Select all visible jobs"
              />
              <span>{selectedJobIds.length} selected across current results</span>
            </div>
            {selectedJobIds.length ? (
              <Button variant="ghost" className="rounded-2xl" onClick={() => setSelectedJobIds([])}>
                Clear selection
              </Button>
            ) : null}
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {pagedJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="h-full rounded-3xl border-border/70">
                  <CardContent className="space-y-5 p-6">
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
                            <Badge variant="outline" className="capitalize">
                              {job.employer_status}
                            </Badge>
                            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{job.company_name}</span>
                          </div>
                          <h3 className="mt-3 text-xl font-semibold">{job.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">{job.location} | {job.salary}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-2xl"
                          onClick={() => {
                            setEditingJob(job);
                            setDialogOpen(true);
                          }}
                          disabled={!canManageJobs}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-2xl text-destructive" onClick={() => handleDelete(job)} disabled={!canManageJobs}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="line-clamp-3 text-sm text-muted-foreground">{job.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="rounded-full">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid gap-3 rounded-2xl bg-secondary/60 p-4 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-muted-foreground">Applicants</p>
                        <p className="mt-1 font-semibold">{job.applications_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deadline</p>
                        <p className="mt-1 font-semibold">{job.deadline}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Updated</p>
                        <p className="mt-1 font-semibold">{job.updated_at ? new Date(job.updated_at).toLocaleDateString() : "Now"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
            <Button
              onClick={() => {
                setEditingJob(null);
                setDialogOpen(true);
              }}
            >
              Add a job
            </Button>
          )}
        />
      )}

      {postingRequests.length ? (
        <Card className="rounded-3xl border-border/70">
          <CardContent className="space-y-4 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">External posting activity</p>
              <h3 className="mt-2 text-xl font-semibold">Recent execution history</h3>
            </div>
            <div className="grid gap-3">
              {postingRequests.slice(0, 6).map((request) => (
                <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 p-4 text-sm">
                  <div>
                    <p className="font-medium">{request.job_title}</p>
                    <p className="text-muted-foreground">{request.platform} | {request.status}</p>
                  </div>
                  {request.external_url ? (
                    <a href={request.external_url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                      Open external link
                    </a>
                  ) : (
                    <span className="text-muted-foreground">No external link yet</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {pageCount > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setCurrentPage((page) => Math.max(1, page - 1));
                }}
              />
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setCurrentPage((page) => Math.min(pageCount, page + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      <JobFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingJob(null);
          }
        }}
        initialJob={editingJob}
        loading={saving}
        onSubmit={handleSaveJob}
      />
    </div>
  );
}
