import type { ReactNode } from "react"

import { PressureRidgeline } from "@/components/ui/pressure-ridgeline"
import { StatsBombLogo } from "@/components/ui/statsbomb-logo"

const REPO = "https://github.com/joeets46/phaselens"
/** Not set yet: the LinkedIn item shows as plain text until there is a profile URL. */
const LINKEDIN_URL: string | null = null

const LINK_CLASS =
  "rounded-sm text-chalk/90 underline decoration-chalk/25 underline-offset-4 outline-none transition-colors hover:text-pitch-400 hover:decoration-pitch-400 focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-4 focus-visible:ring-offset-navy-950"

const GROUPS: readonly { title: string; links: readonly { label: string; href: string | null }[] }[] = [
  {
    title: "Project",
    links: [
      { label: "GitHub repository", href: REPO },
      { label: "Data model", href: `${REPO}/blob/main/docs/data_model.md` },
      { label: "Metric catalog", href: `${REPO}/blob/main/docs/metric_catalog.md` },
      { label: "Licenses", href: "/third-party-notices.txt" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "GitHub: joeets46", href: "https://github.com/joeets46" },
      { label: "LinkedIn", href: LINKEDIN_URL },
    ],
  },
]

function FooterLink({ label, href }: { label: string; href: string | null }): ReactNode {
  if (!href) return <span className="text-haze/60">{label}</span>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
      {label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

/** `ridges` puts the ridge landscape inside the footer; otherwise the page carries it as a fixed band. */
export default function SiteFooter({ ridges = false }: { ridges?: boolean }) {
  return (
    <footer aria-labelledby="footer-heading" className="overflow-hidden bg-navy-950 pt-10 text-chalk lg:pt-12">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-start lg:justify-between lg:px-12">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <p className="text-2xl leading-none font-bold tracking-[-0.01em] [font-stretch:75%]">PhaseLens</p>
          <StatsBombLogo />
        </div>
        <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
          {GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-xs font-semibold tracking-[0.2em] text-haze uppercase [font-stretch:125%]">{group.title}</h3>
              <ul role="list" className="mt-3 flex flex-col gap-2.5 text-[0.9375rem] sm:flex-row sm:gap-6">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink {...link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {ridges ? <PressureRidgeline className="mt-6" plotClassName="h-28 sm:h-[clamp(7rem,calc(38vh-10.5rem),18rem)]" /> : null}

      <div className={`mx-auto flex w-full max-w-[100rem] flex-col gap-1.5 px-5 py-5 text-xs leading-relaxed text-haze/70 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 sm:px-8 lg:px-12 ${ridges ? "" : "mt-6"}`}>
        <p>© 2026 Yusif Aslanov · Data: StatsBomb Open Data · Non-commercial</p>
        <p className="sm:text-right">Each ridge is one knockout match: pressure events per minute. Data: StatsBomb Open Data.</p>
      </div>
    </footer>
  )
}
