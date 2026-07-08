import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResumeProvider } from "@/hooks/useResume";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense, lazy, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
const ExecutiveRolesHub = lazy(() => import("./pages/ExecutiveRolesHub"));
const ExecutiveRolePage = lazy(() => import("./pages/ExecutiveRolePage"));
const FractionalHub = lazy(() => import("./pages/FractionalHub"));
const FractionalRolePage = lazy(() => import("./pages/FractionalRolePage"));
const StartupHub = lazy(() => import("./pages/StartupHub"));
const StartupRolePage = lazy(() => import("./pages/StartupRolePage"));
const BoardHub = lazy(() => import("./pages/BoardHub"));
const BoardRolePage = lazy(() => import("./pages/BoardRolePage"));
const InvestorHub = lazy(() => import("./pages/InvestorHub"));
const InvestorRolePage = lazy(() => import("./pages/InvestorRolePage"));
const InterimHub = lazy(() => import("./pages/InterimHub"));
const InterimRolePage = lazy(() => import("./pages/InterimRolePage"));
const SalaryHub = lazy(() => import("./pages/SalaryHub"));
const SalaryRolePage = lazy(() => import("./pages/SalaryRolePage"));
const BrowseRoles = lazy(() => import("./pages/BrowseRoles"));
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPostPage = lazy(() => import("./pages/BlogPost"));
const BlogAdmin = lazy(() => import("./pages/BlogAdmin"));
const BookACall = lazy(() => import("./pages/BookACall"));
const Contact = lazy(() => import("./pages/Contact"));
const Plans = lazy(() => import("./pages/Plans"));
const ContentPanel = lazy(() => import("./pages/ContentPanel"));
const CandidateInbox = lazy(() => import("./pages/CandidateInbox"));

// Hizorex AI Executive Career OS
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
const VenusAIInsights = lazy(() => import("./pages/venus/VenusAIInsights"));
const VenusJobFairs = lazy(() => import("./pages/venus/VenusJobFairs"));
const VenusSalaryNegotiation = lazy(() => import("./pages/venus/VenusSalaryNegotiation"));

// Resets the ErrorBoundary whenever the user navigates to a new route,
// so a transient render error on one page never blocks subsequent pages.
function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>;
}

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

const PageLoader = () => (
  <>
    <style>{`
      @keyframes pl-float {
        0%,100% { transform: translateY(0px) rotate(-1deg); }
        50%      { transform: translateY(-22px) rotate(1deg); }
      }
      @keyframes pl-glow {
        0%,100% { box-shadow: 0 24px 64px rgba(59,130,246,.30), 0 0 0 8px rgba(59,130,246,.08); }
        50%      { box-shadow: 0 36px 96px rgba(59,130,246,.55), 0 0 0 12px rgba(59,130,246,.14); }
      }
      @keyframes pl-orbit1 { to { transform: rotate(360deg);  } }
      @keyframes pl-orbit2 { to { transform: rotate(-360deg); } }
      @keyframes pl-ripple {
        0%   { transform: scale(.9); opacity:.7; }
        100% { transform: scale(2.6); opacity:0;  }
      }
      @keyframes pl-fadein {
        from { opacity:0; transform:translateY(14px); }
        to   { opacity:1; transform:translateY(0);    }
      }
      @keyframes pl-bar {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(300%);  }
      }
      @keyframes pl-text-shine {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
      }
      .pl-float  { animation: pl-float 3.4s ease-in-out infinite, pl-glow 3.4s ease-in-out infinite; }
      .pl-o1     { animation: pl-orbit1 5s linear infinite; }
      .pl-o2     { animation: pl-orbit2 7s linear infinite; }
      .pl-r1     { animation: pl-ripple 2.2s ease-out infinite; }
      .pl-r2     { animation: pl-ripple 2.2s ease-out .75s infinite; }
      .pl-brand  { animation: pl-fadein .8s ease-out .2s both; }
      .pl-bar    { animation: pl-bar 1.9s cubic-bezier(.4,0,.2,1) infinite; }
      .pl-shine  {
        background: linear-gradient(90deg, #1e40af 0%, #2563eb 30%, #60a5fa 50%, #2563eb 70%, #1e40af 100%);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: pl-text-shine 3s linear infinite;
      }
    `}</style>

    <div
      className="fixed inset-0 flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 70% 60% at 50% -10%, #dbeafe 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 110%, #e0e7ff 0%, transparent 60%), #f8fafc' }}
    >
      {/* Ambient blobs */}
      <div className="absolute w-[520px] h-[520px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,.07) 0%, transparent 70%)', top: '-15%', right: '-10%' }} />
      <div className="absolute w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,.06) 0%, transparent 70%)', bottom: '-8%', left: '-5%' }} />

      {/* Orb area */}
      <div className="relative flex items-center justify-center mb-10">

        {/* Ripple rings */}
        <div className="pl-r1 absolute w-32 h-32 rounded-full border border-blue-400/25 pointer-events-none" />
        <div className="pl-r2 absolute w-32 h-32 rounded-full border border-blue-400/15 pointer-events-none" />

        {/* Outer orbit ring + travelling dot */}
        <div className="pl-o1 absolute w-52 h-52 pointer-events-none">
          <svg width="208" height="208" viewBox="0 0 208 208">
            <circle cx="104" cy="104" r="100" fill="none" stroke="url(#g1)" strokeWidth="1" strokeDasharray="5 7" opacity=".35" />
            <circle cx="104" cy="4" r="5" fill="#3b82f6" opacity=".8">
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
            </circle>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#6366f1"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Inner orbit ring + dot */}
        <div className="pl-o2 absolute w-36 h-36 pointer-events-none">
          <svg width="144" height="144" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r="68" fill="none" stroke="#c7d2fe" strokeWidth="1" strokeDasharray="3 9" opacity=".5" />
            <circle cx="72" cy="4" r="3.5" fill="#818cf8" opacity=".9"/>
          </svg>
        </div>

        {/* SVG progress arc */}
        <svg className="absolute w-28 h-28" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="44" fill="none" stroke="#e0e7ff" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#g2)" strokeWidth="2.5"
            strokeLinecap="round" strokeDasharray="276"
            style={{ strokeDashoffset: 0 }}
          >
            <animate attributeName="stroke-dashoffset" values="276;55;276" dur="2.4s" ease="ease-in-out" repeatCount="indefinite"/>
          </circle>
          <defs>
            <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563eb"/>
              <stop offset="100%" stopColor="#6366f1"/>
            </linearGradient>
          </defs>
        </svg>

        {/* Floating main card */}
        <div
          className="pl-float relative w-[72px] h-[72px] flex items-center justify-center"
          style={{
            borderRadius: '22px',
            background: 'linear-gradient(140deg, #2563eb 0%, #4f46e5 100%)',
          }}
        >
          {/* Glass highlight */}
          <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: '22px', background: 'linear-gradient(150deg, rgba(255,255,255,.28) 0%, transparent 55%)' }} />
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 relative z-10 drop-shadow-sm" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="13" rx="2"/>
            <path d="M9 8V6a3 3 0 016 0v2"/>
            <circle cx="9" cy="14" r="1" fill="white" stroke="none"/>
            <circle cx="15" cy="14" r="1" fill="white" stroke="none"/>
            <path d="M9 18h6" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>

      {/* Brand + progress */}
      <div className="pl-brand flex flex-col items-center gap-1">
        <span className="pl-shine text-[22px] font-black tracking-tight leading-none">Hizorex</span>
        <span className="text-[9px] font-bold uppercase tracking-[.28em] text-gray-400">Powered by Apex™</span>

        <div className="mt-5 w-32 h-[3px] bg-blue-100/80 rounded-full overflow-hidden">
          <div className="pl-bar w-1/3 h-full rounded-full bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </div>
      </div>
    </div>
  </>
);

function AppChecklist() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appCount, setAppCount] = useState(0);
  const [interviewDone, setInterviewDone] = useState(false);
  const isEmployer = localStorage.getItem("current_user_role") === "employer";

  // All hooks must run unconditionally — conditional logic goes inside each effect
  useEffect(() => {
    if (isEmployer) return;
    import("./services/notificationService").then(({ notificationService }) => {
      notificationService.checkAndFireDailyReminder();
    });
  }, [isEmployer]);

  useEffect(() => {
    if (isEmployer) return;
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
  }, [isEmployer]);

  if (isEmployer) return null;

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
                  <RouteErrorBoundary>
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
                  {/* SEO public role pages — no auth required */}
                  <Route path="/executive-roles" element={<ExecutiveRolesHub />} />
                  <Route path="/executive-roles/:role" element={<ExecutiveRolePage />} />
                  <Route path="/fractional" element={<FractionalHub />} />
                  <Route path="/fractional/:role" element={<FractionalRolePage />} />
                  <Route path="/startup" element={<StartupHub />} />
                  <Route path="/startup/:role" element={<StartupRolePage />} />
                  <Route path="/board" element={<BoardHub />} />
                  <Route path="/board/:role" element={<BoardRolePage />} />
                  <Route path="/investors" element={<InvestorHub />} />
                  <Route path="/investors/:role" element={<InvestorRolePage />} />
                  <Route path="/interim" element={<InterimHub />} />
                  <Route path="/interim/:role" element={<InterimRolePage />} />
                  <Route path="/salary" element={<SalaryHub />} />
                  <Route path="/salary/:role" element={<SalaryRolePage />} />
                  <Route path="/browse-roles" element={<BrowseRoles />} />
                  {/* Blog */}
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/blog-admin" element={<BlogAdmin />} />
                  <Route path="/job/:jobId" element={<PublicLinkedInJob />} />
                  <Route path="/companies/:slug" element={<CandidateRoute><CompanyProfile /></CandidateRoute>} />
                  <Route path="/inbox" element={<CandidateRoute><CandidateInbox /></CandidateRoute>} />
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
                  {/* Hizorex AI Executive Career OS */}
                  <Route path="/hizorex-os" element={<ProtectedRoute><VenusShell /></ProtectedRoute>}>
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
                    <Route path="ai-insights" element={<VenusAIInsights />} />
                    <Route path="job-fairs" element={<VenusJobFairs />} />
                    <Route path="salary-negotiation" element={<VenusSalaryNegotiation />} />
                  </Route>

                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/return-policy" element={<ReturnPolicy />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/book-a-call" element={<BookACall />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/content-panel" element={<ContentPanel />} />
                  <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  </RouteErrorBoundary>
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
