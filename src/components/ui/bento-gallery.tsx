import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

/**
 * Bento-style screenshot gallery: rows of one large and one small image with a
 * caption under each. Layout idea from the 21st.dev "layout-grid" component
 * (large and small cells in a grid); its click-to-expand, framer-motion and
 * next/image parts are left out.
 *
 * Each row's columns are sized by the images' own aspect ratios (width / height
 * as `fr` units), so the two images in a row come out the same height at any
 * width and nothing is ever cropped. Below `lg` the rows stack.
 *
 * An image links to its full-size file in a new tab: screenshots of a UI are
 * hard to read when scaled down, and the hover lift should mean something.
 */

export interface GalleryImage {
  src: string
  /** Intrinsic size in pixels; only the ratio matters for layout. */
  width: number
  height: number
  alt: string
  caption: string
}

export type GalleryRow = readonly [large: GalleryImage, small: GalleryImage]

export interface BentoGalleryProps {
  rows: readonly GalleryRow[]
  className?: string
}

function GalleryFigure({ image }: { image: GalleryImage }) {
  return (
    <figure className="min-w-0">
      <a
        href={image.src}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "block overflow-hidden rounded-lg border border-chalk/10 bg-navy-950",
          "transition-[transform,border-color,box-shadow] duration-300 ease-out",
          "hover:border-pitch-500/40 hover:shadow-[0_20px_44px_-24px_rgb(0_0_0/0.7)] motion-safe:hover:-translate-y-1",
          "outline-none focus-visible:border-pitch-500/60 focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900",
        )}
      >
        <img
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
        <span className="sr-only"> (opens the full-size image in a new tab)</span>
      </a>
      <figcaption className="mt-3 text-sm font-medium text-chalk/90">{image.caption}</figcaption>
    </figure>
  )
}

export function BentoGallery({ rows, className }: BentoGalleryProps) {
  return (
    <div className={cn("flex flex-col gap-10 lg:gap-12", className)}>
      {rows.map(([large, small]) => {
        const cols = `minmax(0,${(large.width / large.height).toFixed(4)}fr) minmax(0,${(small.width / small.height).toFixed(4)}fr)`
        return (
          <div
            key={large.src}
            style={{ "--gallery-cols": cols } as CSSProperties}
            className="grid grid-cols-1 gap-x-6 gap-y-10 lg:grid-cols-(--gallery-cols)"
          >
            <GalleryFigure image={large} />
            <GalleryFigure image={small} />
          </div>
        )
      })}
    </div>
  )
}
