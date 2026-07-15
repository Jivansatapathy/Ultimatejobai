import { NavbarV2 } from "@/components/landing2/NavbarV2";
import { HeroV2 } from "@/components/landing2/HeroV2";
import { LatestJobsV2 } from "@/components/landing2/LatestJobsV2";
import { CategoriesV2 } from "@/components/landing2/CategoriesV2";
import { RoleHubsV2 } from "@/components/landing2/RoleHubsV2";
import { HowItWorksV2 } from "@/components/landing2/HowItWorksV2";
import { FeaturesV2 } from "@/components/landing2/FeaturesV2";
import { SeoContentV2 } from "@/components/landing2/SeoContentV2";
import { TestimonialsV2 } from "@/components/landing2/TestimonialsV2";
import { PricingV2 } from "@/components/landing2/PricingV2";
import { FaqV2 } from "@/components/landing2/FaqV2";
import { CTAV2 } from "@/components/landing2/CTAV2";
import { FooterV2 } from "@/components/landing2/FooterV2";
import { useLandingContent } from "@/hooks/useLandingContent";

const Index2 = () => {
  const { content } = useLandingContent();

  return (
    <div className="min-h-screen bg-white">
      <NavbarV2 />
      <main>
        <HeroV2 hero={content.hero} />
        <LatestJobsV2 />
        <CategoriesV2 />
        <RoleHubsV2 />
        <HowItWorksV2 steps={content.how_it_works} />
        <FeaturesV2 features={content.features} />
        <SeoContentV2 />
        <TestimonialsV2 testimonials={content.testimonials} />
        <PricingV2 />
        <FaqV2 />
        <CTAV2 cta={content.cta} />
      </main>
      <FooterV2 />
    </div>
  );
};

export default Index2;
