import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Job, fetchLeverJobDetails, LeverJobDetails } from "@/services/jobService";
import { Building2, MapPin, Globe, ArrowLeft, Send, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { activityService } from "@/services/activityService";
import { AutoApplyModal } from "@/components/jobs/AutoApplyModal";
import { ApplyBotButton } from "@/components/jobs/ApplyBotButton";
import { CareerResume, careerService } from "@/services/careerService";

interface JobDetailsSheetProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetailsSheet({ job, open, onOpenChange }: JobDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState<string>("apply");
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [leverDetails, setLeverDetails] = useState<LeverJobDetails | null>(null);
  const [isLoadingLever, setIsLoadingLever] = useState(false);
  const [autoApplyOpen, setAutoApplyOpen] = useState(false);
  const [resumes, setResumes] = useState<CareerResume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState("");

  useEffect(() => {
    const fetchFullDescription = async () => {
      if (!open || !job) return;

      console.log('Opening JobDetailsSheet for:', job.title, 'Platform:', job.platform, 'Description length:', job.description?.length);

      // If we have a substantial description in the DB already, use it and don't fetch from Lever
      if (job.description && job.description.length > 20) {
        console.log('Using database-stored description');
        setLeverDetails(null);
        setIsLoadingLever(false);
        return;
      }

      const urlToTest = job.url || job.apply_url || '';
      const leverMatch = urlToTest.match(/jobs\.lever\.co\/([^/]+)\/([^/?#\s/]+)/);
      
      if (leverMatch) {
        setIsLoadingLever(true);
        try {
          console.log('Fetching from Lever API for ID:', leverMatch[2]);
          const details = await fetchLeverJobDetails(leverMatch[1], leverMatch[2]);
          if (details) {
            setLeverDetails(details);
          } else {
            console.warn('Lever API returned no details (likely CORS)');
          }
        } catch (error) {
          console.error("Failed to fetch Lever details", error);
        } finally {
          setIsLoadingLever(false);
        }
      } else {
        setLeverDetails(null);
      }
    };

    fetchFullDescription();
    
    if (open) {
      setIsIframeLoading(true);
    }
  }, [job?.id, open]);

  useEffect(() => {
    const loadResumes = async () => {
      if (!open || !job || job.source !== "employer" || activeTab !== "apply") {
        return;
      }
      try {
        setResumesLoading(true);
        const items = await careerService.getResumes();
        setResumes(items);
        setSelectedResumeId((current) => {
          if (current && items.some((resume) => String(resume.id) === current)) {
            return current;
          }
          return items[0]?.id ? String(items[0].id) : "";
        });
      } catch {
        setResumes([]);
        setSelectedResumeId("");
      } finally {
        setResumesLoading(false);
      }
    };

    loadResumes();
  }, [activeTab, job, open]);

  if (!job) return null;

  const getResumeLabel = (resume: CareerResume) => {
    const fileName = resume.file?.split("/").pop() || `Resume ${resume.id}`;
    return `${fileName} - ${new Date(resume.updated_at || resume.created_at).toLocaleDateString()}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className="w-full sm:max-w-xl md:max-w-2xl p-0 border-r border-border bg-background shadow-2xl z-[100]"
      >
        <ScrollArea className="h-full">
          <div className="p-6 md:p-8">
            <Button 
                variant="ghost" 
                size="sm" 
                className={`mb-4 gap-2 -ml-2 text-muted-foreground hover:text-foreground transition-all duration-300 ${activeTab === 'apply' ? 'opacity-0 h-0 mb-0 overflow-hidden' : 'opacity-100'}`}
                onClick={() => onOpenChange(false)}
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Jobs
            </Button>

            <SheetHeader className={`space-y-4 transition-all duration-500 ease-in-out ${activeTab === 'apply' ? 'mb-4 opacity-70' : 'mb-8'}`}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center border border-border shrink-0">
                  <Building2 className="h-7 w-7 text-foreground" />
                </div>
                <div className="space-y-1">
                  <SheetTitle className={`font-bold leading-tight transition-all duration-300 ${activeTab === 'apply' ? 'text-lg' : 'text-2xl'}`}>{job.title}</SheetTitle>
                  <p className={`text-accent font-medium transition-all duration-300 ${activeTab === 'apply' ? 'text-sm' : 'text-lg'}`}>{job.company}</p>
                </div>
              </div>
              <div className={`flex flex-wrap gap-4 text-sm text-muted-foreground transition-all duration-300 ${activeTab === 'apply' ? 'h-0 opacity-0 overflow-hidden' : 'opacity-100'}`}>
                <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                {job.url && job.url !== '#' && (
                   <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full">
                      <Globe className="h-4 w-4" />
                      <a href={job.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                        View Original Posting
                      </a>
                   </div>
                )}
              </div>
            </SheetHeader>

            <Tabs value={activeTab} onValueChange={(val) => {
              setActiveTab(val);
            }} className="w-full">
              <TabsList className="hidden">
                <TabsTrigger value="apply">Quick Apply</TabsTrigger>
              </TabsList>
              

              
              <TabsContent value="apply" className="mt-0 flex-1 flex flex-col focus-visible:outline-none focus-visible:ring-0 -mx-6 md:-mx-8 h-[calc(100vh-200px)]">
                {(() => {
                  const isIframeable = job.platform === 'lever' || 
                                      job.platform === 'greenhouse' || 
                                      job.apply_url?.includes('lever.co') || 
                                      job.apply_url?.includes('greenhouse.io');

                  if (job.source === "employer") {
                    return (
                      <div className="flex flex-col items-center justify-center h-full p-12 bg-secondary/5 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                          <Send className="h-10 w-10 text-accent" />
                        </div>
                        <div className="text-center space-y-2 max-w-lg">
                          <h3 className="text-xl font-bold">Employer quick apply</h3>
                          <p className="text-muted-foreground">
                            Apply directly inside JOBAI. This employer can either accept the normal resume flow or ask for additional details before submission.
                          </p>
                          <div className="rounded-2xl border border-border bg-background p-4 text-left">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Earlier uploaded resumes</p>
                            {resumesLoading ? (
                              <p className="mt-3 text-sm text-muted-foreground">Loading your saved resumes...</p>
                            ) : resumes.length ? (
                              <label className="mt-3 block">
                                <span className="mb-2 block text-sm font-medium text-foreground">Select a resume before continuing</span>
                                <select
                                  value={selectedResumeId}
                                  onChange={(event) => setSelectedResumeId(event.target.value)}
                                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
                                >
                                  {resumes.map((resume) => (
                                    <option key={resume.id} value={resume.id}>
                                      {getResumeLabel(resume)}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ) : (
                              <p className="mt-3 text-sm text-muted-foreground">No uploaded resumes found yet. You can upload one in the next step.</p>
                            )}
                          </div>
                          {job.quick_apply_enabled === false && job.quick_apply_questions?.length ? (
                            <div className="rounded-2xl border border-border bg-background p-4 text-left">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Requested details</p>
                              <ul className="mt-3 space-y-2 text-sm text-foreground">
                                {job.quick_apply_questions.map((question) => (
                                  <li key={question}>{question}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                        <Button
                          className="w-full max-w-xs h-12 text-lg font-bold gap-2 shadow-xl hover:shadow-accent/20 transition-all"
                          onClick={() => setAutoApplyOpen(true)}
                        >
                          Continue with Quick Apply
                        </Button>
                      </div>
                    );
                  }

                  if (!job.apply_url || job.apply_url === '#') {
                    return (
                      <div className="flex flex-col items-center justify-center h-full glass-card border-dashed">
                        <Globe className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground text-center">
                            Sorry, the direct application portal is unavailable for this job.
                        </p>
                      </div>
                    );
                  }

                  if (!isIframeable) {
                    return (
                      <div className="flex flex-col items-center justify-center h-full p-12 bg-secondary/5 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                           <ExternalLink className="h-10 w-10 text-accent" />
                        </div>
                        <div className="text-center space-y-2">
                           <h3 className="text-xl font-bold">Apply on External Site</h3>
                           <p className="text-muted-foreground max-w-xs mx-auto">
                              This application portal doesn't support embedding. Please click below to apply on the company's official website.
                           </p>
                        </div>
                        <Button
                          className="w-full max-w-xs h-12 text-lg font-bold gap-2 shadow-xl hover:shadow-accent/20 transition-all"
                          onClick={() => {
                            window.open(job.apply_url, '_blank');
                            activityService.logActivity({
                              activity_type: 'JOB_APPLY',
                              description: `Redirected to external application for ${job.title}`,
                              metadata: { jobId: job.id, url: job.apply_url }
                            });
                          }}
                        >
                          Continue to Application
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Button>
                        <div className="flex flex-col items-center gap-1 w-full max-w-xs">
                          <div className="relative flex items-center w-full py-2">
                            <div className="flex-1 border-t border-border" />
                            <span className="mx-3 text-xs text-muted-foreground">or let the bot do it</span>
                            <div className="flex-1 border-t border-border" />
                          </div>
                          <ApplyBotButton
                            jobUrl={job.apply_url!}
                            jobTitle={job.title}
                            company={job.company}
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col h-full bg-white relative">
                        {/* Bot apply bar */}
                        <div className="flex items-center gap-3 px-6 py-2 border-b border-border bg-secondary/5 shrink-0">
                          <span className="text-[10px] text-muted-foreground shrink-0">Prefer to auto-fill?</span>
                          <div className="shrink-0">
                            <ApplyBotButton
                              jobUrl={job.apply_url!}
                              jobTitle={job.title}
                              company={job.company}
                            />
                          </div>
                        </div>
                        {/* Sub-header inside the apply view */}
                        <div className="flex items-center justify-between px-6 py-2 border-b border-border bg-white z-10 shrink-0">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                Live Portal
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                  {new URL(job.apply_url!).hostname}
                              </span>
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-[10px] gap-1 hover:bg-secondary/50"
                                  onClick={() => window.open(job.apply_url!, '_blank')}
                              >
                                  <ExternalLink className="h-3 w-3" />
                                  Open External
                              </Button>
                            </div>
                        </div>
                        
                        <div className="flex-1 w-full relative overflow-hidden bg-white">
                            {isIframeLoading && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20">
                                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
                                  <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Application Form...</p>
                              </div>
                            )}
                            <iframe 
                              key={job.id}
                              src={job.apply_url?.includes('lever.co') && !job.apply_url.includes('embed=true') 
                                  ? `${job.apply_url}${job.apply_url.includes('?') ? '&' : '?'}embed=true` 
                                  : job.apply_url} 
                              className="w-full h-full border-0 absolute inset-0 bg-white"
                              title={`Apply for ${job.title} at ${job.company}`}
                              onLoad={() => setIsIframeLoading(false)}
                            />
                        </div>
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
      <AutoApplyModal
        job={{
          id: String(job.id),
          title: job.title,
          company: job.company,
          isDemoJob: job.isDemoJob,
          source: job.source,
          quick_apply_enabled: job.quick_apply_enabled,
          quick_apply_questions: job.quick_apply_questions,
        }}
        open={autoApplyOpen}
        onClose={() => setAutoApplyOpen(false)}
        onSuccess={() => onOpenChange(false)} // Close the sheet on success
        initialSelectedResumeId={selectedResumeId}
      />
    </Sheet>
  );
}
