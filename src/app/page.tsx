import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedJobs } from "@/components/home/FeaturedJobs";
import { FeaturedCompanies } from "@/components/home/FeaturedCompanies";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedJobs />
      <FeaturedCompanies />
    </>
  );
}

