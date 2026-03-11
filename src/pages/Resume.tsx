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

        const newResume = importResumeData(parsedData);

        toast.success("Resume parsed! Add job details to analyze match.", { id: toastId });
        navigate(`/resume/${newResume.id}`);
      } catch (error: any) {
        console.error("Upload failed:", error);
        toast.error("Failed to parse resume: " + error.message, { id: toastId });
      }
    }
  };

  return (
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
            <h1 className="text-3xl font-bold mb-2">Resume Intelligence</h1>
            <p className="text-muted-foreground">Create, optimize, and manage ATS-ready resumes locally</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Action Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex flex-wrap gap-2 mb-6">
                  <Button
                    variant={activeTab === "build" ? "default" : "ghost"}
                    onClick={() => setActiveTab("build")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Build New
                  </Button>
                  <Button
                    variant={activeTab === "upload" ? "default" : "ghost"}
                    onClick={() => setActiveTab("upload")}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload & Optimize
                  </Button>
                  <Button
                    variant={activeTab === "gap-analysis" ? "default" : "ghost"}
                    onClick={() => setActiveTab("gap-analysis")}
                    className="gap-2"
                  >
                    <History className="h-4 w-4" />
                    Gap Analysis
                  </Button>
                </div>

                {activeTab === "build" ? (
                  <div className="space-y-4">
                    <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                      <div className="inline-flex p-4 rounded-full bg-secondary mb-4">
                        <Sparkles className="h-8 w-8 text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Smart Resume Builder</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Answer a few questions and let AI create an ATS-optimized resume tailored to your target role.
                      </p>
                      <Button variant="hero" className="gap-2" onClick={() => {
                        const newId = createNewResume();
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
                      className="p-8 border-2 border-dashed border-border rounded-xl text-center hover:border-accent/50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileUpload}
                      />
                      <div className="inline-flex p-4 rounded-full bg-secondary mb-4">
                        <Upload className="h-8 w-8 text-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
                      <p className="text-sm text-muted-foreground mb-4">
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
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold mb-4">Your Resumes</h2>
                <div className="space-y-3">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer border-border hover:border-accent/30`}
                      onClick={() => navigate(`/resume/${resume.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-secondary`}>
                            <FileText className={`h-5 w-5 text-muted-foreground`} />
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {resume.personalDetails.fullName || "Untitled Resume"}
                            </p>
                            <p className="text-xs text-muted-foreground">Edited {new Date(resume.lastEdited).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-success">{resume.score}%</p>
                            <p className="text-xs text-muted-foreground">ATS Score</p>
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
                    <div className="text-center py-8 text-muted-foreground">
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
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">ATS Profile Optimization</h2>
                  <Target className="h-5 w-5 text-accent" />
                </div>

                <div className="space-y-4 mb-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Select Your Resume
                    </label>
                    <Select
                      value={activeResume?.id || ""}
                      onValueChange={(id) => {
                        loadResume(id);
                        setIsAnalysisVisible(false);
                      }}
                    >
                      <SelectTrigger className="w-full bg-background/50 border-border h-9">
                        <SelectValue placeholder="Choose a resume..." />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-border">
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
                    <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground mb-3">Set your target role and job description to analyze your ATS match.</p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">Target Job Role</label>
                          <input
                            className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm"
                            placeholder="e.g. Senior Frontend Engineer"
                            value={activeResume?.targetJobRole || ""}
                            onChange={(e) => {
                              updateTargetJobRole(e.target.value);
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground">Job Description</label>
                          <textarea
                            className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm h-32"
                            placeholder="Paste the job description here..."
                            value={activeResume?.targetJobDescription || ""}
                            onChange={(e) => {
                              updateTargetJobDescription(e.target.value);
                            }}
                          />
                        </div>
                        <Button
                          className="w-full text-xs h-8 text-white bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent"
                          variant="hero"
                          disabled={!activeResume?.targetJobRole || !activeResume?.targetJobDescription || isAnalyzing}
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
                        <p className="text-xs text-muted-foreground">Target Role</p>
                        <p className="font-semibold">{activeResume.targetJobRole}</p>
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
                          <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
                          <circle cx="48" cy="48" r="42" fill="none" stroke="hsl(var(--success))" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(activeResume?.score || 0) * 2.64} 264`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold">{activeResume?.score || 0}%</span>
                        </div>
                      </div>
                      <p className="text-center text-xs text-muted-foreground mt-2 font-medium">ATS Match Score</p>
                    </div>

                    <div className="space-y-4">
                      {activeResume?.suggestions && activeResume.suggestions.some(s => s.type === 'keyword' && s.text.startsWith('Matched:')) && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-success" />
                            Matched Keywords
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {activeResume.suggestions
                              .filter(s => s.type === 'keyword' && s.text.startsWith('Matched:'))
                              .map((s, i) => (
                                <span key={i} className="px-2 py-0.5 bg-success/10 text-success text-[10px] rounded-full border border-success/20">
                                  {s.text.replace('Matched: ', '')}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {activeResume?.suggestions && activeResume.suggestions.some(s => s.type === 'keyword' && s.text.startsWith('Missing:')) && (
                        <div className="space-y-2">
                          <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
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
                        <h3 className="text-xs font-bold uppercase text-muted-foreground">Improvement Suggestions</h3>
                        {activeResume?.suggestions && activeResume.suggestions.filter(s => s.type === 'improvement').length > 0 ? (
                          activeResume.suggestions
                            .filter(s => s.type === 'improvement')
                            .map((suggestion, index) => (
                              <div key={index} className="p-2.5 rounded-lg bg-secondary/50 border border-border">
                                <div className="flex items-start gap-2">
                                  <Sparkles className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                                  <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.text}</p>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="p-2.5 rounded-lg bg-secondary/50 border border-border">
                            <p className="text-xs text-muted-foreground italic">No suggestions yet. Upload your resume for analysis.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button variant="outline" className="w-full text-xs gap-2" size="sm" onClick={() => optimizeWithAI()}>
                      <Sparkles className="h-3 w-3" />
                      Refresh Analysis
                    </Button>
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
