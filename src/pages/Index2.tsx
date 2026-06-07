import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { HeroV2 } from "@/components/landing2/HeroV2";
import { LatestJobsV2 } from "@/components/landing2/LatestJobsV2";
import { CategoriesV2 } from "@/components/landing2/CategoriesV2";
import { TrustedCompaniesV2 } from "@/components/landing2/TrustedCompaniesV2";
import { HowItWorksV2 } from "@/components/landing2/HowItWorksV2";
import { FeaturesV2 } from "@/components/landing2/FeaturesV2";
import { TestimonialsV2 } from "@/components/landing2/TestimonialsV2";
import { PricingV2 } from "@/components/landing2/PricingV2";
import { CTAV2 } from "@/components/landing2/CTAV2";
import { FooterV2 } from "@/components/landing2/FooterV2";

const Index2 = () => (
  <div className="min-h-screen bg-white">
    <NavbarV2 />
    <main>
      <HeroV2 />
      <LatestJobsV2 />
      <CategoriesV2 />
      <TrustedCompaniesV2 />
      <HowItWorksV2 />
      <FeaturesV2 />
      <TestimonialsV2 />
      <PricingV2 />
      <CTAV2 />
    </main>
    <FooterV2 />
  </div>
);

export default Index2;
