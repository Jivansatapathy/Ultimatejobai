import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import {
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  BookOpen,
  Users,
  Award,
  Sparkles,
  Calendar,
  Edit3,
  RefreshCw,
  Loader2,
  Send,
  FileText,
  ChevronRight,
  History,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useResume } from "@/hooks/useResume";
import { searchJobs, Job } from "@/services/jobService";
import { getCareerAdvice } from "@/services/aiService";
import { activityService } from "@/services/activityService";
import { careerService, CareerProfile, JobMatch, UserScore, CareerRoadmap, JobFair } from "@/services/careerService";
import { AutoApplyModal } from "@/components/jobs/AutoApplyModal";

export default function CareerInsights() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "ai-insights");
  const [showLanding, setShowLanding] = useState(!searchParams.get("tab"));
  const { resumes, activeResume, loadResume, updateTargetJobRole, optimizeWithAI } = useResume();
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [backendMatches, setBackendMatches] = useState<JobMatch[]>([]);
  const [jobFairs, setJobFairs] = useState<JobFair[]>([]);
  const [fairFilters, setFairFilters] = useState({ country: "", state: "", city: "" });
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingFairs, setIsLoadingFairs] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [backendRoadmap, setBackendRoadmap] = useState<CareerRoadmap | null>(null);
  const [offerText, setOfferText] = useState("");
  const [advice, setAdvice] = useState("");
  const [isAdvising, setIsAdvising] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [autoApplyJob, setAutoApplyJob] = useState<Job | null>(null);
  const [autoApplyOpen, setAutoApplyOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const nextTab = searchParams.get("tab") || "skills";
    setActiveTab(nextTab);
  }, [searchParams]);

  // Auto-fetch/select first resume if none active
  useEffect(() => {
    if (!activeResume && resumes.length > 0) {
      loadResume(resumes[0].id);
    }
  }, [activeResume, resumes, loadResume]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingJobs(true);
      setIsLoadingFairs(true);

      // Fetch Job Fairs independently (Public data)
      careerService.getJobFairs().then(data => {
        setJobFairs(data);
        setIsLoadingFairs(false);
      }).catch(err => {
        console.error("Fairs load error:", err);
        setIsLoadingFairs(false);
      });

      // Fetch Authenticated Data
      try {
        const [profileData, matchesData, scoreData, roadmapData, advicesData] = await Promise.all([
          careerService.getProfile(),
          careerService.getJobMatches(),
          careerService.getUserScore(),
          careerService.getRoadmap(),
          careerService.getAdvices()
        ]);

        setProfile(profileData);
        setBackendMatches(matchesData);
        setUserScore(scoreData);
        setBackendRoadmap(roadmapData);

        if (advicesData.length > 0) {
          setAdvice(advicesData[0].advice);
        }

        const mapped: Job[] = matchesData.map(m => ({
          id: m.id,
          title: m.job_details.title,
          company: m.job_details.company || 'Unknown',
          location: m.job_details.location || 'Remote',
          match: m.match_percentage,
          posted: m.job_details.posted || 'Recently',
          tags: m.matched_skills,
          saved: false,
          hasEmail: m.job_details.hasEmail || false,
          apply_url: m.job_details.apply_url
        }));

        // Prioritize target job role search for direct relevance
        if (activeResume?.targetJobRole) {
          const resp = await searchJobs(activeResume.targetJobRole);
          if (resp.jobs.length > 0) {
            setRecommendedJobs(resp.jobs.slice(0, 10)); // Show more
          }
        } else if (mapped.length > 0) {
          setRecommendedJobs(mapped.slice(0, 5));
        }
      } catch (error) {
        console.error("Authenticated data load error:", error);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    loadData();
  }, [activeResume?.targetJobRole]);

  const handleStartAnalysis = async () => {
    if (!activeResume) return;

    setIsAnalyzing(true);
    try {
      // 1. Local AI Optimization (Groq Deep Analysis)
      await optimizeWithAI();

      // 2. Perform Gap Analysis (Groq Gap Analysis)
      const { performGapAnalysis } = await import("@/services/aiService");
      const gapResult = await performGapAnalysis(
        activeResume,
        activeResume.targetJobRole || "Software Engineer",
        activeResume.targetJobDescription || "",
        "5" // Default experience years
      );
      setGapAnalysis(gapResult);

      // 3. Sync with Backend
      await careerService.updateProfile({
        skills: activeResume.skills,
        target_roles: [activeResume.targetJobRole].filter(Boolean) as string[],
      });

      // Refresh matches and score
      const [matchesData, scoreData] = await Promise.all([
        careerService.getJobMatches(),
        careerService.getUserScore()
      ]);
      setBackendMatches(matchesData);
      setUserScore(scoreData);

      activityService.logActivity({
        activity_type: 'CAREER_INSIGHT',
        description: `Analyzed career insights for role: ${activeResume.targetJobRole || 'Not specified'}`,
        metadata: { score: activeResume.score }
      });
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scheduleInterview = (type: "text" | "audio") => {
    navigate("/interview", {
      state: {
        mode: type,
        jobDescription: activeResume?.targetJobDescription || "",
        interviewType: "technical" // Default
      }
    });
    activityService.logActivity({
      activity_type: 'INTERVIEW',
      description: `Scheduled ${type} interview practice`,
      metadata: { mode: type }
    });
  };

  const handleGetAdvice = async () => {
    if (!offerText.trim()) return;
    setIsAdvising(true);
    try {
      const resumeContent = JSON.stringify(activeResume);
      const resp = await getCareerAdvice(offerText, resumeContent);
      setAdvice(resp);

      // Save advice to backend
      await careerService.createAdvice(offerText, resp);

      activityService.logActivity({
        activity_type: 'CAREER_ADVICE',
        description: `Requested career advice for an offer/dilemma`,
        metadata: { hasAdvice: !!resp }
      });
    } catch (error) {
      console.error("Advice failed:", error);
    } finally {
      setIsAdvising(false);
    }
  };

  // Helper to ensure we don't render objects
  const stringifyIfObject = (val: any) => {
    if (val === null || val === undefined) return "";
    if (typeof val === 'object') {
      try {
        return val.name || val.title || val.text || JSON.stringify(val);
      } catch (e) { return "[Object]"; }
    }
    return String(val);
  };

  // Derivative data - preferring gapAnalysis state if available
  const score = activeResume?.score || 0;
  const suggestions = activeResume?.suggestions || [];

  const skillGaps = gapAnalysis ?
    gapAnalysis.technicalGaps.map((g: any) => ({
      skill: stringifyIfObject(g.skill),
      importance: g.importance === 'Critical' ? 100 : g.importance === 'High' ? 85 : 60,
      status: "missing",
      difficulty: "Medium"
    })) :
    suggestions
      .filter(s => s.type === 'keyword' && s.text.startsWith("Missing:"))
      .map(s => ({
        skill: s.text.replace("Missing:", "").trim(),
        importance: 85,
        status: "missing",
        difficulty: "Medium"
      }));

  const roadmapSteps = (gapAnalysis?.roadmap?.length > 0) ?
    gapAnalysis.roadmap.map((r: any) => ({
      title: stringifyIfObject(r.step),
      desc: stringifyIfObject(r.action),
      completed: false
    })) : (backendRoadmap?.steps || []);

  const resumeTips = suggestions
    .filter(s => s.type === 'improvement')
    .map(s => ({
      category: "Optimization",
      tip: stringifyIfObject(s.text),
      impact: "High"
    }));

  return (
    <>

      <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
        <Navbar />

        <main className="pt-24 pb-12 px-4 md:px-6">
          <div className="container mx-auto max-w-7xl">

            {/* ── Landing picker ─────────────────────────────────────────── */}
            {showLanding && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-[70vh] flex flex-col items-center justify-center py-16"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-accent mb-6">
                  <Sparkles className="h-3.5 w-3.5" /> AI Mentor
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-center mb-4">
                  What do you want to work on?
                </h1>
                <p className="text-muted-foreground text-center max-w-md mb-14 leading-relaxed">
                  Pick a section to get started. You can switch between them anytime from the top tabs.
                </p>

                <div className="grid sm:grid-cols-3 gap-4 w-full max-w-3xl">
                  {[
                    {
                      tab: "ai-insights",
                      icon: Sparkles,
                      label: "AI Insights",
                      sub: "Career planner, move analyzer & strategic advice",
                      accent: "border-accent/30 hover:border-accent/60 hover:bg-accent/5",
                      iconCls: "text-accent bg-accent/10 border-accent/20",
                    },
                    {
                      tab: "fairs",
                      icon: Calendar,
                      label: "Job Fairs",
                      sub: "Browse upcoming career fairs filtered by location",
                      accent: "border-sky-500/30 hover:border-sky-500/60 hover:bg-sky-500/5",
                      iconCls: "text-sky-400 bg-sky-500/10 border-sky-500/20",
                    },
                    {
                      tab: "negotiate",
                      icon: DollarSign,
                      label: "Salary Negotiator",
                      sub: "Train live negotiations against an AI employer",
                      accent: "border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-500/5",
                      iconCls: "text-orange-400 bg-orange-500/10 border-orange-500/20",
                    },
                  ].map(({ tab, icon: Icon, label, sub, accent, iconCls }, i) => (
                    <motion.button
                      key={tab}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => {
                        setActiveTab(tab);
                        setShowLanding(false);
                        setSearchParams((p) => { const n = new URLSearchParams(p); n.set("tab", tab); return n; });
                      }}
                      className={`group flex flex-col items-start text-left rounded-2xl border bg-secondary/10 p-6 transition-all duration-200 ${accent}`}
                    >
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${iconCls}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-black text-foreground mb-1">{label}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{sub}</p>
                      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                        Open <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Main content (hidden while landing is shown) ───────────── */}
            <div className={showLanding ? "hidden" : ""}>

            {/* Hero Section */}
            <div className="relative mb-12">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center md:text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent">AI-Powered Strategy</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                  Unlock Your Next Career Move
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Get personalized insights, bridge your skill gaps, and optimize your path to leadership roles with our AI career strategist.
                </p>
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Sidebar Stats */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-accent/10 bg-secondary/30 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-accent" />
                      Market Readiness
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">
                      {Math.round(Math.max(score, userScore?.overall_score || 0))}%
                    </div>
                    <Progress value={Math.max(score, userScore?.overall_score || 0)} className="h-2 bg-secondary" />
                    <p className="text-xs text-muted-foreground mt-4">
                      {Math.max(score, userScore?.overall_score || 0) > 80 ? "Match is strong for target roles." : "Improve your resume to increase match score."}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 gap-2"
                      onClick={handleStartAnalysis}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      Refresh Analysis
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-accent/10 bg-secondary/30 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-accent" />
                      Focus Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Resume Score</span>
                      <span className={`font-semibold ${Math.max(score, userScore?.resume_score || 0) > 80 ? 'text-success' : 'text-accent'}`}>
                        {Math.round(Math.max(score, userScore?.resume_score || 0))}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Interview Score</span>
                      <span className={`font-semibold ${userScore && userScore.interview_score > 70 ? 'text-success' : 'text-accent'}`}>
                        {userScore ? Math.round(userScore.interview_score) : 0}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Target Role</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-success hover:text-success hover:bg-success/10 gap-1 font-bold"
                          onClick={() => {
                            const newRole = prompt("Enter your new target role:", activeResume?.targetJobRole || "");
                            if (newRole !== null) {
                              updateTargetJobRole(newRole);
                              setGapAnalysis(null); // Clear previous analysis to suggest refresh
                            }
                          }}
                        >
                          {activeResume?.targetJobRole || 'Set Role'}
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-accent to-accent/80 text-accent-foreground shadow-lg shadow-accent/20">
                  <h3 className="font-bold text-lg mb-2">Practice for Mastery</h3>
                  <p className="text-sm opacity-90 mb-6">
                    Ready to test your knowledge? Schedule a mock interview today.
                  </p>
                  <Link to="/interview">
                    <Button className="w-full bg-white text-accent hover:bg-white/90 font-bold">
                      Start Mock Session
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Main Content Areas */}
              <div className="lg:col-span-3 lg:col-start-3">
                <Tabs
                  defaultValue="ai-insights"
                  value={activeTab}
                  onValueChange={(value) => {
                    setActiveTab(value);
                    setSearchParams((current) => {
                      const next = new URLSearchParams(current);
                      next.set("tab", value);
                      return next;
                    });
                  }}
                  className="w-full"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setShowLanding(true)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Menu
                    </button>
                    <div className="h-4 w-px bg-border" />
                  </div>

                  <div className="mb-6">
                    <TabsList className="bg-secondary/50 p-1 w-full grid grid-cols-3">
                      <TabsTrigger value="ai-insights" className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold">
                        <Sparkles className="h-4 w-4" />
                        AI Insights
                      </TabsTrigger>
                      <TabsTrigger value="fairs" className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold">
                        <Calendar className="h-4 w-4" />
                        Job Fairs
                        {jobFairs.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-accent text-white text-[10px] font-bold">
                            {jobFairs.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="negotiate" className="flex items-center justify-center gap-2 py-2.5 text-sm font-semibold">
                        <DollarSign className="h-4 w-4" />
                        Negotiate
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="ai-insights" className="space-y-5">

                    {/* Career Strategic Planner — hero card */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-6"
                    >
                      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
                      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/15">
                          <TrendingUp className="h-7 w-7 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-1">AI-Powered</p>
                          <h3 className="text-xl font-black text-foreground tracking-tight">Career Strategic Planner</h3>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            Chat with your AI career advisor to build a concrete 12–24 month roadmap tailored to your goals.
                          </p>
                        </div>
                        <Button
                          onClick={() => navigate("/career-planner")}
                          className="shrink-0 gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-6 h-11 rounded-xl"
                        >
                          <BookOpen className="h-4 w-4" />
                          Start Session
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>

                    {/* Strategic Career Advisor — offer analysis */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.07 }}
                      className="rounded-2xl border border-white/[0.08] bg-secondary/20 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                          <Sparkles className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold leading-tight">Career Move Analyzer</h3>
                          <p className="text-xs text-muted-foreground">Paste an offer or dilemma — AI weighs the pros, cons, and fit</p>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <textarea
                          placeholder="Paste your offer letter, company details, or describe your career dilemma here…"
                          className="w-full min-h-[120px] p-4 rounded-xl bg-background/50 border border-white/10 focus:border-accent/40 focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none text-sm leading-relaxed placeholder:text-muted-foreground/50"
                          value={offerText}
                          onChange={(e) => setOfferText(e.target.value)}
                        />
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-muted-foreground/60">Your resume profile is used as context automatically.</p>
                          <Button
                            onClick={handleGetAdvice}
                            disabled={isAdvising || !offerText.trim()}
                            className="gap-2 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl h-9 px-5 text-sm"
                          >
                            {isAdvising ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            Analyze
                          </Button>
                        </div>
                      </div>

                      {advice && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mx-5 mb-5 rounded-xl border border-accent/20 bg-accent/5 overflow-hidden"
                        >
                          <div className="flex items-center gap-2 px-4 py-3 border-b border-accent/10 bg-accent/5">
                            <Lightbulb className="h-4 w-4 text-accent shrink-0" />
                            <p className="text-xs font-bold text-accent uppercase tracking-wider">AI Analysis</p>
                          </div>
                          <div className="px-4 py-4 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {advice}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>

                  </TabsContent>
                  <TabsContent value="fairs" className="space-y-6">
                    <div className="grid gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold">
                            Upcoming Job Fairs
                            {jobFairs.length > 0 && (
                              <span className="text-accent ml-2 opacity-70">
                                ({(() => {
                                  const f = fairFilters;
                                  return jobFairs.filter(fair => {
                                    const loc = (fair.location || "").toLowerCase();
                                    return (
                                      (!f.country || (fair.country || "").toLowerCase().includes(f.country.toLowerCase())) &&
                                      (!f.state || loc.includes(f.state.toLowerCase())) &&
                                      (!f.city || (fair.city || "").toLowerCase().includes(f.city.toLowerCase()) || loc.includes(f.city.toLowerCase()))
                                    );
                                  }).length;
                                })()})
                              </span>
                            )}
                          </h2>
                          <p className="text-muted-foreground">Networking events and career expos in your region.</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isLoadingFairs}
                          onClick={async () => {
                            setIsLoadingFairs(true);
                            try {
                              const data = await careerService.getJobFairs();
                              setJobFairs(data);
                            } finally {
                              setIsLoadingFairs(false);
                            }
                          }}
                        >
                          {isLoadingFairs ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                          Refresh
                        </Button>
                      </div>

                      {/* Filters */}
                      {jobFairs.length > 0 && (() => {
                        const countries = [...new Set(jobFairs.map(f => f.country).filter(Boolean))].sort();
                        const cities = [...new Set(jobFairs.map(f => f.city).filter(Boolean))].sort();
                        const states = [...new Set(
                          jobFairs.map(f => {
                            const parts = (f.location || "").split(",");
                            return parts.length >= 2 ? parts[parts.length - 2].trim() : "";
                          }).filter(Boolean)
                        )].sort();
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {([
                              { field: "country" as const, label: "Country", options: countries },
                              { field: "state" as const, label: "State / Region", options: states },
                              { field: "city" as const, label: "City", options: cities },
                            ]).map(({ field, label, options }) => (
                              <select
                                key={field}
                                value={fairFilters[field]}
                                onChange={e => setFairFilters(prev => ({ ...prev, [field]: e.target.value }))}
                                className="w-full h-10 rounded-xl border border-white/10 bg-card px-3 pr-8 text-sm text-foreground focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all appearance-none cursor-pointer"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                              >
                                <option value="">All {label}s</option>
                                {options.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ))}
                          </div>
                        );
                      })()}

                      {isLoadingFairs ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                          <Loader2 className="h-8 w-8 animate-spin text-accent" />
                          <p className="text-muted-foreground">Fetching latest job fair events...</p>
                        </div>
                      ) : (() => {
                        const f = fairFilters;
                        const filtered = jobFairs.filter(fair => {
                          const loc = (fair.location || "").toLowerCase();
                          return (
                            (!f.country || (fair.country || "").toLowerCase().includes(f.country.toLowerCase())) &&
                            (!f.state || loc.includes(f.state.toLowerCase())) &&
                            (!f.city || (fair.city || "").toLowerCase().includes(f.city.toLowerCase()) || loc.includes(f.city.toLowerCase()))
                          );
                        });
                        return filtered.length > 0 ? (
                          <div className="grid md:grid-cols-2 gap-4">
                            {filtered.map((fair, idx) => (
                              <div
                                key={fair.id || `fair-${idx}`}
                                className="p-5 rounded-2xl bg-secondary/20 border border-white/5 hover:border-accent/30 transition-all group flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider">
                                      {fair.source || 'General'}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {fair.date_text || 'Date TBA'}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-bold mb-1 group-hover:text-accent transition-colors">{fair.title}</h3>
                                  <p className="text-sm text-muted-foreground mb-4 flex items-start gap-1">
                                    <Users className="h-4 w-4 shrink-0 mt-0.5" />
                                    {fair.location || fair.city || 'Online/Virtual'}
                                  </p>
                                </div>
                                <Button className="w-full gap-2" variant="secondary" asChild>
                                  <a href={fair.link} target="_blank" rel="noopener noreferrer">
                                    View Event Details
                                    <ArrowRight className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-20 text-center bg-secondary/10 rounded-3xl border border-dashed border-white/10">
                            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-bold mb-2">
                              {jobFairs.length === 0 ? "No Events Found" : "No Results Match Your Filters"}
                            </h3>
                            <p className="text-muted-foreground">
                              {jobFairs.length === 0
                                ? "Check back later for upcoming job fairs and recruitment events."
                                : "Try adjusting the country, state, or city filters."}
                            </p>
                            {jobFairs.length > 0 && (
                              <button
                                onClick={() => setFairFilters({ country: "", state: "", city: "" })}
                                className="mt-4 text-sm text-accent hover:underline"
                              >
                                Clear all filters
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </TabsContent>

                  <TabsContent value="negotiate" className="space-y-6">
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0f] p-8 text-white">
                      <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400 mb-5">
                          <DollarSign className="h-3 w-3" /> AI Salary Negotiator
                        </div>
                        <h2 className="text-2xl font-black tracking-tight mb-3">Train your negotiation before the real thing</h2>
                        <p className="text-slate-400 leading-relaxed mb-6">
                          Practice live salary negotiations against an AI employer. Choose a scenario — entry offer, promotion, or executive comp — and get scored on confidence, strategy, and outcome.
                        </p>
                        <ul className="space-y-2 mb-8">
                          {[
                            "3 realistic scenarios from entry-level to executive",
                            "Live back-and-forth with an AI hiring manager",
                            "Real-time response coaching & validation",
                            "Performance score + AI coach feedback at the end",
                          ].map(item => (
                            <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                              <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <Link to="/salary-negotiator">
                          <Button className="h-11 px-8 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl">
                            Start Negotiating <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            </div> {/* end showLanding hidden wrapper */}
          </div>
        </main>
      </div>

      <AutoApplyModal
        job={autoApplyJob ? { id: String(autoApplyJob.id), title: autoApplyJob.title, company: autoApplyJob.company } : null}
        open={autoApplyOpen}
        onClose={() => { setAutoApplyOpen(false); setAutoApplyJob(null); }}
      />
    </>
  );
}
