import { Component, createRef } from 'react'
import { buildUiErrorDiagnostic, createUiCorrelationId } from '../../services/uiErrorDiagnostics'

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, correlationId: null }
    this.errorAlertRef = createRef()
    this.retry = this.retry.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { error, correlationId: createUiCorrelationId() }
  }

  componentDidCatch(error, info) {
    console.error(
      'Application rendering error',
      buildUiErrorDiagnostic(error, info, this.state.correlationId)
    )
  }

  componentDidUpdate(_prevProps, prevState) {
    if (!prevState.error && this.state.error) {
      this.errorAlertRef.current?.focus()
    }
  }

  retry() {
    this.setState({ error: null, correlationId: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <section className="max-w-md rounded-lg bg-white p-6 text-center shadow">
          <div
            ref={this.errorAlertRef}
            role="alert"
            aria-atomic="true"
            tabIndex={-1}
            className="focus:outline-none"
          >
            <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
            <p className="mt-2 text-slate-600">
              This part of the app could not be displayed. Please try again.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Reference ID: {this.state.correlationId}
            </p>
          </div>
          <button
            type="button"
            onClick={this.retry}
            className="mt-5 rounded bg-blue-600 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try again
          </button>
        </section>
      </main>
    )
  }
}

export default AppErrorBoundary
