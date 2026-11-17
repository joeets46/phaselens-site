import ArchitectureSection from "@/components/sections/architecture-section"
import DashboardSection from "@/components/sections/dashboard-section"
import MilestonesSection from "@/components/sections/milestones-section"
import NumbersSection from "@/components/sections/numbers-section"
import OverviewSection from "@/components/sections/overview-section"
import PhaseLensHero from "@/components/ui/phaselens-hero"
import { useSectionHash } from "@/hooks/use-section-hash"

const SECTION_IDS = ["overview", "numbers", "architecture", "dashboard", "milestones"] as const

function App() {
  useSectionHash(SECTION_IDS)

  return (
    <main>
      <PhaseLensHero />
      <OverviewSection />
      <NumbersSection />
      <ArchitectureSection />
      <DashboardSection />
      <MilestonesSection />
    </main>
  )
}

export default App
