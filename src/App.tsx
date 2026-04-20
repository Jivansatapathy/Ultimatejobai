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

// High-Performance Route-based Code Splitting
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Resume = lazy(() => import("./pages/Resume"));
const Jobs = lazy(() => import("./pages/Jobs"));
import Plans from "./pages/Plans";
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
  <div className="min-h-screen flex flex-col items-center justify-center bg-background">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-2 border-accent animate-spin"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent font-bold">...</div>
    </div>
    <span className="mt-4 text-muted-foreground animate-pulse tracking-widest text-xs uppercase font-medium">Priming System</span>
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
    import("./services/autoApplyService").then(({ autoApplyService }) =>
      autoApplyService.getHistory()
        .then((data: any) => setAppCount(data?.applications?.length ?? 0))
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
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                  <Route path="/" element={<CandidateRoute><Index /></CandidateRoute>} />
                  <Route path="/auth" element={<CandidateRoute><Auth /></CandidateRoute>} />
                  <Route path="/plans" element={<CandidateRoute><Plans /></CandidateRoute>} />

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
                  <Route path="/interview" element={
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
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/return-policy" element={<ReturnPolicy />} />
                  <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
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
