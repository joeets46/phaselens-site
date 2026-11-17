import { Fragment } from "react"

import { ChangelogTimeline, type TimelineEntry } from "@/components/ui/changelog-timeline"
import { MILESTONES } from "@/data/milestones"

/*
 * Status bar facts, checked against phaselens README.md and docs/project_brief.md (main at ce4e624):
 * the pinned StatsBomb open-data commit is 4b73468fc5b0f1950f9f66fada70ad3a4f9327cb, and the
 * knockout stage of Euro 2024 is fifteen matches.
 */
const SOURCE_COMMIT = "4b73468"
const COMMITS_URL = "https://github.com/joeets46/phaselens/commits/main"

/** Renders the docs' markdown inline code (`like this`) as code, leaving all other text as written. */
function DoneWhen({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded bg-chalk/10 px-1.5 py-0.5 font-mono text-[0.85em] text-chalk">
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}

const ENTRIES: readonly TimelineEntry[] = MILESTONES.map((m) => ({
  id: m.id,
  marker: m.id,
  title: m.goal,
  tag: "complete",
  body: <DoneWhen text={m.doneWhen} />,
}))

export default function MilestonesSection() {
  return (
    <section id="milestones" aria-labelledby="milestones-heading" className="bg-navy-900 py-24 text-chalk lg:py-32">
      <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          {/* Sticky on wide screens, so the heading stays in view beside the long list */}
          <div className="lg:sticky lg:top-16 lg:col-span-5 lg:self-start">
            <p className="text-xs font-semibold tracking-[0.2em] text-pitch-400 [font-stretch:125%]">
              BUILT MILESTONE BY MILESTONE
            </p>
            <h2
              id="milestones-heading"
              className="mt-4 max-w-[20ch] text-[clamp(2.25rem,4.2vw,4rem)] leading-[1.02] font-bold tracking-[-0.01em] text-balance [font-stretch:75%]"
            >
              Each step started only after the previous one was approved
            </h2>
          </div>

          <div className="lg:col-span-7">
            <ChangelogTimeline
              entries={ENTRIES}
              defaultOpen={MILESTONES[0].id}
              status={
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-chalk">source</span>
                  <span aria-hidden="true">/</span>
                  <span>open-data@{SOURCE_COMMIT}</span>
                  <span aria-hidden="true">·</span>
                  <span>15 matches</span>
                  <span aria-hidden="true">·</span>
                  <span>Euro 2024 knockout stage</span>
                </p>
              }
              historyHref={COMMITS_URL}
              historyLabel="Full commit history →"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
