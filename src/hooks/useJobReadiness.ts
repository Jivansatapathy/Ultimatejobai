import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useResume } from "@/hooks/useResume";
import { careerService, CareerProfile } from "@/services/careerService";

export function useJobReadiness() {
  const navigate = useNavigate();
  const { resumes } = useResume();
  const [profile, setProfile] = useState<CareerProfile | null>(null);

  useEffect(() => {
    careerService.getProfile().then(setProfile).catch(() => {});
  }, []);

  // Returns true if the user is ready to apply; otherwise shows a toast and redirects.
  // If the profile hasn't loaded yet we allow through (benefit of the doubt).
  const checkReady = useCallback((): boolean => {
    if (resumes.length === 0) {
      toast.info("Upload your resume first before applying.", { duration: 4000 });
      navigate("/resume", { state: { fromReadiness: true } });
      return false;
    }
    if (profile !== null) {
      const missing: string[] = [];
      if (!profile.target_roles?.length || !profile.target_roles[0]) missing.push("target role");
      if (!profile.experience_level) missing.push("experience level");
      if (!profile.skills?.length) missing.push("skills");
      if (missing.length > 0) {
        toast.info(`Complete your profile first — missing: ${missing.join(", ")}.`, { duration: 5000 });
        navigate("/settings");
        return false;
      }
    }
    return true;
  }, [resumes, profile, navigate]);

  return { checkReady };
}
