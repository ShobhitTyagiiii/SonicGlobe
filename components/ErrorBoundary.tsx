"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Rendered in place of the children once an error is caught. */
  fallback?: ReactNode;
  /** Notified when an error is caught (e.g. to flip app-level state). */
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
}

/**
 * Minimal error boundary. Used to isolate the WebGL globe so that if it throws
 * (e.g. a browser can't create a WebGL context) it degrades gracefully instead
 * of tearing down the whole app — including the music panel.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
