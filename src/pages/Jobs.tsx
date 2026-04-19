import { Navbar } from "@/components/layout/Navbar";
import { PublicJobDiscovery } from "@/components/jobs/PublicJobDiscovery";

export default function Jobs() {
  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Navbar />
      <PublicJobDiscovery mode="results" />
    </div>
  );
}
