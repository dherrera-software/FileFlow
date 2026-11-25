export function navigateToSection(sectionId: string) {
  const isFeedback =
    window.location.hash.toLowerCase().startsWith('#/feedback') ||
    window.location.hash.toLowerCase().startsWith('#/comentarios')

  if (isFeedback) {
    window.location.hash = `#${sectionId}`
    return
  }

  const el = document.getElementById(sectionId)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (window.location.hash !== `#${sectionId}`) {
      window.history.pushState(null, '', `#${sectionId}`)
    }
  } else if (sectionId === 'convert' || sectionId === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (window.location.hash !== '#convert') {
      window.history.pushState(null, '', '#convert')
    }
  }
}
