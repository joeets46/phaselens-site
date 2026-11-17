import { NeuroNoiseStats, type Stat } from "@/components/ui/neuro-noise-stats"

// Verified against phaselens README.md and docs/project_brief.md (main @ 0410d7b).
const STATS: Stat[] = [
  { value: 15, label: "Knockout matches from Euro 2024" },
  { value: 468, label: "Player-match rows in one typed Parquet table" },
  { value: 3, label: "Catalogued metrics, tested but not yet validated" },
  { value: 3, label: "Interface languages: English, Turkish, German" },
]

export default function NumbersSection() {
  return (
    <NeuroNoiseStats
      id="numbers"
      eyebrow="BY THE NUMBERS"
      title="One tournament, verified end to end"
      stats={STATS}
    />
  )
}
