import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResumeProvider } from "@/hooks/useResume";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import Jobs from "./pages/Jobs";
import Auth from "./pages/Auth";
import { ResumeBuilder } from "./components/resume/ResumeBuilder";
import CareerInsights from "./pages/CareerInsights";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import InterviewPanel from "./pages/InterviewPanel";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ResumeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/resume" element={
                <ProtectedRoute>
                  <Resume />
                </ProtectedRoute>
              } />
              <Route path="/resume/:id" element={
                <ProtectedRoute>
                  <ResumeBuilder />
                </ProtectedRoute>
              } />
              <Route path="/jobs" element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              } />
              <Route path="/insights" element={
                <ProtectedRoute>
                  <CareerInsights />
                </ProtectedRoute>
              } />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/interview" element={
                <ProtectedRoute>
                  <InterviewPanel />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ResumeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
