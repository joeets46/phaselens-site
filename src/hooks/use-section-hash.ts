import { useEffect } from "react"

/**
 * Keeps the URL hash (#overview, #numbers, ...) in step with the section being read, using
 * history.replaceState so scrolling never adds history entries or moves the page.
 *
 * A section counts as current once it crosses a thin line 40% down the viewport. Above the
 * first section (the hero) the hash is cleared. A hash that is in the URL when the page loads
 * scrolls to that section and is left alone until the reader moves to another one, so shared
 * links work.
 */
export function useSectionHash(ids: readonly string[]) {
  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return

    // The page is rendered by script, so the browser's own jump to a #hash finds nothing at
    // load. Do it here, so a shared link like /#milestones opens at that section.
    const linked = ids.includes(decodeURIComponent(window.location.hash.slice(1)))
      ? document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
      : null
    const jumpToLinked = () => {
      if (linked) window.scrollTo({ top: linked.getBoundingClientRect().top + window.scrollY, behavior: "instant" })
    }
    let removeLoadListener: (() => void) | undefined
    if (linked && window.scrollY === 0) {
      jumpToLinked()
      // fonts and images can still shift the layout a little; correct once when loading ends
      if (document.readyState !== "complete") {
        window.addEventListener("load", jumpToLinked, { once: true })
        removeLoadListener = () => window.removeEventListener("load", jumpToLinked)
      }
    }

    const crossing = new Set<string>()
    let lastApplied: string | null = null

    const apply = () => {
      const current = ids.filter((id) => crossing.has(id)).at(-1) ?? null

      if (current === null) {
        // Nothing on the line: only the hero (above the first section) clears the hash.
        const aboveFirst = sections[0].getBoundingClientRect().top > window.innerHeight * 0.4
        if (!aboveFirst || lastApplied === null) return
        lastApplied = null
        history.replaceState(history.state, "", window.location.pathname + window.location.search)
        return
      }

      lastApplied = current
      if (window.location.hash !== `#${current}`) {
        history.replaceState(history.state, "", `#${current}`)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id)
          else crossing.delete(entry.target.id)
        }
        apply()
      },
      { rootMargin: "-40% 0px -59% 0px" },
    )
    sections.forEach((section) => observer.observe(section))
    return () => {
      observer.disconnect()
      removeLoadListener?.()
    }
  }, [ids])
}
