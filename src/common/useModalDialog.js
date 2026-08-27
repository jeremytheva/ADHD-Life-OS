import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

const getFocusableElements = (container) => Array.from(
  container?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []
).filter((element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true')

export const useModalDialog = ({ onEscape, initialFocusRef } = {}) => {
  const dialogRef = useRef(null)
  const openerRef = useRef(null)
  const onEscapeRef = useRef(onEscape)

  useEffect(() => {
    onEscapeRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    const focusFrame = window.requestAnimationFrame(() => {
      const initialTarget = initialFocusRef?.current
      if (initialTarget && !initialTarget.disabled) {
        initialTarget.focus()
        return
      }
      dialogRef.current?.focus()
    })

    const handleKeyDown = (event) => {
      const dialog = dialogRef.current
      if (!dialog) return

      if (event.key === 'Escape' && onEscapeRef.current) {
        event.preventDefault()
        onEscapeRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = getFocusableElements(dialog)
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)

      const opener = openerRef.current
      if (opener?.isConnected) {
        window.requestAnimationFrame(() => opener.focus())
      }
    }
  }, [initialFocusRef])

  return dialogRef
}

export default useModalDialog
