import type { ReactNode } from "react"

/*
 * Points from "Known limitations" in phaselens docs/project_brief.md (main at ce4e624), each
 * shortened to one plain sentence with the meaning kept as it is. The sixth point of the docs
 * makes two separate claims, so it is split in two (6a, 6b). The muted line under the list
 * is checked against the README status paragraph and the brief's "There is no rating, ranking".
 */
const DATA_TERMS_URL = "https://github.com/joeets46/phaselens/blob/main/docs/data_sources.md"

const LIMITS: readonly { id: string; text: ReactNode }[] = [
  {
    id: "one-tournament",
    text: "Fifteen knockout matches from one tournament support developing the pipeline, but not conclusions about players or teams.",
  },
  {
    id: "annotators",
    text: "Human annotators record the event data using the provider's definitions, and those definitions set the limit on what any metric can mean.",
  },
  {
    id: "no-validation",
    text: "No parameter in this project has been validated against tracking data or expert judgement.",
  },
  {
    id: "terms",
    text: (
      <>
        The source data may not be redistributed or used commercially, and published analysis must{" "}
        <a
          href={DATA_TERMS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm text-pitch-400 underline underline-offset-4 outline-none hover:text-chalk focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
        >
          credit StatsBomb<span className="sr-only"> (data terms, opens in a new tab)</span>
        </a>
        .
      </>
    ),
  },
  {
    id: "raw-totals",
    text: "Totals across matches are raw event counts, not adjusted for playing time, number of matches, or opportunities.",
  },
  {
    id: "schema-profile",
    text: "The written schema profile describes only the final; the profiler also ran on all fifteen matches, and the extra event types and fields it found are listed at the end of that profile.",
  },
  {
    id: "provider-docs",
    text: "The provider's definitions come from 2019 documents that do not cover every field in the files.",
  },
  {
    id: "implemented-metrics",
    text: "The implemented metrics are plain event counts, computed per match for the fifteen pilot matches, with no adjustment for playing time and no validation for football meaning.",
  },
]

export default function LimitationsSection() {
  return (
    <section id="limitations" aria-labelledby="limitations-heading" className="bg-navy-900 py-24 text-chalk lg:py-32">
      <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-pitch-400 [font-stretch:125%]">KNOWN LIMITS</p>
        <h2
          id="limitations-heading"
          className="mt-4 max-w-[22ch] text-[clamp(2.25rem,4.2vw,4rem)] leading-[1.02] font-bold tracking-[-0.01em] text-balance [font-stretch:75%]"
        >
          What this project does not claim
        </h2>

        {/* Reads down the first column, then the second, on wide screens */}
        <ul role="list" className="mt-14 space-y-7 lg:mt-20 lg:columns-2 lg:gap-x-20 lg:space-y-0">
          {LIMITS.map((limit) => (
            <li key={limit.id} className="flex gap-4 lg:mb-8 lg:break-inside-avoid">
              <span aria-hidden="true" className="mt-[0.78em] h-0.5 w-3 shrink-0 rounded-full bg-haze/60" />
              <p className="text-[1.0625rem] leading-relaxed text-pretty text-chalk/90">{limit.text}</p>
            </li>
          ))}
        </ul>

        <p className="mt-14 border-t border-chalk/10 pt-6 text-sm leading-relaxed text-haze/80 lg:mt-16">
          No player is rated or ranked. Counts are tested for correctness, not validated for football meaning.
        </p>
      </div>
    </section>
  )
}
