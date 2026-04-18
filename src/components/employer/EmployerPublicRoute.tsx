import { Navigate, Outlet } from "react-router-dom";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import { LoadingState } from "@/components/employer/LoadingState";

export function EmployerPublicRoute() {
  const { loading, user, isEmployer } = useEmployerAuth();

  if (loading && !user && !isEmployer) {
    return <LoadingState label="Loading sign-in flow..." />;
  }

  if (user && isEmployer) {
    return <Navigate to="/employer" replace />;
  }

  return <Outlet />;
}
