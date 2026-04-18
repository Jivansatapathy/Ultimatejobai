import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Briefcase, Building2, ExternalLink, MapPin, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchJobById, Job } from "@/services/jobService";

export default function PublicLinkedInJob() {
  const { jobId = "" } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      const response = await fetchJobById(jobId);
      if (!active) {
        return;
      }
      setJob(response);
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [jobId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
          <span className="text-sm text-slate-600">Opening job details...</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Briefcase className="mx-auto mb-4 h-10 w-10 text-slate-300" />
          <h1 className="text-2xl font-semibold text-slate-900">Job not found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            This role may have been removed or is no longer available.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/">Browse jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[36px] border border-white/80 bg-white/95 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.45)] backdrop-blur md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">LinkedIn job post</Badge>
                {job.source ? <Badge variant="outline" className="capitalize">{job.source}</Badge> : null}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">{job.title}</h1>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                  <Building2 className="h-4 w-4" />
                  {job.company}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
              </div>
            </div>

            <Button asChild className="rounded-full px-6 py-6 text-base">
              <a href={job.apply_url || job.url || "#"} target="_blank" rel="noreferrer">
                Apply now
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {job.tags.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <section className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">About this job</h2>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {job.description || "Full role details will be available on the application page."}
            </div>
          </section>

          <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">How to apply</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Review the role details above, then use the apply button to continue to the application page for this opening.
            </p>
            <div className="mt-5">
              <Button asChild className="rounded-full px-6">
                <a href={job.apply_url || job.url || "#"} target="_blank" rel="noreferrer">
                  Continue to application
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
