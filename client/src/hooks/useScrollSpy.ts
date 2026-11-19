import { useEffect, useState } from 'react'

/**
 * Tracks which section owns the viewport and keeps the nav highlight in sync.
 *
 * Sections are lazy-loaded, so the DOM is queried on every update (throttled
 * with requestAnimationFrame) and a MutationObserver re-checks when they mount.
 * This also keeps the highlight correct after clicking an anchor link.
 */
export function useScrollSpy(ids: readonly string[], fallback: string): string {
  const [activeId, setActiveId] = useState(fallback)
  const key = ids.join('|')

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0

      const sections = ids
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => element !== null)

      if (sections.length === 0) return

      // A section becomes active once its top crosses this line.
      const anchor = window.innerHeight * 0.28
      let current = sections[0].id

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= anchor) current = section.id
      }

      // At the very bottom the footer may push the last section above the
      // anchor line, so pin it explicitly.
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      if (atBottom) current = sections[sections.length - 1].id

      setActiveId((previous) => (previous === current ? previous : current))
    }

    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    const mutations = new MutationObserver(schedule)
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      mutations.disconnect()
    }
    // `key` captures the identity of the id list without re-running per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return activeId
}
