import { Navigate, useLocation } from "react-router-dom";
import { useVenusAuth } from "@/context/VenusAuthContext";

export function VenusProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useVenusAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/venus/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
