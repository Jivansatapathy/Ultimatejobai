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
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useResume } from "@/hooks/useResume";
import { searchJobs, Job } from "@/services/jobService";
import { Loader2, RefreshCw, Send, FileText } from "lucide-react";
import { getCareerAdvice } from "@/services/aiService";
import { activityService } from "@/services/activityService";
import { careerService, CareerProfile, JobMatch, UserScore, CareerRoadmap, JobFair } from "@/services/careerService";

export default function CareerInsights() {
  const [activeTab, setActiveTab] = useState("skills");
  const { activeResume, optimizeWithAI } = useResume();
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [backendMatches, setBackendMatches] = useState<JobMatch[]>([]);
  const [jobFairs, setJobFairs] = useState<JobFair[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingFairs, setIsLoadingFairs] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [backendRoadmap, setBackendRoadmap] = useState<CareerRoadmap | null>(null);
  const [offerText, setOfferText] = useState("");
  const [advice, setAdvice] = useState("");
  const [isAdvising, setIsAdvising] = useState(false);
  const navigate = useNavigate();

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
        
        if (mapped.length > 0) {
          setRecommendedJobs(mapped.slice(0, 3));
        } else if (activeResume?.targetJobRole) {
          const resp = await searchJobs(activeResume.targetJobRole);
          setRecommendedJobs(resp.jobs.slice(0, 3));
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
    setIsAnalyzing(true);
    try {
      // 1. Local AI Optimization
      const analysis = await optimizeWithAI();
      
      // 2. Sync with Backend
      if (activeResume) {
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
      }

      activityService.logActivity({
        activity_type: 'CAREER_INSIGHT',
        description: `Analyzed career insights for role: ${activeResume?.targetJobRole || 'Not specified'}`,
        metadata: { score: activeResume?.score }
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

  // Derivative data
  const score = activeResume?.score || 0;
  const suggestions = activeResume?.suggestions || [];
  
  const skillGaps = suggestions
    .filter(s => s.type === 'keyword' && s.text.startsWith("Missing:"))
    .map(s => ({
      skill: s.text.replace("Missing:", "").trim(),
      importance: 85,
      status: "missing",
      difficulty: "Medium"
    }));

  const resumeTips = suggestions
    .filter(s => s.type === 'improvement')
    .map(s => ({
      category: "Optimization",
      tip: s.text,
      impact: "High"
    }));

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      <Navbar />

      <main className="pt-24 pb-12 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
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

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Stats */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-accent/10 bg-secondary/30 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-accent" />
                    Market Readiness
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">
                    {userScore ? Math.round(userScore.overall_score) : score}%
                  </div>
                  <Progress value={userScore ? userScore.overall_score : score} className="h-2 bg-secondary" />
                  <p className="text-xs text-muted-foreground mt-4">
                    {(userScore?.overall_score || score) > 80 ? "Match is strong for target roles." : "Improve your resume to increase match score."}
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
                    <span className={`font-semibold ${userScore && userScore.resume_score > 80 ? 'text-success' : 'text-accent'}`}>
                        {userScore ? Math.round(userScore.resume_score) : score}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Interview Score</span>
                    <span className={`font-semibold ${userScore && userScore.interview_score > 70 ? 'text-success' : 'text-accent'}`}>
                         {userScore ? Math.round(userScore.interview_score) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Target Role</span>
                    <span className="font-semibold text-success">{activeResume?.targetJobRole || 'Not Set'}</span>
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
            <div className="lg:col-span-3">
              <Tabs defaultValue="skills" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-6 overflow-x-auto">
                  <TabsList className="bg-secondary/50 p-1">
                    <TabsTrigger value="skills" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Skill Gaps
                    </TabsTrigger>
                    <TabsTrigger value="resume" className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Resume Ops
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Job Insights
                    </TabsTrigger>
                     <TabsTrigger value="practice" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Plan Practice
                    </TabsTrigger>
                    <TabsTrigger value="advisor" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Career Advisor
                    </TabsTrigger>
                    <TabsTrigger value="fairs" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Job Fairs
                      {jobFairs.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-accent text-white text-[10px] font-bold">
                          {jobFairs.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="skills" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-accent/10 bg-secondary/20">
                      <CardHeader>
                        <CardTitle className="text-lg">Priority Skill Improvements</CardTitle>
                        <CardDescription>Skills required for your target 90+ match jobs.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {skillGaps.length > 0 ? skillGaps.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-white/5">
                            <div className="flex items-center gap-3">
                              {item.status === 'mastered' ? (
                                <CheckCircle2 className="h-5 w-5 text-success" />
                              ) : item.status === 'learning' ? (
                                <div className="h-5 w-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-accent" />
                              )}
                              <div>
                                <p className="font-medium">{item.skill}</p>
                                <p className="text-xs text-muted-foreground">{item.difficulty} Difficulty</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-semibold text-accent">Priority</p>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] mt-1">Learn</Button>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-8 opacity-50">
                            <Target className="h-8 w-8 mx-auto mb-2" />
                            <p>No skill gaps identified yet.</p>
                            <Button size="sm" variant="link" onClick={handleStartAnalysis}>Analyze Resume</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-accent/10 bg-secondary/20">
                      <CardHeader>
                        <CardTitle className="text-lg">Career Roadmap</CardTitle>
                        <CardDescription>Your personalized path to Senior Lead.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-accent/20">
                          {(backendRoadmap?.steps?.length || 0) > 0 ? (backendRoadmap?.steps || []).map((step, idx) => (
                            <div key={idx} className="relative pl-8">
                              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 ${step.completed ? 'bg-accent border-accent' : 'bg-background border-accent/20'} flex items-center justify-center`}>
                                {step.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                              </div>
                              <h4 className={`font-semibold ${step.completed ? 'text-foreground' : 'text-foreground/70'}`}>{step.title}</h4>
                              <p className="text-sm text-muted-foreground">{step.desc}</p>
                            </div>
                          )) : [
                            { title: "Master System Design", desc: "Build a distributed cache system.", completed: false },
                            { title: "Lead a Project", desc: "Successfully manage a team of 3 devs.", completed: true },
                            { title: "AWS Solutions Architect", desc: "Get certified in SAA-C03.", completed: false },
                          ].map((step, idx) => (
                            <div key={idx} className="relative pl-8">
                              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 ${step.completed ? 'bg-accent border-accent' : 'bg-background border-accent/20'} flex items-center justify-center`}>
                                {step.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                              </div>
                              <h4 className={`font-semibold ${step.completed ? 'text-foreground' : 'text-foreground/70'}`}>{step.title}</h4>
                              <p className="text-sm text-muted-foreground">{step.desc}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="resume" className="space-y-6">
                  <div className="grid gap-6">
                    <Card className="border-accent/10 bg-secondary/20">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">AI Resume Auditor</CardTitle>
                          <CardDescription>Specific changes to reach a 95+ ATS score.</CardDescription>
                        </div>
                        <Link to="/resume">
                          <Button size="sm" variant="outline">Edit Resume</Button>
                        </Link>
                      </CardHeader>
                      <CardContent className="grid md:grid-cols-2 gap-4">
                        {resumeTips.length > 0 ? resumeTips.map((tip, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-background/40 border border-white/5 hover:border-accent/20 transition-all group">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold uppercase tracking-widest text-accent">Recommendation</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent`}>
                                AI Insight
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed group-hover:text-foreground transition-colors">{tip.tip}</p>
                          </div>
                        )) : (
                          <div className="col-span-2 text-center py-12 bg-background/20 rounded-2xl border border-dashed border-white/10">
                            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-accent" />
                            <p className="text-sm text-muted-foreground">Run AI analysis to get specific resume improvements.</p>
                            <Button size="sm" className="mt-4" onClick={handleStartAnalysis}>Audit My Resume</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-6 rounded-2xl bg-secondary/20 border border-white/5 flex flex-col items-center text-center">
                        <Award className="h-8 w-8 text-accent mb-3" />
                        <h4 className="font-bold">Credential Boost</h4>
                        <p className="text-xs text-muted-foreground mt-2">Add your Google Cloud Professional cert to increase visibility by 20%.</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-secondary/20 border border-white/5 flex flex-col items-center text-center">
                        <BookOpen className="h-8 w-8 text-accent mb-3" />
                        <h4 className="font-bold">Summary Hook</h4>
                        <p className="text-xs text-muted-foreground mt-2">Rewrite your hook to focus on "High-Scale Distributed Systems".</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-secondary/20 border border-white/5 flex flex-col items-center text-center">
                        <TrendingUp className="h-8 w-8 text-accent mb-3" />
                        <h4 className="font-bold">Score Projection</h4>
                        <p className="text-xs text-muted-foreground mt-2">Complete these 4 tips to jump from 84 to 96 ATS score.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="jobs" className="space-y-6">
                  <div className="grid gap-6">
                    {isLoadingJobs ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4">
                         <Loader2 className="h-8 w-8 animate-spin text-accent" />
                         <p className="text-muted-foreground">Finding the best matches for your profile...</p>
                      </div>
                    ) : recommendedJobs.length > 0 ? recommendedJobs.map((job, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group p-6 rounded-2xl bg-secondary/20 border border-white/5 hover:bg-secondary/30 transition-all flex flex-col md:flex-row items-center gap-6"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary group-hover:scale-110 transition-transform">
                          {job.company[0]}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            <h3 className="text-xl font-bold">{job.title}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold">
                              {job.match}% MATCH
                            </span>
                          </div>
                          <p className="text-muted-foreground font-medium mb-2">{job.company}</p>
                          <p className="text-sm text-muted-foreground max-w-xl">{job.location}</p>
                        </div>
                        <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
                          <Button className="gap-2 group/btn">
                            Quick Apply
                            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </a>
                      </motion.div>
                    )) : (
                       <div className="py-20 text-center">
                         <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                         <h3 className="text-xl font-bold mb-2">No Jobs Found</h3>
                         <p className="text-muted-foreground mb-6">Update your target job role in the resume builder to see recommendations.</p>
                         <Link to="/resume">
                           <Button variant="outline">Set Target Role</Button>
                         </Link>
                       </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="practice" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-accent/10 bg-secondary/20">
                      <CardHeader>
                        <CardTitle className="text-lg">Upcoming Intervals</CardTitle>
                        <CardDescription>Stay sharp with consistent practice.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { title: "System Design Mock", time: "Tomorrow, 2:00 PM", type: "Video" },
                            { title: "Behavioral Drill", time: "Friday, 10:00 AM", type: "Audio" },
                          ].map((session, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-white/5">
                              <div>
                                <h4 className="font-bold">{session.title}</h4>
                                <p className="text-xs text-muted-foreground">{session.time} • {session.type}</p>
                              </div>
                              <Button size="sm" variant="ghost">Reschedule</Button>
                            </div>
                          ))}
                          <Button className="w-full gap-2 mt-4" variant="outline">
                            <Calendar className="h-4 w-4" />
                            Schedule New Session
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-accent/10 bg-secondary/20 overflow-hidden">
                      <div className="h-2 bg-accent" />
                      <CardHeader>
                        <CardTitle className="text-lg">Interview Interfaces</CardTitle>
                        <CardDescription>Select your preferred practice mode.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-3">
                        <button onClick={() => scheduleInterview('audio')} className="w-full text-left">
                          <div className="p-4 rounded-xl bg-background/40 border border-white/5 hover:border-accent/30 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                                <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-bold">Video Interview</h4>
                                <p className="text-xs text-muted-foreground">Real-time facial expression feedback.</p>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                        <button onClick={() => scheduleInterview('text')} className="w-full text-left">
                          <div className="p-4 rounded-xl bg-background/40 border border-white/5 hover:border-accent/30 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                                <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-bold">Text Chat Mode</h4>
                                <p className="text-xs text-muted-foreground">Classic keyboard-based practice.</p>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="advisor" className="space-y-6">
                  <div className="grid gap-6">
                    <Card className="border-accent/10 bg-secondary/20 border-dashed">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                          <Sparkles className="h-5 w-5 text-accent" />
                          Strategic Career Advisor
                        </CardTitle>
                        <CardDescription>
                          Paste an offer letter or job details. Our AI will help you weigh the pros and cons based on your current career trajectory.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <textarea
                          placeholder="Paste your offer letter details, company culture info, or specific career dilemmas here..."
                          className="w-full min-h-[150px] p-4 rounded-xl bg-background/50 border border-white/10 focus:ring-2 focus:ring-accent/50 outline-none transition-all resize-none text-sm leading-relaxed"
                          value={offerText}
                          onChange={(e) => setOfferText(e.target.value)}
                        />
                        <div className="flex justify-end">
                          <Button 
                            className="gap-2" 
                            onClick={handleGetAdvice} 
                            disabled={isAdvising || !offerText.trim()}
                          >
                            {isAdvising ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Analyze Move
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {advice && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="border-accent/30 bg-accent/5">
                          <CardHeader className="border-b border-white/5 bg-accent/5">
                             <div className="flex items-center gap-2">
                               <div className="p-1.5 rounded-lg bg-accent text-white">
                                 <Lightbulb className="h-4 w-4" />
                               </div>
                               <CardTitle className="text-lg">AI Strategic Perspective</CardTitle>
                             </div>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="prose prose-invert prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
                              {advice}
                            </div>
                            <div className="mt-8 p-4 rounded-xl bg-warning/10 border border-warning/20 flex gap-3">
                              <AlertCircle className="h-5 w-5 text-warning shrink-0" />
                              <p className="text-xs text-warning/90 leading-normal">
                                <strong>Note:</strong> This is AI-generated advice based on professional standards and your profile. Always consult with mentors or trusted industry peers for major career decisions.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="fairs" className="space-y-6">
                  <div className="grid gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">
                          Upcoming Job Fairs
                          {jobFairs.length > 0 && (
                            <span className="text-accent ml-2 opacity-70">({jobFairs.length})</span>
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

                    {isLoadingFairs ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4">
                         <Loader2 className="h-8 w-8 animate-spin text-accent" />
                         <p className="text-muted-foreground">Fetching latest job fair events...</p>
                      </div>
                    ) : jobFairs.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {jobFairs.map((fair, idx) => (
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
                        <h3 className="text-xl font-bold mb-2">No Events Found</h3>
                        <p className="text-muted-foreground">Check back later for upcoming job fairs and recruitment events.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
