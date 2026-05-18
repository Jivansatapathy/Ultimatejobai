import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface CandidateRouteProps {
  children: React.ReactNode;
}

const CandidateRoute: React.FC<CandidateRouteProps> = ({ children }) => {
  const { loading, isAuthenticated, userRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e]">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-teal-500" />
      </div>
    );
  }

  if (isAuthenticated && userRole === "employer") {
    return <Navigate to="/employer" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default CandidateRoute;
