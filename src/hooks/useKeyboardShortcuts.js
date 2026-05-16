import { useEffect } from 'react'

export function useKeyboardShortcuts(handlers) {
  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

      if (e.key === 'Escape') { handlers.onEscape?.(); return }

      if (isInput) return

      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); handlers.onNew?.() }
      if (e.key === '?')                   { handlers.onHelp?.() }
      if (e.key === '/')                   { e.preventDefault(); handlers.onSearch?.() }
      if (e.key >= '1' && e.key <= '7')   { handlers.onView?.(+e.key - 1) }
      if (e.key === 'Delete' || e.key === 'Backspace') { handlers.onDelete?.() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handlers])
}
