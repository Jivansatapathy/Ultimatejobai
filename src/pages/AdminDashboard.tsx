import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Terminal, 
  Briefcase, 
  CheckCircle, 
  LayoutDashboard, 
  Download, 
  Search, 
  ArrowRight,
  ExternalLink,
  Loader2,
  Database,
  Calendar,
  Layers,
  Activity,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { adminService, DashboardStats, AdminUser, AdminInterview, AdminJob, AdminApplication } from "@/services/adminService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [interviews, setInterviews] = useState<AdminInterview[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Job Exactor Form
  const [ingestSlug, setIngestSlug] = useState("");
  const [ingestPlatform, setIngestPlatform] = useState("lever");
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [ingestStatus, setIngestStatus] = useState("");

  // Job Preview
  const [previewJob, setPreviewJob] = useState<AdminJob | null>(null);
  const [jobSearch, setJobSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [s, u, i, j, a] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getInterviews(),
        adminService.getJobs(),
        adminService.getApplications()
      ]);
      setStats(s);
      setUsers(u);
      setInterviews(i);
      setJobs(j);
      setApplications(a);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || "Failed to load admin data";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIngest = async () => {
    if (!ingestSlug) return;
    setIsIngesting(true);
    setIngestProgress(0);
    setIngestStatus("Initializing connection...");

    try {
      await adminService.forceIngest(ingestPlatform, ingestSlug);
      
      // Start Polling
      const pollInterval = setInterval(async () => {
        try {
          const status = await adminService.getIngestProgress(ingestSlug);
          setIngestProgress(status.progress);
          
          if (status.progress < 20) setIngestStatus("Fetching job data...");
          else if (status.progress < 50) setIngestStatus("Normalizing listings...");
          else if (status.progress < 90) setIngestStatus("Saving to database...");
          else setIngestStatus("Cleaning up...");

          if (status.is_done) {
            clearInterval(pollInterval);
            setIsIngesting(false);
            if (status.error) {
              toast.error(`Error: ${status.error}`);
            } else {
              const r = status.result;
              toast.success(`Complete! Found ${r.fetched} jobs. Created ${r.created}, Updated ${r.updated}.`);
              fetchData();
            }
          }
        } catch (e) {
          clearInterval(pollInterval);
          setIsIngesting(false);
          toast.error("Lost connection to progress tracker");
        }
      }, 1000);

    } catch (err: any) {
      toast.error(err.response?.data?.error || "Ingestion kick-off failed");
    } finally {
      setIsIngesting(false);
    }
  };

  const normalizedJobSearch = jobSearch.trim().toLowerCase();
  const visibleJobs = normalizedJobSearch
    ? jobs.filter((job) =>
        [job.title, job.company, job.location, job.platform, job.source, job.created_by]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedJobSearch))
      )
    : jobs;
  const employerJobs = visibleJobs.filter((job) => job.source === "employer" || job.platform === "employer");
  const scrapedJobs = visibleJobs.filter((job) => job.source !== "employer" && job.platform !== "employer");

  const renderJobsTable = (sectionJobs: AdminJob[], emptyMessage: string) => (
    <Table>
      <TableHeader>
        <TableRow className="border-white/5 bg-background/50">
          <TableHead>Job Title</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Listed Date</TableHead>
          <TableHead className="text-right">Preview</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sectionJobs.length === 0 ? (
          <TableRow className="border-white/5">
            <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : sectionJobs.map(j => {
          const canOpenApplyUrl = Boolean(j.apply_url);
          const canEmbedPreview = canOpenApplyUrl && (j.platform === "lever" || j.platform === "greenhouse");

          return (
            <TableRow key={j.id} className="border-white/5 hover:bg-white/5 transition-colors">
              <TableCell className="font-bold">{j.title}</TableCell>
              <TableCell className="text-accent">{j.company}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">{j.source || j.platform}</Badge>
                  {j.source === "employer" && j.employer_status && (
                    <Badge variant="secondary" className="capitalize">{j.employer_status}</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm opacity-70">{j.location || "Not specified"}</TableCell>
              <TableCell className="text-xs font-mono">{new Date(j.posted_at || j.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                {canEmbedPreview ? (
                  <Dialog>
                     <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setPreviewJob(j)}><ArrowRight className="h-4 w-4" /></Button>
                     </DialogTrigger>
                     <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden bg-background border-white/10 rounded-3xl">
                        {previewJob && (
                          <div className="flex flex-col h-full">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-secondary/5">
                                <div className="flex items-center gap-3">
                                  <Badge className="bg-accent/20 text-accent border-accent/20 capitalize font-bold">{previewJob.platform}</Badge>
                                  <h3 className="font-bold text-xl">{previewJob.title} - {previewJob.company}</h3>
                                </div>
                                <Button asChild variant="outline" size="sm" className="h-8 gap-2">
                                  <a href={previewJob.apply_url || "#"} target="_blank" rel="noreferrer">
                                    Open Full <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </Button>
                            </div>
                            <div className="flex-grow relative bg-white">
                               <iframe
                                 src={previewJob.apply_url && previewJob.platform === "lever" && !previewJob.apply_url.includes("embed=true")
                                     ? `${previewJob.apply_url}${previewJob.apply_url.includes("?") ? "&" : "?"}embed=true`
                                     : previewJob.apply_url || ""}
                                 className="w-full h-full border-none"
                                 title="Job Post Preview"
                               />
                            </div>
                          </div>
                        )}
                     </DialogContent>
                  </Dialog>
                ) : canOpenApplyUrl ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-accent group"
                    onClick={() => window.open(j.apply_url || "", "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Button>
                ) : (
                  <Badge variant="secondary" className="bg-background/60 text-muted-foreground">Internal</Badge>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
             <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5">Admin Panel</Badge>
                <div className="h-4 w-[1px] bg-white/10 mx-2" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Master Dashboard</span>
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight">System Management</h1>
             <p className="text-muted-foreground mt-2">Oversee users, monitor interview usage, and extract automated job data.</p>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
             <TabsList className="bg-secondary/20 p-1 border border-white/5 rounded-xl">
               <TabsTrigger value="overview" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Overview</TabsTrigger>
               <TabsTrigger value="users" className="gap-2"><UserCheck className="h-4 w-4" /> Users & Tasks</TabsTrigger>
               <TabsTrigger value="interviews" className="gap-2"><Activity className="h-4 w-4" /> Interviews</TabsTrigger>
               <TabsTrigger value="jobs" className="gap-2"><Briefcase className="h-4 w-4" /> Jobs Database</TabsTrigger>
               <TabsTrigger value="applications" className="gap-2"><Layers className="h-4 w-4" /> Auto-Applies</TabsTrigger>
               <TabsTrigger value="extractor" className="gap-2"><Database className="h-4 w-4" /> Job Extractor</TabsTrigger>
             </TabsList>

             {/* Overview Tab */}
             <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                   <StatCard title="Total Users" value={stats?.users || 0} icon={<Users />} trend="+4% this week" />
                   <StatCard title="Total Interviews" value={stats?.interviews || 0} icon={<Terminal />} trend="+12% this week" />
                   <StatCard title="Total Jobs Ingested" value={stats?.jobs || 0} icon={<Briefcase />} trend="+82 this week" />
                   <StatCard title="Auto-Appliances" value={stats?.auto_applies || 0} icon={<CheckCircle />} trend="+15% this week" />
                </div>
                
                {/* Real-time Ingestion Progress */}
                {isIngesting && (
                  <Card className="mb-8 border-accent/20 bg-accent/5 overflow-hidden">
                    <CardContent className="py-6 flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                         <Loader2 className="h-6 w-6 animate-spin text-accent" />
                         <div className="flex-1">
                           <p className="text-sm font-bold uppercase tracking-widest text-accent">Importing {ingestPlatform}: {ingestSlug}</p>
                           <p className="text-xs text-muted-foreground font-medium">{ingestStatus}</p>
                         </div>
                         <div className="text-right">
                            <span className="text-2xl font-black text-white">{ingestProgress}%</span>
                         </div>
                      </div>
                      <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden border border-white/5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${ingestProgress}%` }}
                           className="h-full bg-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]"
                         />
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="grid md:grid-cols-2 gap-8">
                   <Card className="bg-secondary/10 border-white/5 overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent">
                         <CardTitle className="text-lg">Recent User Growth</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                         [Chart Placeholder]
                      </CardContent>
                   </Card>
                   <Card className="bg-secondary/10 border-white/5">
                      <CardHeader>
                         <CardTitle className="text-lg">System Insights</CardTitle>
                         <CardDescription>Real-time server activity and ingestion status.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                         <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5">
                            <span className="text-sm">Job Scraper (JobFairX)</span>
                            <Badge className="bg-success/20 text-success border-success/20">Active</Badge>
                         </div>
                         <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5">
                            <span className="text-sm">Auto-Apply Worker</span>
                            <Badge className="bg-success/20 text-success border-success/20">Standby</Badge>
                         </div>
                         <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5">
                            <span className="text-sm">AI Resume Auditor</span>
                            <Badge className="bg-success/20 text-success border-success/20">Operational</Badge>
                         </div>
                      </CardContent>
                   </Card>
                </div>
             </TabsContent>

             {/* Users Tab */}
             <TabsContent value="users">
                <Card className="bg-secondary/10 border-white/5">
                   <CardHeader>
                      <CardTitle>User Activity Monitor</CardTitle>
                      <CardDescription>Track user engagement and interview quotas.</CardDescription>
                   </CardHeader>
                   <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/5 bg-background/50">
                            <TableHead>User Email</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Interviews</TableHead>
                            <TableHead>Apps</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map(u => (
                            <TableRow key={u.id} className="border-white/5">
                              <TableCell className="font-semibold">{u.email}</TableCell>
                              <TableCell className="text-muted-foreground">{u.full_name || 'N/A'}</TableCell>
                              <TableCell>{u.interviews}</TableCell>
                              <TableCell>{u.applications}</TableCell>
                              <TableCell className="text-xs opacity-60 font-mono">{new Date(u.date_joined).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">View Progress</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                   </CardContent>
                </Card>
             </TabsContent>

             {/* Interviews Tab */}
             <TabsContent value="interviews">
                <Card className="bg-secondary/10 border-white/5">
                   <CardHeader>
                      <CardTitle>Interview Session Log</CardTitle>
                      <CardDescription>Detailed overview of all AI-candidate interactions.</CardDescription>
                   </CardHeader>
                   <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/5 bg-background/50">
                            <TableHead>Candidate</TableHead>
                            <TableHead>Interview Type</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {interviews.map(i => (
                            <TableRow key={i.id} className="border-white/5">
                              <TableCell className="text-xs font-mono">{i.user}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{i.type}</Badge>
                              </TableCell>
                              <TableCell>{i.question_count}</TableCell>
                              <TableCell>
                                {i.finished ? <Badge className="bg-success/20 text-success">Finished</Badge> : <Badge className="bg-warning/20 text-warning">In Progress</Badge>}
                              </TableCell>
                              <TableCell className="text-xs opacity-60">{new Date(i.created_at).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                   </CardContent>
                </Card>
             </TabsContent>

             {/* Jobs Tab */}
             <TabsContent value="jobs">
                <Card className="bg-secondary/10 border-white/5 mb-6">
                   <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Created by Employers</CardTitle>
                        <CardDescription>Jobs posted directly from the employer panel. Users still see these mixed with regular jobs.</CardDescription>
                      </div>
                      <Badge className="bg-accent/20 text-accent border-accent/20">{employerJobs.length} jobs</Badge>
                   </CardHeader>
                   <CardContent>
                      {renderJobsTable(employerJobs, "No employer-created jobs found.")}
                   </CardContent>
                </Card>

                <Card className="bg-secondary/10 border-white/5">
                   <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Scraped Jobs</CardTitle>
                        <CardDescription>Jobs imported from ATS/platform scrapers.</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                         <Input
                           placeholder="Search jobs/companies..."
                           className="w-64 bg-background/50 border-white/10"
                           value={jobSearch}
                           onChange={(event) => setJobSearch(event.target.value)}
                         />
                         <Button size="sm" variant="outline"><Search className="h-4 w-4" /></Button>
                      </div>
                   </CardHeader>
                   <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/5 bg-background/50">
                            <TableHead>Job Title</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Platform</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Listed Date</TableHead>
                            <TableHead className="text-right">Preview</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scrapedJobs.map(j => (
                            <TableRow key={j.id} className="border-white/5 hover:bg-white/5 transition-colors">
                              <TableCell className="font-bold">{j.title}</TableCell>
                              <TableCell className="text-accent">{j.company}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">{j.platform}</Badge>
                              </TableCell>
                              <TableCell className="text-sm opacity-70">{j.location}</TableCell>
                              <TableCell className="text-xs font-mono">{new Date(j.posted_at || j.created_at).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                {j.apply_url && (j.platform === 'lever' || j.platform === 'greenhouse') ? (
                                  <Dialog>
                                     <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" onClick={() => setPreviewJob(j)}><ArrowRight className="h-4 w-4" /></Button>
                                     </DialogTrigger>
                                     <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden bg-background border-white/10 rounded-3xl">
                                        {previewJob && (
                                          <div className="flex flex-col h-full">
                                            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-secondary/5">
                                                <div className="flex items-center gap-3">
                                                  <Badge className="bg-accent/20 text-accent border-accent/20 capitalize font-bold">{previewJob.platform}</Badge>
                                                  <h3 className="font-bold text-xl">{previewJob.title} — {previewJob.company}</h3>
                                                </div>
                                                <Button asChild variant="outline" size="sm" className="h-8 gap-2">
                                                  <a href={previewJob.apply_url || "#"} target="_blank" rel="noreferrer">
                                                    Open Full <ExternalLink className="h-3.5 w-3.5" />
                                                  </a>
                                                </Button>
                                            </div>
                                            <div className="flex-grow relative bg-white">
                                               <iframe 
                                                 src={previewJob.apply_url && previewJob.platform === 'lever' && !previewJob.apply_url.includes('embed=true') 
                                                     ? `${previewJob.apply_url}${previewJob.apply_url.includes('?') ? '&' : '?'}embed=true` 
                                                     : previewJob.apply_url || ""} 
                                                 className="w-full h-full border-none"
                                                 title="Job Post Preview"
                                               />
                                            </div>
                                          </div>
                                        )}
                                     </DialogContent>
                                  </Dialog>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="hover:text-accent group"
                                    onClick={() => window.open(j.apply_url || "", '_blank')}
                                  >
                                    <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                   </CardContent>
                </Card>
             </TabsContent>

             {/* Auto-Apply Tab */}
             <TabsContent value="applications">
                <Card className="bg-secondary/10 border-white/5">
                   <CardHeader>
                      <CardTitle>Auto-Apply Monitoring</CardTitle>
                      <CardDescription>Track all jobs being applied via automated workers.</CardDescription>
                   </CardHeader>
                   <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/5 bg-background/50">
                            <TableHead>User Account</TableHead>
                            <TableHead>Applied Job</TableHead>
                            <TableHead>Submission Status</TableHead>
                            <TableHead>Sent At</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {applications.map(a => (
                            <TableRow key={a.id} className="border-white/5">
                              <TableCell className="font-mono text-xs">{a.user}</TableCell>
                              <TableCell className="font-semibold">{a.job_title}</TableCell>
                              <TableCell>
                                <Badge className={a.status === 'sent' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}>
                                  {a.status.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs opacity-60">
                                {a.sent_at ? new Date(a.sent_at).toLocaleString() : 'Pending'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm">Log Details</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                   </CardContent>
                </Card>
             </TabsContent>

             {/* Job Extractor Tab */}
             <TabsContent value="extractor">
                <div className="grid md:grid-cols-3 gap-8">
                   <div className="md:col-span-1">
                      <Card className="bg-secondary/10 border-white/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                             <Terminal className="h-5 w-5 text-accent" />
                             Platform Puller
                          </CardTitle>
                          <CardDescription>Enter a company slug to scrape their ATS boards.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-muted-foreground">Select Platform</label>
                              <div className="flex p-1 bg-background/50 rounded-lg border border-white/10">
                                 <button 
                                    onClick={() => setIngestPlatform("lever")}
                                    className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${ingestPlatform === 'lever' ? 'bg-accent text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                                  >
                                    LEVER
                                  </button>
                                 <button 
                                    onClick={() => setIngestPlatform("greenhouse")}
                                    className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${ingestPlatform === 'greenhouse' ? 'bg-accent text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                                  >
                                    GREENHOUSE
                                  </button>
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-xs font-bold uppercase text-muted-foreground">Company Name / ID</label>
                              <Input 
                                placeholder="e.g. airbnb, netflix" 
                                className="bg-background/50 border-white/10"
                                value={ingestSlug}
                                onChange={(e) => setIngestSlug(e.target.value)}
                              />
                           </div>
                           <Button 
                             className="w-full font-bold h-12" 
                             onClick={handleIngest} 
                             disabled={isIngesting || !ingestSlug}
                           >
                             {isIngesting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Download className="h-5 w-5 mr-2" />}
                             Extract Jobs Now
                           </Button>
                        </CardContent>
                      </Card>
                   </div>
                   
                   <div className="md:col-span-2">
                      <Card className="bg-secondary/10 border-white/10 border-dashed">
                         <CardContent className="p-12 text-center">
                            <Database className="h-20 w-20 text-accent/20 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold mb-2">Ready to expand your index?</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                               When you enter a company name above, our workers will query the {ingestPlatform} API, 
                               normalize all available roles, and enrich the database with new listings.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 border-t border-white/5 pt-8">
                               <div className="flex flex-col items-center">
                                  <span className="text-xl font-bold">150+</span>
                                  <span className="text-[10px] text-muted-foreground uppercase opacity-70">Lever Orgs</span>
                               </div>
                               <div className="h-8 w-[1px] bg-white/5" />
                               <div className="flex flex-col items-center">
                                  <span className="text-xl font-bold">300+</span>
                                  <span className="text-[10px] text-muted-foreground uppercase opacity-70">GH Boards</span>
                               </div>
                               <div className="h-8 w-[1px] bg-white/5" />
                               <div className="flex flex-col items-center">
                                  <span className="text-xl font-bold">5k+</span>
                                  <span className="text-[10px] text-muted-foreground uppercase opacity-70">Daily Syncs</span>
                               </div>
                            </div>
                         </CardContent>
                      </Card>
                   </div>
                </div>
             </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string | number, icon: any, trend: string }) {
  return (
    <Card className="bg-secondary/10 border-white/5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
           <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              {icon}
           </div>
           <span className="text-xs text-success font-medium">{trend}</span>
        </div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
      </CardContent>
    </Card>
  );
}
