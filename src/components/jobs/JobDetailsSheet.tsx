import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Job, fetchLeverJobDetails, LeverJobDetails } from "@/services/jobService";
import { Building2, MapPin, Globe, ArrowLeft, Send, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { activityService } from "@/services/activityService";

interface JobDetailsSheetProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetailsSheet({ job, open, onOpenChange }: JobDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState<string>("description");
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [leverDetails, setLeverDetails] = useState<LeverJobDetails | null>(null);
  const [isLoadingLever, setIsLoadingLever] = useState(false);

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
  if (!job) return null;

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
              if (val === 'apply' && job) {
                activityService.logActivity({
                  activity_type: 'JOB_APPLY',
                  description: `Initiated application for ${job.title} at ${job.company}`,
                  metadata: { jobId: job.id, company: job.company, title: job.title }
                });
              }
            }} className="w-full">
              <TabsList className={`grid w-full grid-cols-2 h-12 transition-all duration-300 ${activeTab === 'apply' ? 'mb-4 px-6 md:px-8' : 'mb-8'}`}>
                <TabsTrigger value="description" className="text-base py-2">Job Description</TabsTrigger>
                <TabsTrigger value="apply" className="text-base py-2 gap-2">
                    <Send className="h-4 w-4" />
                    Quick Apply
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="glass-card p-6 bg-secondary/5">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                    {/* Debug Info */}
                    {(job as any).debug && (
                      <div className="mb-4 p-2 bg-accent/20 rounded text-[10px] font-mono">
                        Source: {job.platform} | Desc Len: {job.description?.length || 0}
                      </div>
                    )}

                    {isLoadingLever ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-4 text-accent" />
                            <p className="text-sm font-medium animate-pulse">Fetching official job details...</p>
                        </div>
                    ) : leverDetails ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Rich Badge for Direct Data */}
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 w-fit mb-6">
                                <Sparkles className="h-3 w-3 text-accent" />
                                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Direct API Source</span>
                            </div>

                            {/* Lever HTML Description */}
                            <div 
                                className="text-foreground/90 leading-relaxed text-base job-html-content"
                                dangerouslySetInnerHTML={{ __html: leverDetails.descriptionHtml }} 
                            />

                            {/* Lever Structured Lists (Responsibilities, Requirements, etc.) */}
                            {leverDetails.lists?.map((list, idx) => (
                                <div key={idx} className="space-y-4 pt-4">
                                    <h3 className="text-xl font-bold text-foreground border-l-4 border-accent pl-4">{list.text}</h3>
                                    <div 
                                        className="text-foreground/80 leading-relaxed pl-5 list-content-html"
                                        dangerouslySetInnerHTML={{ __html: list.content }}
                                    />
                                </div>
                            ))}

                            {/* Additional Information */}
                            {leverDetails.additionalHtml && (
                                <div className="pt-8 border-t border-border/50">
                                    <h3 className="text-lg font-semibold mb-4 text-muted-foreground italic">Additional Information</h3>
                                    <div 
                                        className="text-foreground/70 text-sm leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: leverDetails.additionalHtml }}
                                    />
                                </div>
                            )}
                        </div>
                    ) : job.description ? (
                        job.description.includes('<') ? (
                          <div 
                            className="text-foreground/80 leading-relaxed text-base job-html-content"
                            dangerouslySetInnerHTML={{ __html: job.description }} 
                          />
                        ) : (
                          job.description.split('\n').map((line, i) => (
                            <p key={i} className="mb-4 text-foreground/80 leading-relaxed text-base">
                                {line.trim()}
                            </p>
                          ))
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Building2 className="h-12 w-12 mb-4 opacity-20" />
                            <p className="italic">No description provided for this position.</p>
                        </div>
                    )}
                    </div>
                </div>
              </TabsContent>
              
              <TabsContent value="apply" className="mt-0 flex-1 flex flex-col focus-visible:outline-none focus-visible:ring-0 -mx-6 md:-mx-8 h-[calc(100vh-200px)]">
                {(() => {
                  const isIframeable = job.platform === 'lever' || 
                                      job.platform === 'greenhouse' || 
                                      job.apply_url?.includes('lever.co') || 
                                      job.apply_url?.includes('greenhouse.io');
                  
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
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col h-full bg-white relative">
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
    </Sheet>
  );
}
