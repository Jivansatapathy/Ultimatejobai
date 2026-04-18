import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import { LoadingState } from "@/components/employer/LoadingState";

export function EmployerProtectedRoute() {
  const { loading, user, isEmployer } = useEmployerAuth();
  const location = useLocation();

  if (loading && !user && !isEmployer) {
    return <LoadingState label="Checking employer access..." />;
  }

  if (!user) {
    return <Navigate to="/employer/auth" replace state={{ from: location }} />;
  }

  if (!isEmployer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold">Employer access required</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your account is signed in, but the backend role must be set to `employer` or `admin` to open this panel.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
