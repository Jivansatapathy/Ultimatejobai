import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Briefcase, Globe2, Linkedin, MapPin, Star, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/employer/LoadingState";
import { createCompanyReview, getPublicEmployerCompany } from "@/services/employerService";
import { PublicEmployerCompanyProfile } from "@/types/employer";
import { toast } from "sonner";

export default function CompanyProfile() {
  const { slug = "" } = useParams();
  const { isAuthenticated, isEmployer } = useAuth();
  const [company, setCompany] = useState<PublicEmployerCompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    reviewer_name: "",
    reviewer_title: "",
    rating: "5",
    headline: "",
    body: "",
    employment_context: "candidate" as "candidate" | "current_employee" | "former_employee" | "interview",
  });

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        setCompany(await getPublicEmployerCompany(slug));
      } catch {
        setError("We couldn't load that company page right now.");
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      run();
    }
  }, [slug]);

  const canReview = isAuthenticated && !isEmployer;
  const reviewStars = useMemo(() => Array.from({ length: 5 }, (_, index) => index + 1), []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_18%,#f8fafc_50%,#ffffff_100%)]">
        <Navbar />
        <div className="pt-24">
          <LoadingState label="Loading company page..." />
        </div>
      </div>
    );
  }

  if (!company || error) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_18%,#f8fafc_50%,#ffffff_100%)]">
        <Navbar />
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 pt-20">
          <Card className="w-full rounded-[32px] border-slate-200 bg-white">
            <CardContent className="space-y-4 p-8 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-300" />
              <h1 className="text-2xl font-semibold text-slate-950">Company page unavailable</h1>
              <p className="text-sm text-slate-500">{error || "This employer profile could not be found."}</p>
              <Button asChild className="rounded-full">
                <Link to="/jobs">Back to jobs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_18%,#f8fafc_50%,#ffffff_100%)]">
      <Navbar />
      <main className="px-4 pb-16 pt-24">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-[36px] border border-white/80 bg-white/80 p-8 shadow-[0_40px_120px_-70px_rgba(37,99,235,0.45)] backdrop-blur">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                  <Building2 className="h-3.5 w-3.5" />
                  Employer Profile
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">{company.name}</h1>
                  <p className="mt-3 max-w-3xl text-lg text-slate-600">
                    {company.brand_tagline || company.brand_summary || "Explore open roles, hiring focus areas, and the company's live employer-posted opportunities."}
                  </p>
                </div>
                {company.brand_summary ? (
                  <p className="max-w-3xl text-sm leading-7 text-slate-500">{company.brand_summary}</p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700">
                      <Globe2 className="h-4 w-4" />
                      Website
                    </a>
                  ) : null}
                  {company.linkedin_url ? (
                    <a href={company.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-200 hover:text-blue-700">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  ) : null}
                  <Button asChild variant="outline" className="rounded-full">
                    <Link to="/jobs">Browse all jobs</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <Card className="rounded-[28px] border-slate-200 bg-slate-950 text-white">
                  <CardContent className="grid gap-4 p-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/60">Open Roles</p>
                      <p className="mt-2 text-3xl font-semibold">{company.stats.open_roles}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/60">Applications</p>
                      <p className="mt-2 text-3xl font-semibold">{company.stats.total_applications}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/60">Teams Hiring</p>
                      <p className="mt-2 text-3xl font-semibold">{company.stats.teams_hiring}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-[28px] border-slate-200 bg-white">
                  <CardContent className="space-y-4 p-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Hiring Footprint</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {company.locations.length ? company.locations.map((location) => (
                          <Badge key={location} variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
                            {location}
                          </Badge>
                        )) : <span className="text-sm text-slate-500">Locations update as employer roles go live.</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Teams</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {company.departments.length ? company.departments.map((department) => (
                          <Badge key={department} variant="outline" className="rounded-full">
                            {department}
                          </Badge>
                        )) : <span className="text-sm text-slate-500">No department tags yet.</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Live employer-posted opportunities</p>
                <h2 className="text-3xl font-semibold text-slate-950">Open roles at {company.name}</h2>
              </div>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {company.jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="h-full rounded-[30px] border-slate-200 bg-white">
                    <CardContent className="space-y-4 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-950">{job.title}</h3>
                          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                              <MapPin className="h-4 w-4" />
                              {job.location || "Flexible"}
                            </span>
                            {job.department ? <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">{job.department}</span> : null}
                          </div>
                        </div>
                        <div className="rounded-2xl bg-slate-100 p-3">
                          <Briefcase className="h-5 w-5 text-slate-700" />
                        </div>
                      </div>

                      <p className="line-clamp-4 text-sm leading-6 text-slate-600">{job.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 6).map((skill) => (
                          <Badge key={skill} variant="secondary" className="rounded-full">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid gap-3 rounded-3xl bg-slate-50 p-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Salary</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{job.salary || "Competitive"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Posted</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : "Recently"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Deadline</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{job.deadline || "Open until filled"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {!company.jobs.length ? (
              <Card className="rounded-[28px] border-slate-200 bg-white">
                <CardContent className="space-y-3 p-8 text-center">
                  <Users className="mx-auto h-10 w-10 text-slate-300" />
                  <h3 className="text-xl font-semibold text-slate-950">No open roles right now</h3>
                  <p className="text-sm text-slate-500">This employer profile is live, but there are no currently published employer-posted jobs to show.</p>
                </CardContent>
              </Card>
            ) : null}
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <Card className="rounded-[30px] border-slate-200 bg-white">
              <CardContent className="space-y-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Company trust signals</p>
                    <h2 className="text-3xl font-semibold text-slate-950">Reviews</h2>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-700">
                    <p className="text-xs uppercase tracking-[0.14em]">Average rating</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-lg font-semibold">{company.review_summary.average_rating || "New"}</span>
                      <span className="text-sm text-amber-800/70">({company.review_summary.count} reviews)</span>
                    </div>
                  </div>
                </div>

                {company.reviews.length ? (
                  <div className="space-y-4">
                    {company.reviews.map((review) => (
                      <div key={review.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-950">{review.headline}</h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {review.reviewer_name}{review.reviewer_title ? ` • ${review.reviewer_title}` : ""} • {review.employment_context.replace("_", " ")}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                            {reviewStars.map((star) => (
                              <Star key={star} className={`h-4 w-4 ${star <= review.rating ? "fill-current" : ""}`} />
                            ))}
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{review.body}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                    No reviews yet. The first candidate or employee review will show up here.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border-slate-200 bg-white">
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">Share your experience</p>
                  <h2 className="text-2xl font-semibold text-slate-950">Write a review</h2>
                </div>

                {canReview ? (
                  <>
                    <Input
                      value={reviewForm.reviewer_name}
                      onChange={(event) => setReviewForm((current) => ({ ...current, reviewer_name: event.target.value }))}
                      placeholder="Your name"
                    />
                    <Input
                      value={reviewForm.reviewer_title}
                      onChange={(event) => setReviewForm((current) => ({ ...current, reviewer_title: event.target.value }))}
                      placeholder="Your title or relationship"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select
                        value={reviewForm.rating}
                        onChange={(event) => setReviewForm((current) => ({ ...current, rating: event.target.value }))}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {reviewStars.map((star) => (
                          <option key={star} value={star.toString()}>{star} Star{star > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                      <select
                        value={reviewForm.employment_context}
                        onChange={(event) => setReviewForm((current) => ({ ...current, employment_context: event.target.value as typeof current.employment_context }))}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="candidate">Candidate</option>
                        <option value="interview">Interview Experience</option>
                        <option value="current_employee">Current Employee</option>
                        <option value="former_employee">Former Employee</option>
                      </select>
                    </div>
                    <Input
                      value={reviewForm.headline}
                      onChange={(event) => setReviewForm((current) => ({ ...current, headline: event.target.value }))}
                      placeholder="Short headline"
                    />
                    <Textarea
                      value={reviewForm.body}
                      onChange={(event) => setReviewForm((current) => ({ ...current, body: event.target.value }))}
                      placeholder="Share what stood out about the hiring process or company experience"
                      className="min-h-32"
                    />
                    <Button
                      className="w-full rounded-full"
                      disabled={submittingReview}
                      onClick={async () => {
                        try {
                          setSubmittingReview(true);
                          const review = await createCompanyReview(slug, {
                            reviewer_name: reviewForm.reviewer_name.trim(),
                            reviewer_title: reviewForm.reviewer_title.trim(),
                            rating: Number(reviewForm.rating),
                            headline: reviewForm.headline.trim(),
                            body: reviewForm.body.trim(),
                            employment_context: reviewForm.employment_context,
                          });
                          setCompany((current) => current ? {
                            ...current,
                            reviews: [review, ...current.reviews].slice(0, 6),
                            review_summary: {
                              count: current.review_summary.count + 1,
                              average_rating: Number((((current.review_summary.average_rating * current.review_summary.count) + review.rating) / (current.review_summary.count + 1)).toFixed(1)),
                            },
                          } : current);
                          setReviewForm({
                            reviewer_name: "",
                            reviewer_title: "",
                            rating: "5",
                            headline: "",
                            body: "",
                            employment_context: "candidate",
                          });
                          toast.success("Review added.");
                        } catch (submitError) {
                          console.error(submitError);
                          toast.error("Unable to submit the review right now.");
                        } finally {
                          setSubmittingReview(false);
                        }
                      }}
                    >
                      Submit review
                    </Button>
                  </>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                    {isEmployer ? "Employer accounts cannot post public reviews for companies." : "Login as a candidate to leave a company review."}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
