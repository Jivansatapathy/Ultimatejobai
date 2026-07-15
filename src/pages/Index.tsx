import { NavbarV2 as Navbar } from "@/components/landing2/NavbarV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { HeroSection } from "@/components/landing/HeroSection";
import { BrowseRolesSection } from "@/components/landing/BrowseRolesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TopCompaniesSection } from "@/components/landing/TopCompaniesSection";
import { CTASection } from "@/components/landing/CTASection";
import { PlansSection } from "@/components/plans/PlansSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <BrowseRolesSection />
        <TopCompaniesSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PlansSection compact />
        <CTASection />
      </main>
      <FooterV2 />
    </div>
  );
};

export default Index;
