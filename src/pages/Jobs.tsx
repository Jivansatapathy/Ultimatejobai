import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Bookmark,
  Send,
  Sparkles,
  Briefcase,
  TrendingUp,
  Loader2,
  Zap
} from "lucide-react";
import { searchJobs, Job } from "@/services/jobService";
import { toast } from "sonner";
import { JobSidebar } from "@/components/jobs/JobSidebar";
import { AutoApplyModal } from "@/components/jobs/AutoApplyModal";

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savedJobs, setSavedJobs] = useState<(string | number)[]>([]);
  const [sortBy, setSortBy] = useState("Best Match");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [totalResults, setTotalResults] = useState(0);
  const [autoApplyJob, setAutoApplyJob] = useState<Job | null>(null);
  const [autoApplyOpen, setAutoApplyOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: "",
    employment_type: "",
    workplace_type: "",
    job_type: ""
  });

  const parseDate = (dateStr: string) => {
    const now = new Date();
    const num = parseInt(dateStr.match(/\d+/)?.[0] || "0");
    if (dateStr.includes("hour")) return new Date(now.getTime() - num * 60 * 60 * 1000);
    if (dateStr.includes("day")) return new Date(now.getTime() - num * 24 * 60 * 60 * 1000);
    if (dateStr.includes("week")) return new Date(now.getTime() - num * 7 * 24 * 60 * 60 * 1000);
    if (dateStr.includes("month")) return new Date(now.getTime() - num * 30 * 24 * 60 * 60 * 1000);
    return now;
  };

  const sortJobs = (jobList: Job[], criteria: string) => {
    const list = [...jobList];
    switch (criteria) {
      case "Most Recent":
        return list.sort((a, b) => parseDate(b.posted).getTime() - parseDate(a.posted).getTime());
      case "Highest Salary":
        const getSalaryValue = (s?: string) => {
          if (!s) return 0;
          const match = s.match(/\d+/g);
          return match ? parseInt(match[match.length - 1]) : 0;
        };
        return list.sort((a, b) => getSalaryValue(b.salary) - getSalaryValue(a.salary));
      case "Best Match":
      default:
        return list.sort((a, b) => b.match - a.match);
    }
  };

  const fetchJobs = async (query: string = "", currentFilters: any = filters) => {
    setIsRefreshing(true);
    try {
      // Single API call with page_size=100 — no slow multi-page loop
      const { jobs: newJobs, totalResults: total } = await searchJobs(
        query, 1, { ...currentFilters, page_size: 100 }
      );

      const sorted = sortJobs(newJobs, sortBy);
      setJobs(sorted);
      setTotalResults(total || newJobs.length);
    } catch (error: any) {
      toast.error("Failed to fetch jobs: " + (error.response?.data?.message || error.message));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const loadJobs = async () => {
      await fetchJobs(searchQuery, filters);
    };
    loadJobs();
  }, [sortBy, filters]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchJobs(searchQuery, filters);
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleSave = (jobId: string | number) => {
    setSavedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
    toast.success(savedJobs.includes(jobId) ? "Job unsaved" : "Job saved to your profile");
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setSearchQuery(role);
    fetchJobs(role, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Job Discovery</h1>
            <p className="text-muted-foreground">AI-matched opportunities tailored to your profile</p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 mb-6"
          >
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={filters.employment_type}
                  onChange={(e) => handleFilterChange("employment_type", e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                </select>
                <select
                  value={filters.workplace_type}
                  onChange={(e) => handleFilterChange("workplace_type", e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="">Any Workplace</option>
                  <option value="on-site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <Button variant="hero" type="submit" className="gap-2 min-w-[120px]" disabled={isRefreshing}>
                  {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
              </div>
            </form>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <JobSidebar
                onSelectRole={handleRoleSelect}
                selectedRole={selectedRole}
              />
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-4">
              {/* Results Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between"
              >
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {isRefreshing ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Finding best matches...
                    </>
                  ) : (
                    <>
                      <span className="text-foreground font-medium">{jobs.length}</span>
                      {totalResults > jobs.length && (
                        <span> of <span className="text-foreground font-medium">{totalResults}</span></span>
                      )}
                      {" "}jobs found
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    <option>Best Match</option>
                    <option>Most Recent</option>
                    <option>Highest Salary</option>
                  </select>
                </div>
              </motion.div>

              {/* Job Listings */}
              <div className="space-y-4">
                {/* Job Cards */}
                {isRefreshing ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full border-t-2 border-accent animate-spin"></div>
                      <Sparkles className="h-6 w-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-muted-foreground text-sm animate-pulse">Analyzing thousands of opportunities...</p>
                  </div>
                ) : jobs.length > 0 ? (
                  <>
                    {jobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * (index % 10) }}
                        className="glass-card-hover p-6 group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-foreground" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                                {job.title}
                              </h3>
                              <p className="text-muted-foreground">{job.company}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                              {job.match}% match
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleSave(job.id)}
                              className={savedJobs.includes(job.id) ? "text-accent" : "text-muted-foreground"}
                            >
                              <Bookmark className={`h-5 w-5 ${savedJobs.includes(job.id) ? "fill-current" : ""}`} />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.posted}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <Button
                            variant="hero"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              setAutoApplyJob(job);
                              setAutoApplyOpen(true);
                            }}
                          >
                            <Zap className="h-4 w-4" />
                            Auto Apply
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => job.url && window.open(job.url, '_blank')}>
                            View Details
                          </Button>
                          {(job as any).company_emails?.length > 0 && (
                            <a
                              href={`mailto:${(job as any).company_emails[0]}`}
                              className="text-xs text-accent underline truncate max-w-[180px]"
                            >
                              ✉ {(job as any).company_emails[0]}
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-20 glass-card">
                    <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                    <p className="text-muted-foreground italic text-sm">Try adjusting your search to see more results.</p>
                    <Button variant="outline" className="mt-6" onClick={() => fetchJobs("")}>
                      Show All Jobs
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

      {/* Auto Apply Modal */}
      <AutoApplyModal
        job={autoApplyJob ? { id: String(autoApplyJob.id), title: autoApplyJob.title, company: autoApplyJob.company } : null}
        open={autoApplyOpen}
        onClose={() => { setAutoApplyOpen(false); setAutoApplyJob(null); }}
      />
    </>
  );
}
