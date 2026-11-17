import type { ComponentProps } from "react"
import { ArrowUpRight, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Two-column grid of linked cards: icon on the left, text, arrow bottom-right.
 * Adapted from the 21st.dev "feature-grid" component (illustrations swapped
 * for lucide line icons; links open in a new tab).
 */

export interface Feature {
  icon: LucideIcon
  title: string
  description: string
  href: string
}

export interface FeatureGridProps extends ComponentProps<"ul"> {
  features: Feature[]
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon

  return (
    <a
      href={feature.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex h-full items-start gap-5 rounded-lg border border-chalk/10 bg-navy-800 p-6 sm:gap-6 lg:p-8",
        "transition-[background-color,border-color,transform] duration-300 ease-out",
        "hover:border-pitch-500/40 hover:bg-[#152c48] motion-safe:hover:-translate-y-0.5",
        "outline-none focus-visible:border-pitch-500/60 focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900",
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-md bg-pitch-500/10 ring-1 ring-pitch-500/25 ring-inset">
        <Icon aria-hidden="true" strokeWidth={1.5} className="size-6 text-pitch-400" />
      </span>

      <span className="flex flex-1 flex-col self-stretch">
        <span className="text-xl leading-snug font-semibold text-chalk">{feature.title}</span>
        <span className="mt-2 max-w-[56ch] text-[0.9375rem] leading-relaxed text-haze">{feature.description}</span>
        <span className="mt-auto flex justify-end pt-5">
          <ArrowUpRight
            aria-hidden="true"
            strokeWidth={1.75}
            className="size-5 text-pitch-400/70 transition-[color,transform] duration-300 group-hover:text-pitch-400 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
          />
          <span className="sr-only">(opens in a new tab)</span>
        </span>
      </span>
    </a>
  )
}

export function FeatureGrid({ features, className, ...props }: FeatureGridProps) {
  if (features.length === 0) return null

  return (
    <ul role="list" className={cn("grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6", className)} {...props}>
      {features.map((feature) => (
        <li key={feature.href}>
          <FeatureCard feature={feature} />
        </li>
      ))}
    </ul>
  )
}
