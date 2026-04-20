import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Plus,
  Target,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  History
} from "lucide-react";

import { useResume } from "@/hooks/useResume";
import { useNavigate } from "react-router-dom";
import { GapAnalysisPanel } from "@/components/resume/GapAnalysisPanel";
import { activityTracker } from "@/services/activityTracker";
import { careerService } from "@/services/careerService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const suggestions = [
  { type: "keyword", text: "Add 'TypeScript' to skills section - appears in 89% of matching job descriptions" },
  { type: "improvement", text: "Quantify your achievement at TechCorp with specific metrics" },
  { type: "keyword", text: "Include 'CI/CD' experience - highly requested in target roles" },
];

export default function Resume() {
  const [activeTab, setActiveTab] = useState<"build" | "upload" | "gap-analysis">("build");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisVisible, setIsAnalysisVisible] = useState(false);
  const {
    resumes,
    createNewResume,
    deleteResume,
    activeResume,
    loadResume,
    updateTargetJobRole,
    updateTargetJobDescription,
    importResumeData,
    optimizeWithAI,
    analyzeFileATS
  } = useResume();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastUploadedFileRef = useRef<File | null>(null);

  // Auto-select first resume if none active to enable ATS sidebar
  useEffect(() => {
    if (!activeResume && resumes.length > 0) {
      loadResume(resumes[0].id);
    }
  }, [activeResume, resumes, loadResume]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      lastUploadedFileRef.current = file;
      const toastId = toast.loading("Parsing resume with AI...");
      try {
        const { parseResumeFromFile } = await import('@/services/aiService');
        const parsedData = await parseResumeFromFile(file);
        try {
          await careerService.analyzeResume(file);
        } catch (backendError) {
          console.warn("Backend resume registration failed:", backendError);
          toast.warning("Resume parsed locally, but could not register it for employer applications yet.");
        }

        const newResume = importResumeData(parsedData);
        activityTracker.trackAction(
          "RESUME_EDIT",
          `Imported resume from file: ${file.name}`,
          {
            fileName: file.name,
            resumeId: newResume.id,
          },
          { dedupeKey: `resume-import:${newResume.id}`, dedupeMs: 5000 },
        );

        toast.success("Resume parsed! Add job details to analyze match.", { id: toastId });
        navigate(`/resume/${newResume.id}`);
      } catch (error: any) {
        console.error("Upload failed:", error);
        toast.error("Failed to parse resume: " + error.message, { id: toastId });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] relative overflow-hidden">
      {/* Atmospheric glows */}
      <div className="pointer-events-none absolute top-0 right-1/4 w-[500px] h-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[120px]" />
      <Navbar />

      <main className="pt-24 pb-12 px-4 relative z-10">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-black mb-2 text-white font-outfit" data-tour="resume-header">Resume Intelligence</h1>
            <p className="text-slate-400 font-medium tracking-wide">Create, optimize, and manage ATS-ready resumes locally</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Action Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6"
              >
                <div className="flex flex-wrap gap-2 mb-6" data-tour="resume-tabs">
                  <Button
                    variant={activeTab === "build" ? "default" : "secondary"}
                    onClick={() => setActiveTab("build")}
                    className={`gap-2 transition-all ${activeTab === "build" ? "bg-teal-500 hover:bg-teal-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}
                  >
                    <Plus className="h-4 w-4" />
                    Build New
                  </Button>
                  <Button
                    variant={activeTab === "upload" ? "default" : "secondary"}
                    onClick={() => setActiveTab("upload")}
                    className={`gap-2 transition-all ${activeTab === "upload" ? "bg-teal-500 hover:bg-teal-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}
                  >
                    <Upload className="h-4 w-4" />
                    Upload & Optimize
                  </Button>
                  <Button
                    variant={activeTab === "gap-analysis" ? "default" : "secondary"}
                    onClick={() => setActiveTab("gap-analysis")}
                    className={`gap-2 transition-all ${activeTab === "gap-analysis" ? "bg-teal-500 hover:bg-teal-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}
                  >
                    <History className="h-4 w-4" />
                    Gap Analysis
                  </Button>
                </div>

                {activeTab === "build" ? (
                  <div className="space-y-4">
                    <div className="p-8 border-2 border-dashed border-teal-500/30 rounded-xl text-center hover:border-teal-500/60 hover:bg-teal-500/5 transition-all duration-500 neon-border bg-gradient-to-br from-teal-500/5 to-transparent">
                      <div className="inline-flex p-4 rounded-full bg-teal-500/10 border border-teal-500/20 mb-4">
                        <Sparkles className="h-8 w-8 text-teal-400" />
                      </div>
                      <h3 className="text-2xl font-black mb-2 text-white font-outfit">Smart Resume Builder</h3>
                      <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
                        Answer a few questions and let AI create an ATS-optimized resume tailored to your target role.
                      </p>
                      <Button variant="hero" className="gap-2" onClick={() => {
                        const newId = createNewResume();
                        activityTracker.trackAction(
                          "RESUME_EDIT",
                          "Created a new resume draft",
                          { resumeId: newId },
                          { dedupeKey: `resume-create:${newId}`, dedupeMs: 5000 },
                        );
                        navigate(`/resume/${newId}`);
                      }}>
                        <Plus className="h-4 w-4" />
                        Start Building
                      </Button>
                    </div>
                  </div>
                ) : activeTab === "upload" ? (
                  <div className="space-y-4">
                    <div
                      className="p-8 border-2 border-dashed border-teal-500/30 rounded-xl text-center hover:border-teal-500/60 hover:bg-teal-500/5 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileUpload}
                      />
                      <div className="inline-flex p-4 rounded-full bg-teal-500/10 border border-teal-500/20 mb-4">
                        <Upload className="h-8 w-8 text-teal-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-white">Upload Your Resume</h3>
                      <p className="text-sm text-slate-400 mb-4">
                        Drop your PDF or DOCX file here, and we'll analyze it using multimodal AI.
                      </p>
                      <Button variant="outline" className="gap-2" onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}>
                        <Upload className="h-4 w-4" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <GapAnalysisPanel resumes={resumes} />
                )}
              </motion.div>

              {/* Resume Versions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6"
                data-tour="resume-list"
              >
                <h2 className="text-lg font-semibold mb-4 text-white">Your Resumes</h2>
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer border-white/[0.08] hover:border-teal-500/40 hover:bg-white/[0.04]`}
                      onClick={() => navigate(`/resume/${resume.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
                            <FileText className="h-5 w-5 text-teal-400" />
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2 text-white">
                              {resume.personalDetails.fullName || "Untitled Resume"}
                            </p>
                            <p className="text-xs text-slate-500">Edited {new Date(resume.lastEdited).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-teal-400">{resume.score}%</p>
                            <p className="text-xs text-slate-500">ATS Score</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); navigate(`/resume/${resume.id}`); }}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); deleteResume(resume.id); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {resumes.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No resumes found. Create one to get started!
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* ATS Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-2xl p-6"
                data-tour="resume-ats"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">ATS Profile Optimization</h2>
                  <Target className="h-5 w-5 text-teal-400" />
                </div>

                <div className="space-y-4 mb-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Select Your Resume
                    </label>
                    <Select
                      value={activeResume?.id || ""}
                      onValueChange={(id) => {
                        loadResume(id);
                        setIsAnalysisVisible(false);
                      }}
                    >
                      <SelectTrigger className="w-full bg-white/[0.05] border-white/10 text-slate-100 h-9">
                        <SelectValue placeholder="Choose a resume..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1225] border-white/10">
                        {resumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id} className="text-sm">
                            {resume.personalDetails.fullName || `Untitled Resume (${resume.id.slice(0, 4)})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!isAnalysisVisible ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.08]">
                      <p className="text-xs text-slate-400 mb-3">
                        Set your target role to analyze ATS match. The job description is optional and helps make the suggestions even more precise.
                      </p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Target Job Role</label>
                          <input
                            className="w-full bg-white/[0.05] border border-white/10 text-slate-100 placeholder:text-slate-500 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:bg-white/10 transition-all"
                            placeholder="e.g. Senior Software Engineer"
                            value={activeResume?.targetJobRole || ""}
                            onChange={(e) => {
                              updateTargetJobRole(e.target.value);
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Job Description (Optional)</label>
                          <textarea
                            className="w-full bg-white/[0.05] border border-white/10 text-slate-100 placeholder:text-slate-500 rounded px-2 py-1.5 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:bg-white/10 transition-all"
                            placeholder="Paste the job description here for a more targeted ATS check..."
                            value={activeResume?.targetJobDescription || ""}
                            onChange={(e) => {
                              updateTargetJobDescription(e.target.value);
                            }}
                          />
                        </div>
                        <Button
                          className="w-full text-xs h-8 text-white bg-gradient-to-r from-teal-600 to-blue-500 hover:from-teal-700 hover:to-blue-600"
                          variant="hero"
                          disabled={!activeResume?.targetJobRole || isAnalyzing}
                          onClick={async () => {
                            if (!activeResume) return;

                            setIsAnalyzing(true);
                            const toastId = toast.loading("Analyzing ATS match...");

                            try {
                              if (lastUploadedFileRef.current) {
                                await analyzeFileATS(lastUploadedFileRef.current);
                                setIsAnalysisVisible(true);
                                toast.success("Deep ATS Analysis updated!", { id: toastId });
                              } else {
                                await optimizeWithAI();
                                setIsAnalysisVisible(true);
                                toast.success("AI Analysis updated!", { id: toastId });
                              }
                            } catch (error: any) {
                              toast.error("Analysis failed: " + error.message, { id: toastId });
                            } finally {
                              setIsAnalyzing(false);
                            }
                          }}
                        >
                          {isAnalyzing ? (
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-3 w-3 animate-spin" />
                              Analyzing...
                            </div>
                          ) : (
                            "Analyze ATS Match"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Target Role</p>
                        <p className="font-semibold text-white">{activeResume.targetJobRole}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                        updateTargetJobRole("");
                        updateTargetJobDescription("");
                        setIsAnalysisVisible(false);
                      }}>Change</Button>
                    </div>

                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto relative">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                          <circle cx="48" cy="48" r="42" fill="none" stroke="rgb(20,184,166)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(activeResume?.score || 0) * 2.64} 264`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{activeResume?.score || 0}%</span>
                        </div>
                      </div>
                      <p className="text-center text-xs text-slate-400 mt-2 font-medium">ATS Match Score</p>
                    </div>

                    <div className="space-y-4">
                      {activeResume?.suggestions && activeResume.suggestions.some(s => s.type === 'keyword' && s.text.startsWith('Matched:')) && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-success" />
                            Matched Keywords
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {activeResume.suggestions
                              .filter(s => s.type === 'keyword' && s.text.startsWith('Matched:'))
                              .map((s, i) => (
                                <span key={i} className="px-2 py-0.5 bg-teal-500/10 text-teal-400 text-[10px] rounded-full border border-teal-500/20">
                                  {s.text.replace('Matched: ', '')}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {activeResume?.suggestions && activeResume.suggestions.some(s => s.type === 'keyword' && s.text.startsWith('Missing:')) && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-warning" />
                            Missing Keywords
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {activeResume.suggestions
                              .filter(s => s.type === 'keyword' && s.text.startsWith('Missing:'))
                              .map((s, i) => (
                                <span key={i} className="px-2 py-0.5 bg-warning/10 text-warning text-[10px] rounded-full border border-warning/20">
                                  {s.text.replace('Missing: ', '')}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-slate-400">Improvement Suggestions</h3>
                        {activeResume?.suggestions && activeResume.suggestions.filter(s => s.type === 'improvement').length > 0 ? (
                          activeResume.suggestions
                            .filter(s => s.type === 'improvement')
                            .map((suggestion, index) => (
                              <div key={index} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                                <div className="flex items-start gap-2">
                                  <Sparkles className="h-3.5 w-3.5 text-teal-400 mt-0.5 shrink-0" />
                                  <p className="text-xs text-slate-400 leading-relaxed">{suggestion.text}</p>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                            <p className="text-xs text-slate-500 italic">No suggestions yet. Upload your resume for analysis.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <Button
                        className="w-full text-xs gap-2 h-9 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                        onClick={() => {
                          if (activeResume) navigate(`/resume/${activeResume.id}`);
                        }}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Apply Changes in Editor
                      </Button>
                      <Button variant="outline" className="w-full text-xs gap-2 h-8" size="sm" onClick={() => optimizeWithAI()}>
                        <Sparkles className="h-3 w-3" />
                        Refresh Analysis
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
