import { BentoGallery, type GalleryRow } from "@/components/ui/bento-gallery"
import { StatsBombLogo } from "@/components/ui/statsbomb-logo"

/*
 * Screens captured from the PhaseLens dashboard (Streamlit, English UI) at a 1600 px
 * browser width and 2x pixel density, final of Euro 2024, Spain v England.
 * The 360° pitch and the spatial context card show John Stones's pressure at 22:04 in the first half.
 * Player table: Spain, with the tooltip of the "CP events" header.
 * Sizes are the files' real pixel sizes; they set the layout ratios.
 */
const ROWS: readonly GalleryRow[] = [
  [
    {
      src: "/assets/gallery/match-overview.webp",
      width: 2920,
      height: 1654,
      caption: "Match overview",
      alt: "Match overview in the PhaseLens dashboard for the Euro 2024 final, Spain 2–1 England, with paired comparison bars for pressure events (162 and 165), pressure events marked as counter-press (32 and 25) and counterpress-flagged events (53 and 41), above the first rows of each team's player table.",
    },
    {
      src: "/assets/gallery/player-tables.webp",
      width: 1592,
      height: 1290,
      caption: "Player tables",
      alt: "The Spain player table in the dashboard, with columns for player, pressures, CP pressures, CP events and player ID. A tooltip over the CP events header defines it as counterpress-flagged events of the seven supported types, offensive fouls excluded: a raw count, not a rating.",
    },
  ],
  [
    {
      src: "/assets/gallery/moments-360.webp",
      width: 1800,
      height: 1224,
      caption: "360° moments",
      alt: "The 360° moments view: a pitch showing every player visible in the snapshot of John Stones's pressure at 22:04 of the first half, with dashed distance rings at 5, 10 and 20 units around the action and England's attacking direction marked.",
    },
    {
      src: "/assets/gallery/spatial-context.webp",
      width: 1096,
      height: 1066,
      caption: "Spatial context",
      alt: "The spatial context card for the same pressure: 9 teammates and 9 opponents in the picture, the nearest opponent 2.897 units away, and players within 5, 10 and 20 units: 1 teammate and 1 opponent, 2 and 2, then 7 and 6.",
    },
  ],
]

export default function DashboardSection() {
  return (
    <section id="dashboard" aria-labelledby="dashboard-heading" className="bg-navy-900 py-24 text-chalk lg:py-32">
      <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-pitch-400 [font-stretch:125%]">THE DASHBOARD</p>
        <h2
          id="dashboard-heading"
          className="mt-4 max-w-[24ch] text-[clamp(2.25rem,4.2vw,4rem)] leading-[1.02] font-bold tracking-[-0.01em] text-balance [font-stretch:75%]"
        >
          A local, read-only view of verified data
        </h2>
        <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-balance text-haze sm:text-lg">
          Built with Streamlit. It reads prepared files, checks them, and never downloads or writes.
        </p>

        <BentoGallery rows={ROWS} className="mt-14 lg:mt-20" />

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <p className="text-sm leading-relaxed text-haze/80">Data: StatsBomb Open Data. Screens from the local dashboard.</p>
          <StatsBombLogo />
        </div>
      </div>
    </section>
  )
}
