import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResumeProvider } from "@/hooks/useResume";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy, useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./context/AuthContext";
import { EmployerAuthProvider } from "./context/EmployerAuthContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CandidateRoute from "./components/auth/CandidateRoute";
import FeatureRoute from "./components/auth/FeatureRoute";
import { ActivityAuditObserver } from "./components/activity/ActivityAuditObserver";
import { EmployerProtectedRoute } from "./components/employer/EmployerProtectedRoute";
import { EmployerPublicRoute } from "./components/employer/EmployerPublicRoute";
import GettingStartedPopup from "./components/GettingStartedPopup";
import ChecklistSidebar from "./components/ChecklistSidebar";
import ChecklistToggle from "./components/ChecklistToggle";
import NotificationSetupModal from "./components/NotificationSetupModal";
import { ErrorBoundary } from "./components/ErrorBoundary";

// High-Performance Route-based Code Splitting
const Index = lazy(() => import("./pages/Index"));
const Index2 = lazy(() => import("./pages/Index2"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Resume = lazy(() => import("./pages/Resume"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Auth = lazy(() => import("./pages/Auth"));
const Applications = lazy(() => import("./pages/Applications"));
const CareerInsights = lazy(() => import("./pages/CareerInsights"));
const AIMentor = lazy(() => import("./pages/AIMentor"));
const SalaryNegotiator = lazy(() => import("./pages/SalaryNegotiator"));
const CareerPlanner = lazy(() => import("./pages/CareerPlanner"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));
const InterviewPanel = lazy(() => import("./pages/InterviewPanel"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SuperAdmin = lazy(() => import("./pages/SuperAdmin"));
const ResumeBuilder = lazy(() => import("./components/resume/ResumeBuilder"));
const EmployerPanel = lazy(() => import("./pages/EmployerPanel"));
const EmployerAuth = lazy(() => import("./pages/EmployerAuth"));
const Settings = lazy(() => import("./pages/Settings"));
const EmployerOverview = lazy(() => import("./pages/employer/EmployerOverview"));
const EmployerJobs = lazy(() => import("./pages/employer/EmployerJobs"));
const EmployerLinkedIn = lazy(() => import("./pages/employer/EmployerLinkedIn"));
const EmployerCandidates = lazy(() => import("./pages/employer/EmployerCandidates"));
const EmployerSettings = lazy(() => import("./pages/employer/EmployerSettings"));
const EmployerNotifications = lazy(() => import("./pages/employer/EmployerNotifications"));
const EmployerTalentPool = lazy(() => import("./pages/employer/EmployerTalentPool"));
const EmployerOfferLetters = lazy(() => import("./pages/employer/EmployerOfferLetters"));
const EmployerMessages = lazy(() => import("./pages/employer/EmployerMessages"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile"));
const PublicLinkedInJob = lazy(() => import("./pages/PublicLinkedInJob"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const SeniorJobs = lazy(() => import("./pages/SeniorJobs"));
const FractionalJobs = lazy(() => import("./pages/FractionalJobs"));

// Venus AI Executive Career OS
const VenusShell = lazy(() => import("./components/venus/VenusShell"));
const VenusDashboard = lazy(() => import("./pages/venus/VenusDashboard"));
const ExecutiveProfileBuilder = lazy(() => import("./pages/venus/ExecutiveProfileBuilder"));
const ExecutiveOpportunityEngine = lazy(() => import("./pages/venus/ExecutiveOpportunityEngine"));
const CompanyIntelligence = lazy(() => import("./pages/venus/CompanyIntelligence"));
const CompensationIntelligence = lazy(() => import("./pages/venus/CompensationIntelligence"));
const EquityCalculator = lazy(() => import("./pages/venus/EquityCalculator"));
const NetworkingEngine = lazy(() => import("./pages/venus/NetworkingEngine"));
const ExecutiveBranding = lazy(() => import("./pages/venus/ExecutiveBranding"));
const ExecInterviewPrep = lazy(() => import("./pages/venus/ExecInterviewPrep"));
const ExecutiveReadinessScore = lazy(() => import("./pages/venus/ExecutiveReadinessScore"));
const AICareerTwin = lazy(() => import("./pages/venus/AICareerTwin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default stale time
      gcTime: 1000 * 60 * 15,    // 15 minutes garbage collection
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Elegant Loading Placeholder
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 select-none">
    {/* Multi-ring spinner */}
    <div className="relative flex items-center justify-center mb-8">
      {/* Outermost — slow dashed orbit */}
      <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-blue-100 animate-[spin_5s_linear_infinite]" />
      {/* Middle — fast arc */}
      <div className="absolute w-20 h-20 rounded-full border-[3px] border-transparent border-t-blue-600 border-r-blue-300 animate-spin" />
      {/* Inner — counter-spin arc */}
      <div className="absolute w-14 h-14 rounded-full border-2 border-transparent border-b-blue-400 border-l-blue-200 animate-[spin_1.8s_linear_infinite_reverse]" />
      {/* Center badge */}
      <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-300/40">
        {/* Inline bot/AI icon */}
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="18" height="13" rx="2"/>
          <path d="M9 8V6a3 3 0 016 0v2"/>
          <circle cx="9" cy="14" r="1" fill="white" stroke="none"/>
          <circle cx="15" cy="14" r="1" fill="white" stroke="none"/>
          <path d="M9 18h6" strokeWidth="1.5"/>
        </svg>
      </div>
    </div>

    {/* Brand */}
    <p className="text-lg font-black text-gray-900 tracking-tight mb-0.5">Hizorex</p>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.22em] mb-2">Powered by Apex™</p>

    {/* "Priming System" label with bouncing dots */}
    <div className="flex items-center gap-2 mb-6">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Priming System</span>
      <span className="flex gap-1 items-center">
        <span className="h-1 w-1 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms]" />
        <span className="h-1 w-1 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]" />
        <span className="h-1 w-1 rounded-full bg-blue-600 animate-bounce [animation-delay:300ms]" />
      </span>
    </div>

    {/* Sweep progress bar */}
    <div className="w-44 h-0.5 bg-blue-50 rounded-full overflow-hidden">
      <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[loader-sweep_1.6s_ease-in-out_infinite]" />
    </div>
  </div>
);

function AppChecklist() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appCount, setAppCount] = useState(0);
  const [interviewDone, setInterviewDone] = useState(false);

  useEffect(() => {
    // Fire daily reminder if conditions are met
    import("./services/notificationService").then(({ notificationService }) => {
      notificationService.checkAndFireDailyReminder();
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    import("./services/api").then(({ default: api }) =>
      api.get('/api/bot/history/')
        .then((res: any) => setAppCount(res.data?.applications?.length ?? 0))
        .catch(() => {})
    );
    import("./services/activityService").then(({ activityService }) =>
      activityService.getUserHistory()
        .then((logs: any[]) => setInterviewDone(logs.some(l => l.activity_type === "INTERVIEW")))
        .catch(() => {})
    );
  }, []);

  return (
    <>
      <ChecklistToggle onClick={() => setSidebarOpen(true)} appCount={appCount} interviewDone={interviewDone} />
      <ChecklistSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <EmployerAuthProvider>
            <SubscriptionProvider>
              <ResumeProvider>
                  <BrowserRouter>
                  <ActivityAuditObserver />
                  <GettingStartedPopup />
                  <NotificationSetupModal />
                  <AppChecklist />
                  <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                  <Route path="/" element={<Index2 />} />
                  <Route path="/v2" element={<Index2 />} />
                  <Route path="/auth" element={<CandidateRoute><Auth /></CandidateRoute>} />

                  <Route path="/dashboard" element={
                    <CandidateRoute>
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    </CandidateRoute>
                  } />
                  <Route path="/resume" element={
                    <CandidateRoute>
                      <ProtectedRoute>
                        <FeatureRoute
                          featureKey="resume_builder_access"
                          title="Resume tools are locked on your current plan"
                          description="Choose Professional or above to use the resume builder and ATS workflow."
                        >
                          <Resume />
                        </FeatureRoute>
                      </ProtectedRoute>
                    </CandidateRoute>
                  } />
                  <Route path="/resume/:id" element={
                    <CandidateRoute>
                      <ProtectedRoute>
                        <FeatureRoute
                          featureKey="resume_builder_access"
                          title="Resume tools are locked on your current plan"
                          description="Choose Professional or above to use the resume builder and ATS workflow."
                        >
                          <ResumeBuilder />
                        </FeatureRoute>
                      </ProtectedRoute>
                    </CandidateRoute>
                  } />
                  <Route path="/jobs" element={<CandidateRoute><Jobs /></CandidateRoute>} />
                  <Route path="/find-jobs" element={<CandidateRoute><SeniorJobs /></CandidateRoute>} />
                  <Route path="/fractional-jobs" element={<CandidateRoute><FractionalJobs /></CandidateRoute>} />
                  <Route path="/job/:jobId" element={<PublicLinkedInJob />} />
                  <Route path="/companies/:slug" element={<CandidateRoute><CompanyProfile /></CandidateRoute>} />
                  <Route path="/applications" element={
                    <CandidateRoute>
                      <ProtectedRoute>
                        <Applications />
                      </ProtectedRoute>
                    </CandidateRoute>
                  } />
                  <Route path="/ai-mentor" element={
                    <CandidateRoute>
                      <ProtectedRoute>
                        <FeatureRoute
                          featureKey="career_insights_access"
                          title="Career insights require a higher plan"
                          description="Upgrade from Free to unlock gap analysis, AI insights, and job fair tools."
                        >
                          <CareerInsights />
                        </FeatureRoute>
                      </ProtectedRoute>
                    </CandidateRoute>
                  } />

                  <Route path="/career-planner" element={
                    <CandidateRoute>
                      <ProtectedRoute>
                        <CareerPlanner />
                      </ProtectedRoute>
                    </CandidateRoute>
                  } />

                  <Route path="/salary-negotiator" element={
                    <CandidateRoute>
                      <ProtectedRoute>
                        <SalaryNegotiator />
                      </ProtectedRoute>
                    </CandidateRoute>
                  } />

                  <Route path="/onboarding" element={
                    <CandidateRoute>
                      <ProtectedRoute>
                        <Onboarding />
                      </ProtectedRoute>
                    </CandidateRoute>
                  } />
                  <Route path="/interview/*" element={
                    <CandidateRoute>
                      <ProtectedRoute>
                        <FeatureRoute
                          featureKey="text_interview_access"
                          title="Interview practice is not available on your current plan"
                          description="Choose Professional, Accelerator, or Executive to unlock interview practice."
                        >
                          <InterviewPanel />
                        </FeatureRoute>
                      </ProtectedRoute>
                    </CandidateRoute>
                  } />
                  <Route path="/settings" element={
                    <CandidateRoute>
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    </CandidateRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/superadmin" element={<SuperAdmin />} />
                  <Route element={<EmployerPublicRoute />}>
                    <Route path="/employer/auth" element={<EmployerAuth />} />
                  </Route>
                  <Route element={<EmployerProtectedRoute />}>
                    <Route path="/employer" element={<EmployerPanel />}>
                      <Route index element={<EmployerOverview />} />
                      <Route path="jobs" element={<EmployerJobs />} />
                      <Route path="linkedin" element={<EmployerLinkedIn />} />
                      <Route path="candidates" element={<EmployerCandidates />} />
                      <Route path="talent-pool" element={<EmployerTalentPool />} />
                      <Route path="notifications" element={<EmployerNotifications />} />
                      <Route path="offer-letters" element={<EmployerOfferLetters />} />
                      <Route path="messages" element={<EmployerMessages />} />
                      <Route path="settings" element={<EmployerSettings />} />
                    </Route>
                  </Route>
                  {/* Venus AI Executive Career OS */}
                  <Route path="/venus" element={<ProtectedRoute><VenusShell /></ProtectedRoute>}>
                    <Route index element={<VenusDashboard />} />
                    <Route path="profile" element={<ExecutiveProfileBuilder />} />
                    <Route path="opportunities" element={<ExecutiveOpportunityEngine />} />
                    <Route path="company-intel" element={<CompanyIntelligence />} />
                    <Route path="compensation" element={<CompensationIntelligence />} />
                    <Route path="equity" element={<EquityCalculator />} />
                    <Route path="network" element={<NetworkingEngine />} />
                    <Route path="branding" element={<ExecutiveBranding />} />
                    <Route path="interview-prep" element={<ExecInterviewPrep />} />
                    <Route path="readiness-score" element={<ExecutiveReadinessScore />} />
                    <Route path="career-twin" element={<AICareerTwin />} />
                  </Route>

                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/return-policy" element={<ReturnPolicy />} />
                  <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  </ErrorBoundary>
                </BrowserRouter>
              </ResumeProvider>
            </SubscriptionProvider>
          </EmployerAuthProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
