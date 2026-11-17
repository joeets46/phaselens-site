import { useRef, type CSSProperties } from "react"

import { useInViewOnce } from "@/hooks/use-in-view-once"
import { cn } from "@/lib/utils"

const LAYERS = [
  { name: "Raw", line: "Byte-for-byte copies of the source files, never modified" },
  { name: "Provenance", line: "Manifests: where each file came from, its SHA-256, size and retrieval time" },
  { name: "Profile", line: "What each match's files actually contain" },
  { name: "Metrics", line: "Catalogued event counts per player, as CSV and JSON" },
  { name: "Analytical", line: "Typed Parquet, queried with DuckDB" },
  { name: "Dashboard", line: "A local, read-only Streamlit app" },
] as const

const BRANCH_LABEL = "360° frames → spatial context (one row per event)"
const DATA_MODEL_URL = "https://github.com/joeets46/phaselens/blob/main/docs/data_model.md"

/* Draw-in timing: the rail is drawn one segment at a time, then the branch. */
const SEGMENT_MS = 220
const RAIL_MS = SEGMENT_MS * (LAYERS.length - 1)

/*
 * Hidden-until-drawn states only apply with motion-safe, so with
 * prefers-reduced-motion everything renders fully drawn and static.
 * The wrapper carries data-drawn="false" until it scrolls into view.
 */
const HIDE_SEGMENT =
  "motion-safe:group-data-[drawn=false]:max-xl:scale-y-0 motion-safe:group-data-[drawn=false]:xl:scale-x-0"
const HIDE_DOT = "motion-safe:group-data-[drawn=false]:scale-50 motion-safe:group-data-[drawn=false]:opacity-0"
const HIDE_BRANCH = "motion-safe:group-data-[drawn=false]:[clip-path:inset(0_100%_0_0)]"

const delay = (ms: number): CSSProperties => ({ transitionDelay: `${ms}ms` })

export default function ArchitectureSection() {
  const flowRef = useRef<HTMLDivElement>(null)
  const drawn = useInViewOnce(flowRef, 0.35)

  return (
    <section id="architecture" aria-labelledby="architecture-heading" className="bg-navy-900 py-24 text-chalk lg:py-32">
      <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-pitch-400 [font-stretch:125%]">HOW IT'S BUILT</p>
        <h2
          id="architecture-heading"
          className="mt-4 max-w-[22ch] text-[clamp(2.25rem,4.2vw,4rem)] leading-[1.02] font-bold tracking-[-0.01em] text-balance [font-stretch:75%]"
        >
          Every derived layer can be rebuilt from the raw files
        </h2>

        <div ref={flowRef} data-drawn={drawn} className="group relative mt-14 lg:mt-20">
          {/* BRANCH (wide screens): from Raw's node, under the flow, up into Dashboard's node */}
          <div
            aria-hidden="true"
            style={delay(RAIL_MS)}
            className={cn(
              "pointer-events-none absolute top-[7px] bottom-0 left-[7px] hidden rounded-b-xl border-x border-b border-dashed border-pitch-500 xl:block",
              // Explicit drawn state: clip-path can't transition to or from `none`.
              "right-[calc(100%/6_-_7px)] [clip-path:inset(0_0_0_0)] motion-safe:transition-[clip-path] motion-safe:duration-700 motion-safe:ease-out",
              HIDE_BRANCH,
            )}
          />
          {/* Branch label sits on the branch's bottom line (outside the clipped box, so it isn't cut) */}
          <span
            aria-hidden="true"
            style={delay(RAIL_MS + 450)}
            className={cn(
              "absolute bottom-0 left-[calc(500%/12_+_7px)] hidden -translate-x-1/2 translate-y-1/2 bg-navy-900 px-4 text-sm whitespace-nowrap text-haze xl:block",
              "motion-safe:transition-opacity motion-safe:duration-500",
              "motion-safe:group-data-[drawn=false]:opacity-0",
            )}
          >
            {BRANCH_LABEL}
          </span>

          <ol className="relative grid grid-cols-1 xl:grid-cols-6 xl:pb-24">
            {LAYERS.map((layer, i) => {
              const last = i === LAYERS.length - 1
              return (
                <li key={layer.name} className="relative pb-10 pl-9 last:pb-0 xl:pr-6 xl:pb-0 xl:pl-0">
                  {/* Connector to the next node: down on narrow screens, right on wide */}
                  {!last && (
                    <span
                      aria-hidden="true"
                      style={delay(i * SEGMENT_MS)}
                      className={cn(
                        "absolute top-[7px] left-[7px] h-full w-px bg-pitch-500/80 max-xl:origin-top xl:h-px xl:w-full xl:origin-left",
                        "motion-safe:transition-transform motion-safe:duration-[220ms] motion-safe:ease-linear",
                        HIDE_SEGMENT,
                      )}
                    />
                  )}
                  {/* Node */}
                  <span
                    aria-hidden="true"
                    style={delay(i * SEGMENT_MS)}
                    className={cn(
                      "absolute top-0 left-0 size-3.5 rounded-full border-2 border-pitch-500 bg-navy-900",
                      "motion-safe:transition-[opacity,scale] motion-safe:duration-300",
                      HIDE_DOT,
                    )}
                  />
                  <div className="xl:pt-8 xl:pl-7">
                    <h3 className="-mt-1 text-lg leading-snug font-semibold text-chalk xl:mt-0">{layer.name}</h3>
                    <p className="mt-1.5 max-w-[34ch] text-[0.9375rem] leading-relaxed text-pretty text-haze xl:max-w-[24ch]">
                      {layer.line}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>

          {/* BRANCH (narrow screens): a short dashed rail of its own */}
          <div className="mt-12 xl:hidden">
            <div className="relative pl-9">
              <span
                aria-hidden="true"
                style={delay(RAIL_MS)}
                className={cn(
                  "absolute top-[7px] bottom-[7px] left-[7px] border-l border-dashed border-pitch-500 max-xl:origin-top",
                  "motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out",
                  "motion-safe:group-data-[drawn=false]:scale-y-0",
                )}
              />
              <span aria-hidden="true" className="absolute top-0 left-0 size-3.5 rounded-full border-2 border-dashed border-pitch-500/70 bg-navy-900" />
              <span aria-hidden="true" className="absolute bottom-0 left-0 size-3.5 rounded-full border-2 border-dashed border-pitch-500/70 bg-navy-900" />
              <p className="-mt-1 text-sm text-haze">From Raw</p>
              <p className="my-4 text-[0.9375rem] leading-relaxed text-chalk">{BRANCH_LABEL}</p>
              <p className="text-sm text-haze">Into Dashboard</p>
            </div>
          </div>

          {/* Wide screens: the drawn branch is decorative, so screen readers get it in words.
              Narrow screens already show it as text above. */}
          <p className="hidden xl:block xl:sr-only">Side branch from Raw, joining Dashboard: {BRANCH_LABEL}</p>
        </div>

        <p className="mt-14 text-sm leading-relaxed text-haze/80 xl:mt-16">
          Every run is pinned to one upstream commit of StatsBomb Open Data. Raw data is never committed.
        </p>

        <a
          href={DATA_MODEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-sm text-sm font-medium text-pitch-400 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-4 focus-visible:ring-offset-navy-900"
        >
          Read the data model →<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </section>
  )
}
