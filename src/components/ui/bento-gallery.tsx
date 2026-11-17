import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

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
 * Clicking an image opens it in a lightbox on the same page (see `Lightbox`).
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

export function BentoGallery({ rows, className }: BentoGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const images = rows.flat()
  let next = 0

  return (
    <>
      <div className={cn("flex flex-col gap-10 lg:gap-12", className)}>
        {rows.map(([large, small]) => {
          const cols = `minmax(0,${(large.width / large.height).toFixed(4)}fr) minmax(0,${(small.width / small.height).toFixed(4)}fr)`
          const pair = [large, small]
          return (
            <div
              key={large.src}
              style={{ "--gallery-cols": cols } as CSSProperties}
              className="grid grid-cols-1 gap-x-6 gap-y-10 lg:grid-cols-(--gallery-cols)"
            >
              {pair.map((image) => {
                const index = next++
                return <GalleryFigure key={image.src} image={image} onOpen={() => setOpenIndex(index)} />
              })}
            </div>
          )
        })}
      </div>

      <Lightbox images={images} index={openIndex} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
    </>
  )
}

function GalleryFigure({ image, onOpen }: { image: GalleryImage; onOpen: () => void }) {
  return (
    <figure className="min-w-0">
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className={cn(
          "block w-full cursor-zoom-in overflow-hidden rounded-lg border border-chalk/10 bg-navy-950 p-0 text-left",
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
        <span className="sr-only"> (opens an enlarged view)</span>
      </button>
      <figcaption className="mt-3 text-sm font-medium text-chalk/90">{image.caption}</figcaption>
    </figure>
  )
}

/**
 * Full-size view of one gallery image over a dark overlay, built on the native modal
 * <dialog>: the browser traps focus inside it, makes the page behind inert, closes it on
 * Esc and returns focus to the button that opened it. On top of that this adds:
 * a click outside the image closes it, ← / → (and on-screen arrows) step through the
 * images and wrap around, and the page behind is locked against scrolling while open.
 *
 * The image is fitted to the screen. It is a plain <img> with no touch handlers, so on a
 * phone the browser's own pinch-zoom works on it. With prefers-reduced-motion there is
 * no fade or zoom.
 */
function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: readonly GalleryImage[]
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const pressStartedInside = useRef(false)
  const open = index !== null
  const image = index === null ? null : images[index]

  // Open and close the native dialog to follow `index`.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      opener.current = document.activeElement as HTMLElement | null
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // Lock page scroll while open; keep the layout from jumping when the scrollbar disappears.
  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const body = document.body
    const gap = window.innerWidth - root.clientWidth
    const previous = { overflow: root.style.overflow, paddingRight: body.style.paddingRight }
    root.style.overflow = "hidden"
    if (gap > 0) body.style.paddingRight = `${gap}px`
    return () => {
      root.style.overflow = previous.overflow
      body.style.paddingRight = previous.paddingRight
    }
  }, [open])

  const step = useCallback(
    (direction: 1 | -1) => {
      if (index === null) return
      onIndexChange((index + direction + images.length) % images.length)
    },
    [index, images.length, onIndexChange],
  )

  return (
    <dialog
      ref={dialogRef}
      aria-label="Enlarged image"
      // Esc (and dialog.close()) end up here: keep React's state in step and put focus back.
      onClose={() => {
        onClose()
        opener.current?.focus({ preventScroll: true })
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault()
          step(1)
        } else if (event.key === "ArrowLeft") {
          event.preventDefault()
          step(-1)
        }
      }}
      onPointerDown={(event) => {
        pressStartedInside.current = Boolean((event.target as HTMLElement).closest("[data-keep]"))
      }}
      onClick={(event) => {
        // A click on empty space closes; one that started on the image or a control does not.
        if (pressStartedInside.current || (event.target as HTMLElement).closest("[data-keep]")) return
        onClose()
      }}
      className={cn(
        "m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-navy-950/95 p-0 text-chalk backdrop:bg-transparent",
        "open:flex open:flex-col motion-safe:open:animate-lightbox-fade",
      )}
    >
      {image && index !== null && (
        <>
          <div className="flex shrink-0 justify-end p-3 sm:p-4">
            <button
              type="button"
              data-keep
              autoFocus
              onClick={onClose}
              aria-label="Close"
              className="grid size-11 cursor-pointer place-items-center rounded-full border border-chalk/15 bg-navy-800/80 text-chalk outline-none hover:border-chalk/30 hover:bg-navy-800 focus-visible:ring-2 focus-visible:ring-pitch-400"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center px-3 sm:px-6">
            {/* keyed so the image fades in when you step to another one */}
            <img
              key={image.src}
              data-keep
              src={image.src}
              width={image.width}
              height={image.height}
              alt={image.alt}
              className="block h-auto max-h-full w-auto max-w-full rounded-lg border border-chalk/10 object-contain motion-safe:animate-lightbox-zoom"
            />
          </div>

          <div className="flex shrink-0 items-center justify-center gap-3 p-3 sm:gap-6 sm:p-5">
            <button
              type="button"
              data-keep
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-chalk/15 bg-navy-800/80 text-chalk outline-none hover:border-chalk/30 hover:bg-navy-800 focus-visible:ring-2 focus-visible:ring-pitch-400"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <p data-keep className="min-w-0 text-center text-sm font-medium text-chalk sm:text-base">
              {image.caption}
              <span className="ml-3 font-normal text-haze tabular-nums">
                {index + 1} / {images.length}
              </span>
            </p>
            <button
              type="button"
              data-keep
              onClick={() => step(1)}
              aria-label="Next image"
              className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-chalk/15 bg-navy-800/80 text-chalk outline-none hover:border-chalk/30 hover:bg-navy-800 focus-visible:ring-2 focus-visible:ring-pitch-400"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>

          {/* announces the change when you step through with the arrows */}
          <p role="status" aria-live="polite" className="sr-only">
            {`${image.caption}, image ${index + 1} of ${images.length}`}
          </p>
        </>
      )}
    </dialog>
  )
}
