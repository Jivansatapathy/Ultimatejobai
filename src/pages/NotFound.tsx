import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-teal-500 mb-2">404</p>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">
          The page <span className="text-teal-400 font-mono">{location.pathname}</span> doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard">
            <Button className="h-10 px-5 bg-teal-600 hover:bg-teal-500 text-white font-bold uppercase text-xs rounded-lg">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            className="h-10 px-5 border-white/10 text-slate-300 hover:bg-white/5 font-bold uppercase text-xs rounded-lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
