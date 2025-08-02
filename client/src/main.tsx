import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Error boundary for React
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
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
