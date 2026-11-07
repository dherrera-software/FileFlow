import { useEffect, useState } from 'react'

/**
 * Tracks which section owns the viewport using IntersectionObserver.
 * Nav highlighting therefore never depends on scroll-position math or
 * scroll-driven animation.
 */
export function useScrollSpy(ids: readonly string[], fallback: string): string {
  const [activeId, setActiveId] = useState(fallback)
  const key = ids.join('|')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-18% 0px -66% 0px', threshold: [0, 0.2, 0.5, 1] },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
    // `key` captures the identity of the id list without re-observing each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return activeId
}
