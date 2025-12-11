import React, { Component } from "react";
import "./index.css";

class NotFound extends Component {
  render() {
    return (
      <div className="not-found-container">
        <svg
          width="260"
          height="260"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4caf50"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="notfound-svg"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="15" x2="16" y2="15" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
        <h2 className="not-found-title">404 — Page Not Found</h2>
      </div>
    );
  }
}

export default NotFound;
