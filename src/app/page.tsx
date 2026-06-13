import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import Hero from "@/components/home/Hero";
import SectionRail from "@/components/home/SectionRail";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        {/* Phase 2 fills these rails with live TMDb data. */}
        <SectionRail title="Popular now" />
        <SectionRail title="Upcoming" />
      </main>
      <SiteFooter />
    </>
  );
}
