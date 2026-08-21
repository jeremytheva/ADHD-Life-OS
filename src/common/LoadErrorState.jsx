import React from 'react'

const LoadErrorState = ({
  title = 'We couldn’t load this right now',
  message = 'Your data has not been removed. Please try again.',
  onRetry
}) => (
  <div
    role="alert"
    className="rounded-lg border border-red-200 bg-red-50 p-6 text-center"
  >
    <h2 className="text-lg font-medium text-red-900">{title}</h2>
    <p className="mt-2 text-sm text-red-700">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Try again
      </button>
    )}
  </div>
)

export default LoadErrorState
