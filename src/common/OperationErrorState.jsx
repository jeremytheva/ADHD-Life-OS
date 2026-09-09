import React, { useEffect, useRef } from 'react'

const OperationErrorState = ({ message, onDismiss }) => {
  const alertRef = useRef(null)

  useEffect(() => {
    if (message) alertRef.current?.focus()
  }, [message])

  if (!message) return null

  return (
    <div
      ref={alertRef}
      role="alert"
      tabIndex={-1}
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm">{message}</p>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-sm font-medium text-red-700 hover:text-red-900"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  )
}

export default OperationErrorState
