import { useEffect, useState, type RefObject } from "react"

/**
 * Becomes true the first time `ref` is at least `threshold` visible, then stays true.
 * Without IntersectionObserver it is true from the start, so nothing stays hidden.
 */
export function useInViewOnce(ref: RefObject<Element | null>, threshold = 0.3) {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === "undefined")

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, threshold, inView])

  return inView
}
