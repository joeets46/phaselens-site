import ArchitectureSection from "@/components/sections/architecture-section"
import DashboardSection from "@/components/sections/dashboard-section"
import LimitationsSection from "@/components/sections/limitations-section"
import MilestonesSection from "@/components/sections/milestones-section"
import NumbersSection from "@/components/sections/numbers-section"
import OverviewSection from "@/components/sections/overview-section"
import SiteFooter from "@/components/sections/site-footer"
import PhaseLensHero from "@/components/ui/phaselens-hero"
import { PressureRidgeline } from "@/components/ui/pressure-ridgeline"
import { useBandSizes } from "@/hooks/use-band-sizes"
import { useMediaQuery } from "@/hooks/use-media-query"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { useSectionHash } from "@/hooks/use-section-hash"

const SECTION_IDS = ["overview", "numbers", "architecture", "dashboard", "milestones", "limitations"] as const

function App() {
  useSectionHash(SECTION_IDS)
  // On very short screens a fixed band would take too much of the view: the ridges go into the footer instead.
  const shortScreen = useMediaQuery("(max-height: 599px)")
  const band = useBandSizes()
  const reducedMotion = usePrefersReducedMotion()
  // No fixed band on short screens or with reduced motion: the ridges are in the footer instead.
  const showBand = !shortScreen && !reducedMotion

  return (
    <>
      {/* The ridge band is fixed over the bottom of the viewport and grows to band.max at the end of
          the page. This padding is that largest size, so the footer always ends above the band. */}
      <div className="bg-navy-950" style={showBand ? { paddingBottom: band.max } : undefined}>
        <main className="bg-navy-900">
          <PhaseLensHero />
          <OverviewSection />
          <NumbersSection />
          <ArchitectureSection />
          <DashboardSection />
          <MilestonesSection />
          <LimitationsSection />
        </main>
        <SiteFooter ridges={!showBand} />
      </div>
      {showBand ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
          <PressureRidgeline band={band} />
        </div>
      ) : null}
    </>
  )
}

export default App
