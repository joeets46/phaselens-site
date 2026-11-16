import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

/**
 * Full-bleed hero: looping background video under a navy gradient, a navigation
 * bar and a single call to action.
 *
 * Structure adapted from the "Elsewhere" hero by Guglielmo Giannattasio on 21st.dev
 * (day/night footage, Web Audio soundscape and their toggles removed).
 */

export interface HeroLink {
  label: string
  href: string
}

export interface PhaseLensHeroProps {
  videoSrc?: string
  posterSrc?: string
  /** Where the video is anchored when cropped — keeps the player in frame on narrow screens. */
  objectPosition?: string
  brand?: string
  links?: HeroLink[]
  navCta?: HeroLink
  headline?: string
  subline?: string
  primaryCta?: HeroLink
  className?: string
}

const GITHUB_URL = "https://github.com/joeets46"

const DEFAULT_LINKS: HeroLink[] = [
  { label: "Overview", href: "#overview" },
  { label: "Architecture", href: "#architecture" },
  { label: "Milestones", href: "#milestones" },
]

export default function PhaseLensHero({
  videoSrc = "/assets/hero-video.mp4",
  posterSrc = "/assets/hero-poster.jpg",
  objectPosition = "60% 50%",
  brand = "PHASELENS",
  links = DEFAULT_LINKS,
  navCta = { label: "GitHub", href: GITHUB_URL },
  headline = "PhaseLens",
  subline = "A football analytics data platform built on StatsBomb Open Data — reproducible, tested, and honest about what the data can say.",
  primaryCta = { label: "View on GitHub", href: GITHUB_URL },
  className,
}: PhaseLensHeroProps) {
  const reducedMotion = usePrefersReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)

  // React sets `muted` as a property, not an attribute, which some browsers
  // ignore when deciding whether autoplay is allowed. Set it and start playback explicitly.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.defaultMuted = true
    video.muted = true
    video.play().catch(() => {
      // Autoplay blocked (e.g. power saving) — the poster stays visible.
    })
  }, [reducedMotion])

  return (
    <section
      aria-label="Introduction"
      className={cn(
        "relative isolate flex min-h-[max(100svh,600px)] w-full max-w-none flex-col overflow-hidden bg-navy-900 text-chalk",
        className,
      )}
    >
      {/* BACKGROUND — video, or the still poster when reduced motion is requested */}
      {reducedMotion ? (
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full max-w-none object-cover"
          style={{ objectPosition }}
        />
      ) : (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 -z-20 h-full w-full max-w-none object-cover"
          style={{ objectPosition }}
        />
      )}

      {/* OVERLAY — deepest at the top and left, where the copy sits over the night sky */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(180deg,rgb(7_18_34/0.88)_0%,rgb(11_26_46/0.6)_32%,rgb(11_26_46/0.12)_62%,rgb(7_18_34/0.7)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden h-full w-full bg-[linear-gradient(90deg,rgb(7_18_34/0.78)_0%,rgb(7_18_34/0.45)_38%,transparent_66%)] md:block"
      />

      {/* CONTENT — the only width-capped layer; background and overlays stay full-bleed */}
      <div className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col">
        {/* NAVIGATION */}
        <header className="flex items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-12 lg:py-7">
          <a
            href="#"
            className="rounded-sm text-sm font-semibold tracking-[0.2em] text-chalk [font-stretch:125%] outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-4 focus-visible:ring-offset-navy-900"
          >
            {brand}
          </a>

          <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative rounded-sm py-1 text-[0.9375rem] text-chalk/80 outline-none transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-pitch-500 after:transition-transform after:duration-300 hover:text-chalk hover:after:scale-x-100 focus-visible:text-chalk focus-visible:after:scale-x-100 motion-reduce:after:transition-none"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Button
            asChild
            variant="outline"
            className="h-10 gap-2 rounded-md border-chalk/25 bg-navy-950/40 px-4 text-sm text-chalk backdrop-blur-md hover:border-chalk/45 hover:bg-navy-950/60 hover:text-chalk dark:border-chalk/25 dark:bg-navy-950/40 dark:hover:bg-navy-950/60"
          >
            <a href={navCta.href} target="_blank" rel="noopener noreferrer">
              <GitHubMark className="size-4" />
              {navCta.label}
            </a>
          </Button>
        </header>

        {/* COPY */}
        <div className="flex flex-1 flex-col px-5 pt-[clamp(2rem,9vh,7rem)] sm:px-8 lg:px-12 motion-safe:animate-hero-in">
          <h1 className="-ml-[0.04em] text-[clamp(4.5rem,21vw,15rem)] leading-[0.82] font-extrabold tracking-[-0.015em] text-chalk [font-stretch:62%] [text-shadow:0_2px_40px_rgb(7_18_34/0.35)]">
            {headline}
          </h1>

          <p className="mt-6 max-w-[42ch] text-[clamp(1rem,1.35vw,1.1875rem)] leading-relaxed text-chalk/85 [text-shadow:0_1px_18px_rgb(7_18_34/0.5)] sm:mt-8">
            {subline}
          </p>

          <div className="mt-8 sm:mt-10">
            <Button
              asChild
              className="h-12 gap-2.5 rounded-md bg-pitch-500 px-5 text-base font-semibold text-navy-950 shadow-[0_8px_30px_-8px_rgb(63_179_107/0.55)] hover:bg-pitch-400 focus-visible:ring-pitch-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
            >
              <a href={primaryCta.href} target="_blank" rel="noopener noreferrer">
                <GitHubMark className="size-[18px]" />
                {primaryCta.label}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

/** GitHub's mark — lucide-react 1.x no longer ships brand icons. */
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}
