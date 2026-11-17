import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react"

import { useInViewOnce } from "@/hooks/use-in-view-once"
import type { BandSizes } from "@/hooks/use-band-sizes"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import {
  MAX_SHAPE,
  RIDGES,
  SEGMENTS,
  SLOT_COUNT,
  minuteLabel,
  playedSlots,
  slotInfo,
  slotOf,
  snapToPeriod,
} from "@/lib/pressure-ridges"

/*
 * Terrain of pressure events: one ridge per knockout match (Euro 2024), the final in front,
 * all on one minute scale. Height is the count in that minute, lightly smoothed for shape only.
 * A ridge covers only the minutes its match actually played, one shape per period, so it ends
 * where the match ended. The exact count shows in a floating label on hover, tap or keyboard
 * focus. Nothing loops; the ridges rise once when scrolled into view (not with reduced motion).
 */

const BACK_FILL = [14, 32, 56] // navy, rgb
const FRONT_FILL = [13, 58, 49] // deep pitch green
const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t)
const mix = (t: number) => `rgb(${BACK_FILL.map((c, i) => lerp(c, FRONT_FILL[i], t)).join(",")})`

const DOT_PATTERNS = [
  { id: "sparse", step: 6, r: 0.7 },
  { id: "mid", step: 4.5, r: 0.85 },
  { id: "dense", step: 3.5, r: 1 },
] as const

const FINAL = RIDGES.length - 1
/** First and last played slot of each ridge. */
const SPANS = RIDGES.map((r) => {
  const played = playedSlots(r)
  return [played[0], played[played.length - 1]] as const
})
const EDGE_MASK = "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 22%, #000 55%)"

interface Selection {
  ridge: number
  slot: number
  viaKeyboard: boolean
}

const START: Selection = { ridge: FINAL, slot: slotOf(1, 0), viaKeyboard: true }

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, size] as const
}

export function PressureRidgeline({
  className,
  plotClassName = "h-28 sm:h-32 lg:h-44",
  band = null,
}: {
  className?: string
  plotClassName?: string
  /**
   * Makes this the page's fixed band: the plot is laid out once at `max` height and scaled
   * vertically from the bottom (min at the top of the page, mid through most of it, max over the
   * last screen). Only a transform changes while scrolling, so nothing is laid out again.
   */
  band?: BandSizes | null
}) {
  const [plotRef, { width, height }] = useSize<HTMLDivElement>()
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInViewOnce(rootRef, 0.25)
  const reducedMotion = usePrefersReducedMotion()
  const [selection, setSelection] = useState<Selection | null>(null)
  const [focused, setFocused] = useState(false)
  // How much the band is squashed vertically right now (1 when it is not a growing band).
  const [vs, setVs] = useState(1)
  const uid = useId().replace(/:/g, "")
  const hintId = `${uid}-hint`

  // A tap leaves no pointer behind, so the label stays until the next tap lands elsewhere.
  useEffect(() => {
    const away = (e: globalThis.PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setSelection((prev) => (prev?.viaKeyboard ? prev : null))
      }
    }
    document.addEventListener("pointerdown", away)
    return () => document.removeEventListener("pointerdown", away)
  }, [])

  useBandScale(plotRef, band)

  const readScale = () => {
    const el = plotRef.current
    return el && height > 0 ? el.getBoundingClientRect().height / height : 1
  }

  // While a label is showing and the page scrolls, keep it on its point.
  const showing = selection !== null
  useEffect(() => {
    if (!showing || !band) return
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const el = plotRef.current
        if (el && height > 0) setVs(el.getBoundingClientRect().height / height)
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [showing, band, height, plotRef])

  const geometry = useMemo(() => {
    if (width === 0 || height === 0) return null
    const slotW = width / SLOT_COUNT
    const amp = height * 0.62
    const bottom = height - 3
    const n = RIDGES.length
    // The highest the back ridge can sit while every ridge's tallest peak still clears the top edge.
    const top = Math.max(
      ...RIDGES.slice(0, -1).map((ridge, j) => {
        const peak = (Math.max(...ridge.shape) / MAX_SHAPE) * amp
        return (4 + peak - (bottom * j) / (n - 1)) / (1 - j / (n - 1))
      }),
    )
    const xs = Array.from({ length: SLOT_COUNT }, (_, s) => (s + 0.5) * slotW)
    const f = (v: number) => v.toFixed(1)
    const ridges = RIDGES.map((ridge, j) => {
      const base = top + ((bottom - top) * j) / (n - 1)
      const ys = ridge.shape.map((h) => base - (h / MAX_SHAPE) * amp)
      // One continuous shape from the match's first to its last played minute. The few unplayed
      // stoppage slots between two periods are bridged, because the periods are drawn back to back.
      const played = playedSlots(ridge)
      const first = played[0]
      const last = played[played.length - 1]
      let line = `M${f(first * slotW)} ${f(base)} L${f(xs[first])} ${f(ys[first])}`
      for (let k = 0; k < played.length - 1; k++) {
        const i = played[k]
        const next = played[k + 1]
        line += ` Q${f(xs[i])} ${f(ys[i])} ${f((xs[i] + xs[next]) / 2)} ${f((ys[i] + ys[next]) / 2)}`
      }
      line += ` L${f(xs[last])} ${f(ys[last])} L${f((last + 1) * slotW)} ${f(base)}`
      const runs = [{ line, area: `${line} L${f((last + 1) * slotW)} ${f(height)} L${f(first * slotW)} ${f(height)} Z` }]
      return { ys, runs }
    })
    return { slotW, xs, ridges }
  }, [width, height])

  const select = (ridge: number, slot: number, viaKeyboard: boolean) => {
    setVs(readScale())
    setSelection((prev) =>
      prev && prev.ridge === ridge && prev.slot === slot && prev.viaKeyboard === viaKeyboard
        ? prev
        : { ridge, slot, viaKeyboard },
    )
  }

  const onPointer = (e: PointerEvent<HTMLDivElement>) => {
    if (!geometry) return
    const rect = e.currentTarget.getBoundingClientRect()
    const slot = snapToPeriod(Math.floor((e.clientX - rect.left) / geometry.slotW))
    // The plot is squashed from its bottom edge; undo that to compare with the unsquashed crests.
    const scale = rect.height > 0 && height > 0 ? rect.height / height : 1
    const y = height - (rect.bottom - e.clientY) / scale
    // The ridge under the pointer is the nearest drawn one whose crest is above it.
    let hit = -1
    for (let j = FINAL; j >= 0; j--) {
      if (slot < SPANS[j][0] || slot > SPANS[j][1]) continue
      if (y >= geometry.ridges[j].ys[slot]) {
        hit = j
        break
      }
    }
    if (hit < 0 || RIDGES[hit].counts[slot] === null) setSelection(null)
    else select(hit, slot, false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const key = e.key
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "Escape"].includes(key)) return
    e.preventDefault()
    if (key === "Escape") {
      setSelection(null)
      return
    }
    const cur = selection ?? START
    const played = playedSlots(RIDGES[cur.ridge])
    let { ridge, slot } = cur
    if (key === "ArrowLeft") slot = played.filter((s) => s < slot).at(-1) ?? slot
    else if (key === "ArrowRight") slot = played.find((s) => s > slot) ?? slot
    else if (key === "Home") slot = played[0]
    else if (key === "End") slot = played.at(-1) ?? slot
    else {
      ridge = Math.max(0, Math.min(FINAL, ridge + (key === "ArrowUp" ? -1 : 1)))
      if (RIDGES[ridge].counts[slot] === null) {
        const next = playedSlots(RIDGES[ridge])
        slot = next.reduce((best, s) => (Math.abs(s - slot) < Math.abs(best - slot) ? s : best), next[0])
      }
    }
    select(ridge, slot, true)
  }

  const ridge = selection ? RIDGES[selection.ridge] : null
  const info = selection ? slotInfo(selection.slot) : null
  const count = selection && ridge ? ridge.counts[selection.slot] : null
  const labelTop = ridge && info ? `${ridge.stage} · ${ridge.label}` : ""
  const labelBottom =
    ridge && info && count !== null
      ? `${minuteLabel(info.period, info.minute)} · ${count} ${count === 1 ? "pressure" : "pressures"}`
      : ""
  const risen = inView || reducedMotion

  const px = geometry && selection ? geometry.xs[selection.slot] : 0
  const pyRaw = geometry && selection ? geometry.ridges[selection.ridge].ys[selection.slot] : 0
  // Where that point is on screen: squashed toward the bottom edge together with the band.
  const py = height - (height - pyRaw) * vs

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <div
        ref={plotRef}
        role="application"
        aria-roledescription="pressure ridgeline chart"
        aria-label="Pressure events per minute, one ridge per Euro 2024 knockout match, the final in front"
        aria-describedby={hintId}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onFocus={() => {
          setFocused(true)
          setSelection((prev) => prev ?? START)
        }}
        onBlur={() => {
          setFocused(false)
          setSelection((prev) => (prev?.viaKeyboard ? null : prev))
        }}
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") setSelection((prev) => (prev?.viaKeyboard ? prev : null))
        }}
        style={
          band
            ? ({
                height: band.max,
                "--s-min": band.min / band.max,
                "--s-mid": band.mid / band.max,
                "--s-gain": band.max / band.mid,
              } as CSSProperties)
            : undefined
        }
        className={`relative w-full cursor-crosshair touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-inset ${
          band ? "band-grow pointer-events-auto origin-bottom" : plotClassName
        }`}
      >
        {band ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[calc(100%+1.5rem)] bg-gradient-to-t from-navy-950 via-navy-950/75 to-transparent"
          />
        ) : null}
        {geometry ? (
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="block"
            style={{ maskImage: EDGE_MASK, WebkitMaskImage: EDGE_MASK }}
            aria-hidden="true"
          >
            <defs>
              {DOT_PATTERNS.map((p) => (
                <pattern key={p.id} id={`${uid}-${p.id}`} width={p.step} height={p.step} patternUnits="userSpaceOnUse">
                  <circle cx={p.step / 2} cy={p.step / 2} r={p.r} fill="#5cc985" />
                </pattern>
              ))}
            </defs>

            {/* A faint divider where one period gives way to the next */}
            {SEGMENTS.slice(1).map((seg) => (
              <line
                key={seg.period}
                x1={seg.start * geometry.slotW}
                x2={seg.start * geometry.slotW}
                y1={0}
                y2={height}
                stroke="#eef1ec"
                strokeOpacity={0.12}
              />
            ))}

            {RIDGES.map((r, j) => {
              const t = j / FINAL
              const g = geometry.ridges[j]
              const isFinal = j === FINAL
              const active = selection?.ridge === j
              const dimmed = selection !== null && !active
              return (
                <g
                  key={r.matchId}
                  style={{
                    opacity: risen ? 1 : 0,
                    transform: risen ? "none" : "translateY(10px)",
                    transition: reducedMotion
                      ? "none"
                      : "opacity 0.8s ease-out, transform 0.9s cubic-bezier(0.2,0.7,0.2,1)",
                    transitionDelay: reducedMotion ? "0s" : `${(FINAL - j) * 55}ms`,
                  }}
                >
                  {g.runs.map((run, k) => (
                    <g key={k}>
                      <path d={run.area} fill={mix(t)} />
                      <path
                        d={run.area}
                        fill={`url(#${uid}-${DOT_PATTERNS[t < 0.34 ? 0 : t < 0.67 ? 1 : 2].id})`}
                        fillOpacity={0.1 + 0.22 * t}
                      />
                      <path
                        d={run.line}
                        fill="none"
                        stroke={isFinal || active ? "#5cc985" : "#a9b6c6"}
                        strokeOpacity={isFinal || active ? 1 : dimmed ? 0.22 : 0.3 + 0.35 * t}
                        strokeWidth={isFinal || active ? 1.5 : 1}
                        strokeLinejoin="round"
                      />
                    </g>
                  ))}
                </g>
              )
            })}
          </svg>
        ) : null}
      </div>

      {selection && geometry && labelBottom ? (
        <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
          <span className="absolute w-px bg-chalk/70" style={{ left: px, top: py - 16, height: 16 }} />
          <span
            className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-chalk bg-navy-950"
            style={{ left: px, top: py }}
          />
          <span
            className="absolute -translate-x-1/2 -translate-y-full rounded-md border border-chalk/15 bg-navy-900/95 px-2.5 py-1.5 text-center text-xs leading-tight whitespace-nowrap text-chalk tabular-nums shadow-lg shadow-navy-950/60"
            style={{ left: Math.max(100, Math.min(width - 100, px)), top: py - 16 }}
          >
            <span className="block text-haze">{labelTop}</span>
            <span className="block font-semibold">{labelBottom}</span>
          </span>
        </div>
      ) : null}

      <p aria-live={focused ? "polite" : "off"} className="sr-only">
        {labelBottom ? `${labelTop} · ${labelBottom}` : ""}
      </p>
      <p id={hintId} className="sr-only">
        Left and right arrows move through the minutes of one match. Up and down arrows move to the match behind or in
        front. Home and End jump to the first and last minute. Escape clears the readout.
      </p>
    </div>
  )
}

/**
 * Fallback for browsers without scroll-driven animations (CSS in index.css does it otherwise):
 * the same two scales, written straight to the element on scroll, no React renders.
 */
function useBandScale(ref: RefObject<HTMLDivElement | null>, band: BandSizes | null) {
  useEffect(() => {
    const el = ref.current
    if (!el || !band || band.min === band.max) return
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline", "scroll()")) return
    const s0 = band.min / band.max
    const s1 = band.mid / band.max
    const gain = band.max / band.mid
    let raf = 0
    const apply = () => {
      raf = 0
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const p = Math.min(1, Math.max(0, window.scrollY / maxScroll))
      const q = Math.min(1, Math.max(0, (window.scrollY - (maxScroll - window.innerHeight)) / window.innerHeight))
      el.style.transformOrigin = "50% 100%"
      el.style.transform = `scaleY(${s0 + (s1 - s0) * p})`
      el.style.scale = `1 ${1 + (gain - 1) * (q * q * (3 - 2 * q))}`
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }
    apply()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      cancelAnimationFrame(raf)
    }
  }, [ref, band])
}
