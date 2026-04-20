import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PlansSection } from "@/components/plans/PlansSection";

// Triggering re-compile
export default function Plans() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.12),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_18%,#f8fafc_50%,#ffffff_100%)]">
      <Navbar />
      <main className="pt-16">
        <PlansSection />
      </main>
      <Footer />
    </div>
  );
}
