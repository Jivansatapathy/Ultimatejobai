import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PublicJobDiscovery } from "@/components/jobs/PublicJobDiscovery";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { PlansSection } from "@/components/plans/PlansSection";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {isAuthenticated ? (
        <main>
          <HeroSection />
          <FeaturesSection />
          <PlansSection compact />
          <CTASection />
        </main>
      ) : (
        <main>
          <PublicJobDiscovery mode="landing" />
          <FeaturesSection />
          <PlansSection compact />
          <CTASection />
        </main>
      )}
      <Footer />
    </div>
  );
};

export default Index;
