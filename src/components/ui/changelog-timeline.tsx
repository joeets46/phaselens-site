import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { Check, ChevronDown, GitCommitVertical } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Vertical timeline of expandable rows with a tag per row, a status bar on top and a
 * history link at the bottom. Structure adapted from the 21st.dev "changelog-timeline"
 * component; its demo content, hover preview, pinning and autoplay are left out.
 *
 * One row is open at a time. Click, Enter or Space toggles a row; Up, Down, Home and End
 * move between rows; Escape closes the open row. Closed rows are `inert`, so their text
 * is out of the tab order and hidden from screen readers. With prefers-reduced-motion
 * nothing animates.
 */

export interface TimelineEntry {
  id: string
  /** Short label before the title, e.g. "M12". */
  marker: string
  title: string
  /** Small chip after the marker, e.g. "complete". */
  tag: string
  body: ReactNode
}

export interface ChangelogTimelineProps {
  entries: readonly TimelineEntry[]
  /** Bar above the rows. */
  status?: ReactNode
  historyHref?: string
  historyLabel?: string
  /** Id of the row that starts open. */
  defaultOpen?: string | null
  className?: string
}

export function ChangelogTimeline({
  entries,
  status,
  historyHref,
  historyLabel = "Full commit history",
  defaultOpen = null,
  className,
}: ChangelogTimelineProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen)
  const listRef = useRef<HTMLOListElement>(null)
  const baseId = useId()

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Escape") {
      if (openId !== null) {
        event.preventDefault()
        setOpenId(null)
      }
      return
    }
    const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0
    if (!step && event.key !== "Home" && event.key !== "End") return
    event.preventDefault()
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("[data-trigger]") ?? [])
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + step + buttons.length) % buttons.length
    buttons[next]?.focus()
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border border-chalk/10 bg-navy-800", className)}>
      {status && (
        <div className="border-b border-chalk/10 px-4 py-3 sm:px-5">
          <div className="rounded-lg border border-chalk/10 bg-navy-950/50 px-3 py-2 text-xs text-haze sm:text-[0.8125rem]">
            {status}
          </div>
        </div>
      )}

      <ol ref={listRef} className="px-3 py-3 sm:px-4">
        {entries.map((entry, index) => {
          const open = openId === entry.id
          const last = index === entries.length - 1
          const triggerId = `${baseId}-trigger-${index}`
          const bodyId = `${baseId}-body-${index}`
          return (
            <li key={entry.id} data-open={open} className="group/row relative">
              {/* Rail: from this node down to the next one; green while this row is open */}
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-5 -bottom-5 left-[9px] w-0.5 bg-chalk/15",
                    "transition-colors duration-300 motion-reduce:transition-none",
                    "group-data-[open=true]/row:bg-pitch-500",
                  )}
                />
              )}

              <div
                className={cn(
                  "rounded-lg transition-colors duration-200 motion-reduce:transition-none",
                  "group-data-[open=true]/row:bg-chalk/[0.06]",
                )}
              >
                <button
                  type="button"
                  id={triggerId}
                  data-trigger
                  aria-expanded={open}
                  aria-controls={bodyId}
                  onClick={() => setOpenId(open ? null : entry.id)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className={cn(
                    "grid w-full cursor-pointer grid-cols-[20px_2rem_1fr_16px] items-center gap-x-2 gap-y-1 rounded-lg py-2 pr-2 text-left",
                    "sm:grid-cols-[20px_2.5rem_6.5rem_1fr_16px] sm:gap-x-3 sm:py-2.5 sm:pr-3",
                    "outline-none hover:bg-chalk/5 focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-inset",
                    "transition-colors duration-200 motion-reduce:transition-none",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="relative z-10 col-start-1 row-start-1 flex size-5 items-center justify-center"
                  >
                    <span
                      className={cn(
                        "size-2 rounded-full ring-[3px] ring-navy-800 transition-[transform,background-color] duration-200 motion-reduce:transition-none",
                        open ? "scale-[1.5] bg-pitch-400" : "bg-haze/55",
                      )}
                    />
                  </span>

                  <span
                    className={cn(
                      "col-start-2 row-start-1 text-sm font-semibold tabular-nums transition-colors motion-reduce:transition-none",
                      open ? "text-pitch-400" : "text-haze",
                    )}
                  >
                    {entry.marker}
                  </span>

                  <span
                    className={cn(
                      "col-start-3 row-start-1 inline-flex items-center gap-1 justify-self-start rounded border px-1.5 py-px text-[0.6875rem] font-medium lowercase sm:col-start-3",
                      "transition-colors motion-reduce:transition-none",
                      open ? "border-pitch-500/40 bg-pitch-500/10 text-pitch-400" : "border-chalk/12 bg-chalk/5 text-haze",
                    )}
                  >
                    <Check aria-hidden="true" strokeWidth={2.5} className="size-3" />
                    {entry.tag}
                  </span>

                  <span
                    className={cn(
                      "col-span-3 col-start-2 row-start-2 text-[0.9375rem] leading-snug text-pretty sm:col-span-1 sm:col-start-4 sm:row-start-1 sm:text-base",
                      open ? "font-semibold text-chalk" : "font-medium text-chalk/90",
                    )}
                  >
                    {entry.title}
                  </span>

                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "col-start-4 row-start-1 size-4 justify-self-end text-haze transition-transform duration-200 motion-reduce:transition-none sm:col-start-5",
                      open && "rotate-180",
                    )}
                  />
                </button>

                <div
                  id={bodyId}
                  role="region"
                  aria-labelledby={triggerId}
                  inert={!open}
                  data-open={open}
                  className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[240ms] ease-out data-[open=true]:grid-rows-[1fr] motion-reduce:transition-none"
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="pr-4 pb-4 pl-[28px] sm:pl-[32px]">
                      <div className="max-w-[62ch] text-[0.9375rem] leading-relaxed text-pretty text-haze">{entry.body}</div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {historyHref && (
        <div className="border-t border-chalk/10 px-4 py-3 sm:px-5">
          <a
            href={historyHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm text-sm font-medium text-pitch-400 underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-4 focus-visible:ring-offset-navy-800"
          >
            <GitCommitVertical aria-hidden="true" className="size-4" />
            {historyLabel}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      )}
    </div>
  )
}
