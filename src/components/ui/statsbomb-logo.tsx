import { cn } from "@/lib/utils"

/**
 * Hudl StatsBomb logo (reversed version from the official media pack), shown
 * unmodified and linked to the open-data repository, as the StatsBomb Open Data
 * terms ask for published work. Size it with `className` (height); the width
 * follows the file's own aspect ratio. Keep clear space around it.
 *
 * The source file is 2258x344, so it stays sharp on 2x screens at any height up
 * to about 170 px.
 */

const OPEN_DATA_URL = "https://github.com/hudl/open-data"

export function StatsBombLogo({ className }: { className?: string }) {
  return (
    <a
      href={OPEN_DATA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-4 focus-visible:ring-offset-navy-900",
        className,
      )}
    >
      <img
        src="/assets/brand/hudl-statsbomb-logo-reversed.png"
        width={2258}
        height={344}
        alt="Hudl StatsBomb"
        loading="lazy"
        decoding="async"
        className="block h-7 w-auto"
      />
      <span className="sr-only"> — StatsBomb Open Data on GitHub (opens in a new tab)</span>
    </a>
  )
}
