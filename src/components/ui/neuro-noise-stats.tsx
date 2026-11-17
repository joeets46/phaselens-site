import { useEffect, useRef, useState, type ComponentProps } from "react"
import { NeuroNoise } from "@paper-design/shaders-react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

/**
 * Stats band over a slowly drifting shader haze. Numbers count up once when the
 * band scrolls into view. Adapted from the 21st.dev "neuro-noise-stats" component.
 *
 * Reduced motion: final numbers immediately and a still background frame.
 * The shader pauses itself while off screen or in a hidden tab.
 */

export interface Stat {
  value: number
  label: string
}

export interface NeuroNoiseStatsProps extends ComponentProps<"section"> {
  eyebrow: string
  title: string
  stats: Stat[]
  colorBack?: string
  /** Color of the haze's glow. */
  colorMid?: string
  /** Color of the brightest fibers. */
  colorFront?: string
  speed?: number
  /** Count-up duration in milliseconds. */
  countDuration?: number
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

/** 0 → 1 once, starting the first time `ref` is at least `threshold` visible. */
function useCountProgress(ref: React.RefObject<HTMLElement | null>, duration: number, threshold = 0.35) {
  // Without IntersectionObserver there is no trigger, so show the final numbers.
  const [progress, setProgress] = useState(() => (typeof IntersectionObserver === "undefined" ? 1 : 0))

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return

    let raf = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          setProgress(easeOutCubic(t))
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [ref, duration, threshold])

  return progress
}

export function NeuroNoiseStats({
  eyebrow,
  title,
  stats,
  colorBack = "#0b1a2e",
  colorMid = "#1f7a4a",
  colorFront = "#a9dcb8",
  speed = 0.35,
  countDuration = 1400,
  className,
  style,
  ...props
}: NeuroNoiseStatsProps) {
  const reducedMotion = usePrefersReducedMotion()
  const statsRef = useRef<HTMLDListElement>(null)
  const animated = useCountProgress(statsRef, countDuration)
  const progress = reducedMotion ? 1 : animated
  const headingId = props.id ? `${props.id}-heading` : undefined

  return (
    <section
      data-slot="neuro-noise-stats"
      aria-labelledby={headingId}
      className={cn("relative isolate w-full overflow-hidden pt-16 pb-24 text-chalk lg:pt-20 lg:pb-32", className)}
      style={{ backgroundColor: colorBack, ...style }}
      {...props}
    >
      {/* Floodlight haze — fades out towards the heading and into the next section */}
      <NeuroNoise
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full opacity-55 mask-t-from-35% mask-t-to-95% mask-b-from-85%"
        colorBack={colorBack}
        colorMid={colorMid}
        colorFront={colorFront}
        brightness={0.03}
        contrast={0.3}
        scale={0.8}
        speed={reducedMotion ? 0 : speed}
        frame={0}
        // Soft haze needs no high-DPI detail; cap the canvas to keep GPU work low.
        minPixelRatio={1}
        maxPixelCount={1920 * 1080}
      />

      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-14 px-5 sm:px-8 lg:gap-20 lg:px-12">
        <div className="flex max-w-3xl flex-col">
          <p className="text-xs font-semibold tracking-[0.2em] text-pitch-400 [font-stretch:125%]">{eyebrow}</p>
          <h2
            id={headingId}
            className="mt-4 text-[clamp(2.25rem,4.2vw,4rem)] leading-[1.02] font-bold tracking-[-0.01em] text-balance [font-stretch:75%]"
          >
            {title}
          </h2>
        </div>

        <dl ref={statsRef} className="grid grid-cols-2 border-t border-chalk/15 lg:grid-cols-4">
          {stats.map((stat) => (
            // Label first for screen readers, number first on screen.
            <div
              key={stat.label}
              className="flex flex-col-reverse justify-end gap-3 border-chalk/15 py-8 pr-4 not-first:border-l not-first:pl-4 sm:pr-6 sm:not-first:pl-6 lg:py-10 max-lg:nth-3:border-l-0 max-lg:nth-3:pl-0 max-lg:nth-[n+3]:border-t"
            >
              <dt className="max-w-[24ch] text-sm leading-snug text-pretty text-haze sm:text-base">{stat.label}</dt>
              <dd className="text-[clamp(3.5rem,7.5vw,7.5rem)] leading-[0.85] font-extrabold tracking-[-0.01em] text-chalk tabular-nums [font-stretch:62%]">
                <span className="sr-only">{stat.value}</span>
                {/* The final value reserves the width, so counting never shifts the layout */}
                <span aria-hidden="true" className="relative inline-block">
                  <span className="invisible">{stat.value}</span>
                  <span className="absolute inset-0">{Math.round(stat.value * progress)}</span>
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default NeuroNoiseStats
