import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Error boundary for React
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('React Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', null, 'Something went wrong. Please refresh the page.');
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  React.createElement(ErrorBoundary, null, React.createElement(App))
);
