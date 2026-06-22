import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Plus,
  Target,
  Sparkles,
  AlertCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  History
} from "lucide-react";

import { useResume } from "@/hooks/useResume";
import { useNavigate, useLocation } from "react-router-dom";
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

export default function Resume() {
  const location = useLocation();
  const fromReadiness = !!(location.state as any)?.fromReadiness;
  const [activeTab, setActiveTab] = useState<"build" | "upload" | "gap-analysis">(
    fromReadiness ? "upload" : "build"
  );
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
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported. Please upload a PDF.");
      e.target.value = "";
      return;
    }
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

      toast.success("Resume uploaded! Now complete your profile to browse jobs.", { id: toastId });
      navigate(`/resume/${newResume.id}`);
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error("Failed to parse resume: " + error.message, { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-black mb-2 text-gray-900 font-outfit" data-tour="resume-header">Resume Intelligence</h1>
            <p className="text-gray-500 font-medium tracking-wide">Create, optimize, and manage ATS-ready resumes locally</p>
          </motion.div>

          {fromReadiness && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-700">Upload your resume to continue</p>
                <p className="text-xs text-amber-600 mt-0.5">You need a resume before browsing and applying to jobs. Upload or build one below, then head back to Jobs.</p>
              </div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Action Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6"
              >
                <div className="flex flex-wrap gap-2 mb-6" data-tour="resume-tabs">
                  <Button
                    variant={activeTab === "build" ? "default" : "secondary"}
                    onClick={() => setActiveTab("build")}
                    className={`gap-2 transition-all ${activeTab === "build" ? "bg-teal-500 hover:bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"}`}
                  >
                    <Plus className="h-4 w-4" />
                    Build New
                  </Button>
                  <Button
                    variant={activeTab === "upload" ? "default" : "secondary"}
                    onClick={() => setActiveTab("upload")}
                    className={`gap-2 transition-all ${activeTab === "upload" ? "bg-teal-500 hover:bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"}`}
                  >
                    <Upload className="h-4 w-4" />
                    Upload & Optimize
                  </Button>
                  <Button
                    variant={activeTab === "gap-analysis" ? "default" : "secondary"}
                    onClick={() => setActiveTab("gap-analysis")}
                    className={`gap-2 transition-all ${activeTab === "gap-analysis" ? "bg-teal-500 hover:bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"}`}
                  >
                    <History className="h-4 w-4" />
                    Gap Analysis
                  </Button>
                </div>

                {activeTab === "build" ? (
                  <div className="space-y-4">
                    <div className="p-8 border-2 border-dashed border-teal-300 rounded-xl text-center hover:border-teal-400 hover:bg-teal-50/50 transition-all duration-300 bg-teal-50/20">
                      <div className="inline-flex p-4 rounded-full bg-teal-50 border border-teal-200 mb-4">
                        <Sparkles className="h-8 w-8 text-teal-500" />
                      </div>
                      <h3 className="text-2xl font-black mb-2 text-gray-900 font-outfit">Smart Resume Builder</h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
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
                      className="p-8 border-2 border-dashed border-teal-300 rounded-xl text-center hover:border-teal-400 hover:bg-teal-50/50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf"
                        aria-label="Upload PDF resume"
                        onChange={handleFileUpload}
                      />
                      <div className="inline-flex p-4 rounded-full bg-teal-50 border border-teal-200 mb-4">
                        <Upload className="h-8 w-8 text-teal-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-900">Upload Your Resume</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload your PDF resume and we'll parse it with AI to fill your profile.
                      </p>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <Upload className="h-4 w-4" />
                        Choose File
                      </button>
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
                className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6"
                data-tour="resume-list"
              >
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Your Resumes</h2>
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="p-4 rounded-lg border border-gray-200 transition-all cursor-pointer hover:border-teal-400 hover:bg-gray-50"
                      onClick={() => navigate(`/resume/${resume.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-teal-50 border border-teal-200">
                            <FileText className="h-5 w-5 text-teal-500" />
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2 text-gray-900">
                              {resume.personalDetails.fullName || "Untitled Resume"}
                            </p>
                            <p className="text-xs text-gray-400">Edited {new Date(resume.lastEdited).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-teal-600">{resume.score}%</p>
                            <p className="text-xs text-gray-400">ATS Score</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900" onClick={(e) => { e.stopPropagation(); navigate(`/resume/${resume.id}`); }}>
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); deleteResume(resume.id); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {resumes.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p className="mb-2">No resumes yet.</p>
                      <p className="text-xs text-gray-400">Use <span className="text-teal-600 font-semibold">Upload &amp; Optimize</span> to import your existing resume, or <span className="text-teal-600 font-semibold">Build New</span> to start from scratch.</p>
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
                className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6"
                data-tour="resume-ats"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">ATS Profile Optimization</h2>
                  <Target className="h-5 w-5 text-teal-500" />
                </div>

                <div className="space-y-4 mb-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Select Your Resume
                    </label>
                    <Select
                      value={activeResume?.id || ""}
                      onValueChange={(id) => {
                        loadResume(id);
                        setIsAnalysisVisible(false);
                      }}
                    >
                      <SelectTrigger className="w-full bg-white border-gray-200 text-gray-900 h-9">
                        <SelectValue placeholder="Choose a resume..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        {resumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id} className="text-sm text-gray-900 focus:bg-teal-50">
                            {resume.personalDetails.fullName || `Untitled Resume (${resume.id.slice(0, 4)})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!isAnalysisVisible ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-3">
                        Set your target role to analyze ATS match. The job description is optional and helps make the suggestions even more precise.
                      </p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-500">Target Job Role</label>
                          <input
                            className="w-full bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-all"
                            placeholder="e.g. Senior Software Engineer"
                            value={activeResume?.targetJobRole || ""}
                            onChange={(e) => {
                              updateTargetJobRole(e.target.value);
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-500">Job Description (Optional)</label>
                          <textarea
                            className="w-full bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded px-2 py-1.5 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition-all"
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
                        {!activeResume?.targetJobRole && (
                          <p className="text-[11px] text-amber-600 text-center mt-1">Enter a target role above to enable analysis</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Target Role</p>
                        <p className="font-semibold text-gray-900">{activeResume?.targetJobRole}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-600 hover:text-gray-900" onClick={() => {
                        updateTargetJobRole("");
                        updateTargetJobDescription("");
                        setIsAnalysisVisible(false);
                      }}>Change</Button>
                    </div>

                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto relative">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                          <circle cx="48" cy="48" r="42" fill="none" stroke="rgb(20,184,166)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(activeResume?.score || 0) * 2.64} 264`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-900">{activeResume?.score || 0}%</span>
                        </div>
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-2 font-medium">ATS Match Score</p>
                    </div>

                    <div className="space-y-4">
                      {activeResume?.suggestions && activeResume.suggestions.some(s => s.type === 'keyword' && s.text.startsWith('Matched:')) && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-teal-500" />
                            Matched Keywords
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {activeResume.suggestions
                              .filter(s => s.type === 'keyword' && s.text.startsWith('Matched:'))
                              .map((s, i) => (
                                <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] rounded-full border border-teal-200">
                                  {s.text.replace('Matched: ', '')}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {activeResume?.suggestions && activeResume.suggestions.some(s => s.type === 'keyword' && s.text.startsWith('Missing:')) && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-amber-500" />
                            Missing Keywords
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {activeResume.suggestions
                              .filter(s => s.type === 'keyword' && s.text.startsWith('Missing:'))
                              .map((s, i) => (
                                <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] rounded-full border border-amber-200">
                                  {s.text.replace('Missing: ', '')}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h3 className="text-xs font-bold uppercase text-gray-500">Improvement Suggestions</h3>
                        {activeResume?.suggestions && activeResume.suggestions.filter(s => s.type === 'improvement').length > 0 ? (
                          activeResume.suggestions
                            .filter(s => s.type === 'improvement')
                            .map((suggestion, index) => (
                              <div key={index} className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                                <div className="flex items-start gap-2">
                                  <Sparkles className="h-3.5 w-3.5 text-teal-500 mt-0.5 shrink-0" />
                                  <p className="text-xs text-gray-600 leading-relaxed">{suggestion.text}</p>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                            <p className="text-xs text-gray-400 italic">No suggestions yet. Upload your resume for analysis.</p>
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
                      <Button variant="outline" className="w-full text-xs gap-2 h-8 border-gray-300 text-gray-700 hover:bg-gray-50" size="sm" onClick={() => optimizeWithAI()}>
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
