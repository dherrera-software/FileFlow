
export function announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
  const node = document.getElementById('a11y-announcer');
  if (node) {
    node.setAttribute('aria-live', politeness);
    node.textContent = '';
    setTimeout(() => {
      node.textContent = message;
    }, 100);
  }
}

export function trapFocus(element: HTMLElement) {
  const focusable = element.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    if (e.key === 'Escape') {
      element.removeEventListener('keydown', handleKeyDown);
    }
  };
  element.addEventListener('keydown', handleKeyDown);
  first?.focus();
}

export function focusFirstFocusable(element: HTMLElement) {
  const focusable = element.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  focusable?.focus();
}

export const visuallyHidden = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap' as const,
  border: '0'
} as const;
