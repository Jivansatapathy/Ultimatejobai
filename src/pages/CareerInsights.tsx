import { motion } from "framer-motion";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import {
  Target,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Users,
  Award,
  Sparkles,
  Calendar,
  Edit3,
  RefreshCw,
  Loader2,
  FileText,
  ChevronRight,
  History,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useResume } from "@/hooks/useResume";
import { searchJobs, Job } from "@/services/jobService";
import { activityService } from "@/services/activityService";
import { careerService, CareerProfile, JobMatch, UserScore, CareerRoadmap, JobFair } from "@/services/careerService";

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
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const navigate = useNavigate();


  useEffect(() => {
    const nextTab = searchParams.get("tab") || "skills";
    if (nextTab === "ai-insights") {
      navigate("/hizorex-os");
      return;
    }
    setActiveTab(nextTab);
  }, [searchParams, navigate]);

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
        const [profileData, matchesData, scoreData, roadmapData] = await Promise.all([
          careerService.getProfile(),
          careerService.getJobMatches(),
          careerService.getUserScore(),
          careerService.getRoadmap(),
        ]);

        setProfile(profileData);
        setBackendMatches(matchesData);
        setUserScore(scoreData);
        setBackendRoadmap(roadmapData);

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

      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        <Navbar />


        <main className="pt-24 pb-12 px-4 md:px-6 relative z-10">
          <div className="container mx-auto max-w-7xl">

            {/* ── Landing picker ─────────────────────────────────────────── */}
            {showLanding && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-[70vh] flex flex-col items-center justify-center py-16"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-teal-600 mb-8">
                  <Sparkles className="h-3.5 w-3.5" /> AI Strategist
                </div>
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-center mb-6 text-gray-900 uppercase">
                  Career Intelligence
                </h1>

                <p className="text-gray-500 text-center max-w-md mb-14 leading-relaxed">
                  Pick a section to get started. You can switch between them anytime from the top tabs.
                </p>

                <div className="grid sm:grid-cols-3 gap-4 w-full max-w-3xl">
                  {[
                    {
                      tab: "ai-insights",
                      icon: Sparkles,
                      label: "AI Insights",
                      sub: "Career planner, move analyzer & strategic advice",
                      accent: "border-teal-200 hover:border-teal-400 hover:bg-teal-50",
                      iconCls: "text-teal-600 bg-teal-50 border-teal-200",
                    },
                    {
                      tab: "fairs",
                      icon: Calendar,
                      label: "Job Fairs",
                      sub: "Browse upcoming career fairs filtered by location",
                      accent: "border-sky-200 hover:border-sky-400 hover:bg-sky-50",
                      iconCls: "text-sky-600 bg-sky-50 border-sky-200",
                    },
                    {
                      tab: "negotiate",
                      icon: DollarSign,
                      label: "Salary Negotiator",
                      sub: "Train live negotiations against an AI employer",
                      accent: "border-orange-200 hover:border-orange-400 hover:bg-orange-50",
                      iconCls: "text-orange-600 bg-orange-50 border-orange-200",
                    },
                  ].map(({ tab, icon: Icon, label, sub, accent, iconCls }, i) => (
                    <motion.button
                      key={tab}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => {
                        if (tab === "ai-insights") {
                          navigate("/hizorex-os");
                          return;
                        }
                        setActiveTab(tab);
                        setShowLanding(false);
                        setSearchParams((p) => { const n = new URLSearchParams(p); n.set("tab", tab); return n; });
                      }}
                      className={`group flex flex-col items-start text-left rounded-[28px] border bg-white p-4 sm:p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-md shadow-sm ${accent}`}
                    >
                      <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-[20px] border ${iconCls} transition-transform group-hover:scale-110 duration-500`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tight tracking-widest">{label}</h3>
                      <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">{sub}</p>
                      <div className="mt-auto flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-teal-600 transition-colors">
                        Launch Section <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center md:text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 mb-5">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  <span className="text-[11px] font-semibold tracking-widest text-teal-600 uppercase">AI-Powered Strategy</span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-4 leading-[1.1]">
                  Career Velocity
                </h1>
                <p className="text-base md:text-lg text-gray-500 max-w-xl leading-relaxed">
                  Engineered to bridge elite skill gaps and optimize your path to leadership with high-precision AI diagnostics.
                </p>

              </motion.div>
            </div>

            <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              {/* Sidebar Stats */}
              <div className="lg:col-span-2 space-y-6">
                <div className="border border-gray-200 bg-white rounded-[28px] p-4 overflow-hidden hover:border-teal-400 transition-all shadow-sm">
                  <div className="pb-2 px-2 pt-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-gray-500">
                      <Target className="h-4 w-4 text-teal-500" />
                      Readiness Engine
                    </p>
                  </div>
                  <div className="px-2 pb-2">
                    <div className="text-5xl font-black mb-6 text-gray-900 tracking-tighter">
                      {Math.round(Math.max(score, userScore?.overall_score || 0))}<span className="text-2xl text-teal-500">%</span>
                    </div>

                    <Progress value={Math.max(score, userScore?.overall_score || 0)} className="h-2 bg-gray-200 [&>div]:bg-teal-500" />
                    <p className="text-xs text-gray-500 mt-4">
                      {Math.max(score, userScore?.overall_score || 0) > 80 ? "Match is strong for target roles." : "Improve your resume to increase match score."}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      onClick={handleStartAnalysis}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      Refresh Analysis
                    </Button>
                  </div>
                </div>

                <div className="border border-gray-200 bg-white rounded-[28px] p-4 overflow-hidden hover:border-teal-400 transition-all shadow-sm">
                  <div className="pb-2 px-2 pt-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-gray-500">
                      <Zap className="h-4 w-4 text-teal-500" />
                      Strategic Focus
                    </p>
                  </div>

                  <div className="px-2 pb-2 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Resume Score</span>
                      <span className={`font-semibold ${Math.max(score, userScore?.resume_score || 0) > 80 ? 'text-emerald-600' : 'text-teal-600'}`}>
                        {Math.round(Math.max(score, userScore?.resume_score || 0))}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Interview Score</span>
                      <span className={`font-semibold ${userScore && userScore.interview_score > 70 ? 'text-emerald-600' : 'text-teal-600'}`}>
                        {userScore ? Math.round(userScore.interview_score) : 0}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Target Role</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-teal-600 hover:text-teal-700 hover:bg-teal-50 gap-1 font-bold"
                          onClick={() => {
                            const newRole = prompt("Enter your new target role:", activeResume?.targetJobRole || "");
                            if (newRole !== null) {
                              updateTargetJobRole(newRole);
                              setGapAnalysis(null);
                            }
                          }}
                        >
                          {activeResume?.targetJobRole || 'Set Role'}
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-8 rounded-[28px] bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-xl shadow-teal-500/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Zap className="h-24 w-24" />
                  </div>
                  <h3 className="font-black text-xl mb-3 uppercase tracking-tight">Mastery Lab</h3>
                  <p className="text-sm font-medium opacity-90 mb-8 leading-relaxed">
                    Pressure-test your career strategy with real-time adaptive AI simulations.
                  </p>
                  <Link to="/interview">
                    <Button className="w-full bg-white text-teal-600 hover:bg-white/90 font-black uppercase tracking-widest text-[11px] h-12 rounded-xl border-none">
                      Launch Simulation
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
                    if (value === "ai-insights") {
                      navigate("/hizorex-os");
                      return;
                    }
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
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors shrink-0"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Menu
                    </button>
                    <div className="h-4 w-px bg-gray-200" />
                  </div>

                  <div className="mb-6" data-tour="mentor-tabs">
                    <TabsList className="bg-gray-100 border border-gray-200 p-1 w-full grid grid-cols-3 h-auto rounded-xl">
                      <TabsTrigger
                        value="ai-insights"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 hover:text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all"
                      >
                        <Sparkles className="h-4 w-4" />
                        AI Insights
                      </TabsTrigger>
                      <TabsTrigger
                        value="fairs"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 hover:text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all"
                      >
                        <Calendar className="h-4 w-4" />
                        Job Fairs
                        {jobFairs.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-teal-500 text-white text-[10px] font-bold">
                            {jobFairs.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="negotiate"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 hover:text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all"
                      >
                        <DollarSign className="h-4 w-4" />
                        Negotiate
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="fairs" className="space-y-6" data-tour="mentor-fairs">
                    <div className="grid gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            Upcoming Job Fairs
                            {jobFairs.length > 0 && (
                              <span className="text-teal-600 ml-2 opacity-70">
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
                          <p className="text-gray-500">Networking events and career expos in your region.</p>
                        </div>
                        <button
                          type="button"
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
                          className="flex items-center h-9 px-3 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {isLoadingFairs ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                          Refresh
                        </button>
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
                                className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-900 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all appearance-none cursor-pointer"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
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
                          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                          <p className="text-gray-500">Fetching latest job fair events...</p>
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
                                className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-teal-400 transition-all group flex flex-col justify-between shadow-sm"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 text-[10px] font-bold uppercase tracking-wider">
                                      {fair.source || 'General'}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {fair.date_text || 'Date TBA'}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-bold mb-1 text-gray-900 group-hover:text-teal-600 transition-colors">{fair.title}</h3>
                                  <p className="text-sm text-gray-500 mb-4 flex items-start gap-1">
                                    <Users className="h-4 w-4 shrink-0 mt-0.5" />
                                    {fair.location || fair.city || 'Online/Virtual'}
                                  </p>
                                </div>
                                {fair.link ? (
                                  <a
                                    href={fair.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 h-9 rounded-lg border border-teal-200 bg-teal-50 text-teal-700 text-sm font-medium hover:bg-teal-100 transition-colors"
                                  >
                                    View Event Details
                                    <ArrowRight className="h-4 w-4" />
                                  </a>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="w-full h-9 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-sm font-medium cursor-not-allowed"
                                  >
                                    No Link Available
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-xl font-bold mb-2 text-gray-900">
                              {jobFairs.length === 0 ? "No Events Found" : "No Results Match Your Filters"}
                            </h3>
                            <p className="text-gray-500">
                              {jobFairs.length === 0
                                ? "Check back later for upcoming job fairs and recruitment events."
                                : "Try adjusting the country, state, or city filters."}
                            </p>
                            {jobFairs.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setFairFilters({ country: "", state: "", city: "" })}
                                className="mt-4 text-sm text-teal-600 hover:underline"
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
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-8">
                      <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600 mb-5">
                          <DollarSign className="h-3 w-3" /> AI Salary Negotiator
                        </div>
                        <h2 className="text-2xl font-black tracking-tight mb-3 text-gray-900">Train your negotiation before the real thing</h2>
                        <p className="text-gray-500 leading-relaxed mb-6">
                          Practice live salary negotiations against an AI employer. Choose a scenario — entry offer, promotion, or executive comp — and get scored on confidence, strategy, and outcome.
                        </p>
                        <ul className="space-y-2 mb-8">
                          {[
                            "3 realistic scenarios from entry-level to executive",
                            "Live back-and-forth with an AI hiring manager",
                            "Real-time response coaching & validation",
                            "Performance score + AI coach feedback at the end",
                          ].map(item => (
                            <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        <Link to="/salary-negotiator">
                          <Button className="h-11 px-8 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl">
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

    </>
  );
}
