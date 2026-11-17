import { Database, FingerprintPattern, Radar, SquareFunction } from "lucide-react"

import { FeatureGrid, type Feature } from "@/components/ui/feature-grid"

const DOCS = "https://github.com/joeets46/phaselens/blob/main/docs"

const FEATURES: Feature[] = [
  {
    icon: FingerprintPattern,
    title: "Reproducible ingestion",
    description:
      "Every source file is pinned to one upstream commit, stored byte-for-byte, and recorded with SHA-256 provenance manifests.",
    href: `${DOCS}/data_sources.md`,
  },
  {
    icon: SquareFunction,
    title: "Metric contracts",
    description:
      "Three pressure and counterpress event counts, each with an exact formula, eligibility rules and acceptance tests in a written catalog.",
    href: `${DOCS}/metric_catalog.md`,
  },
  {
    icon: Database,
    title: "Analytical layer",
    description:
      "Player-match metrics stored as typed Parquet and queried with DuckDB through fixed, tested queries.",
    href: `${DOCS}/analytical_layer.md`,
  },
  {
    icon: Radar,
    title: "360° spatial context",
    description:
      "Positions of visible players at event moments, with nearest-opponent distance and 5/10/20-unit ring counts.",
    href: `${DOCS}/three_sixty.md`,
  },
]

export default function OverviewSection() {
  return (
    <section id="overview" aria-labelledby="overview-heading" className="bg-navy-900 py-24 text-chalk lg:py-32">
      <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-x-12 gap-y-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold tracking-[0.2em] text-pitch-400 [font-stretch:125%]">WHY IT EXISTS</p>
            <h2
              id="overview-heading"
              className="mt-4 max-w-[20ch] text-[clamp(2.25rem,4.2vw,4rem)] leading-[1.02] font-bold tracking-[-0.01em] text-balance text-chalk [font-stretch:75%]"
            >
              Learning what event data can — and can't — say
            </h2>
          </div>

          <p className="max-w-[52ch] text-base leading-relaxed text-pretty text-haze sm:text-lg lg:col-span-5 lg:self-end">
            The long-term goal is to study players' off-ball contributions across phases of play: pressing,
            counterpressing and defensive transitions. Most of that is future work. The project starts by learning
            exactly what event data can support.
          </p>
        </div>

        <FeatureGrid features={FEATURES} className="mt-14 lg:mt-20" />
      </div>
    </section>
  )
}
