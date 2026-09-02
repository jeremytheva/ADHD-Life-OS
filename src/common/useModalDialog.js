import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',')

const modalStack = []

const isVisibleFocusable = (element) => {
  if (
    element.hasAttribute('hidden') ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.closest('[hidden], [aria-hidden="true"], [inert]')
  ) {
    return false
  }

  const style = window.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0
}

const getFocusableElements = (container) => Array.from(
  container?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []
).filter(isVisibleFocusable)

const isTopModal = (dialogRef) => modalStack[modalStack.length - 1] === dialogRef

const removeModal = (dialogRef) => {
  const index = modalStack.lastIndexOf(dialogRef)
  if (index >= 0) modalStack.splice(index, 1)
}

export const useModalDialog = ({ onEscape, initialFocusRef, enabled = true } = {}) => {
  const dialogRef = useRef(null)
  const openerRef = useRef(null)
  const onEscapeRef = useRef(onEscape)

  useEffect(() => {
    onEscapeRef.current = onEscape
  }, [onEscape])

  useEffect(() => {
    if (!enabled) return undefined

    openerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    modalStack.push(dialogRef)

    const focusFrame = window.requestAnimationFrame(() => {
      if (!isTopModal(dialogRef)) return

      const initialTarget = initialFocusRef?.current
      if (initialTarget && !initialTarget.disabled) {
        initialTarget.focus()
        return
      }
      dialogRef.current?.focus()
    })

    const handleKeyDown = (event) => {
      const dialog = dialogRef.current
      if (!dialog || !isTopModal(dialogRef)) return

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
      removeModal(dialogRef)

      const opener = openerRef.current
      if (opener?.isConnected) {
        window.requestAnimationFrame(() => {
          const activeDialog = modalStack[modalStack.length - 1]?.current
          if (!activeDialog || activeDialog.contains(opener)) opener.focus()
        })
      }
    }
  }, [enabled, initialFocusRef])

  return dialogRef
}

export default useModalDialog
