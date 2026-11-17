import ArchitectureSection from "@/components/sections/architecture-section"
import NumbersSection from "@/components/sections/numbers-section"
import OverviewSection from "@/components/sections/overview-section"
import PhaseLensHero from "@/components/ui/phaselens-hero"

function App() {
  return (
    <main>
      <PhaseLensHero />
      <OverviewSection />
      <NumbersSection />
      <ArchitectureSection />
    </main>
  )
}

export default App
