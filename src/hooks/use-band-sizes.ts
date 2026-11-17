import { useEffect, useMemo, useState } from "react"

/**
 * Heights, in px, of the fixed ridge band: `min` at the top of the page, `mid` through most of
 * the page, `max` over the last screen, when it meets the footer.
 */
export interface BandSizes {
  min: number
  mid: number
  max: number
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export function useBandSizes(): BandSizes {
  const [view, setView] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))

  useEffect(() => {
    const onResize = () => setView({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  return useMemo(() => {
    const wide = view.w >= 640
    const min = wide ? 100 : 56
    return wide
      ? { min, mid: 160, max: Math.round(clamp(view.h * 0.4, 300, 440)) }
      : { min, mid: 90, max: Math.round(clamp(view.h * 0.25, 150, 220)) }
  }, [view])
}
