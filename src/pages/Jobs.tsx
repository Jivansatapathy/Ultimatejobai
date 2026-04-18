import { Navbar } from "@/components/layout/Navbar";
import { PublicJobDiscovery } from "@/components/jobs/PublicJobDiscovery";

export default function Jobs() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_18%,#f8fafc_50%,#ffffff_100%)]">
      <Navbar />
      <PublicJobDiscovery mode="results" />
    </div>
  );
}
