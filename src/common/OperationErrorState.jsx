import React from 'react'

const OperationErrorState = ({ message, onDismiss }) => {
  if (!message) return null

  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
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
